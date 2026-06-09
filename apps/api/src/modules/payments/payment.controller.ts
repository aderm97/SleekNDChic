import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/config/database';
import { AppError } from '@/shared/middleware/errorHandler';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
  console.warn('[payments] PAYSTACK_SECRET_KEY not set — payment endpoints will fail');
}

const initializeSchema = z.object({
  orderId: z.string().min(1),
});

async function paystackRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${PAYSTACK_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as any).message || 'Paystack API error');
  }
  return data;
}

export async function initializePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId } = initializeSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }

    if (order.paymentStatus !== 'PENDING') {
      throw new AppError(400, 'INVALID_PAYMENT_STATUS', 'Order is not pending payment');
    }

    const reference = `SNK-${order.orderNumber}-${Date.now()}`;
    const amountInKobo = Math.round(Number(order.totalAmount) * 100);
    if (!process.env.FRONTEND_URL) {
      throw new AppError(500, 'CONFIG_ERROR', 'FRONTEND_URL is not configured');
    }
    const callbackUrl = `${process.env.FRONTEND_URL}/payment/verify`;

    const payload = {
      email: order.customerEmail,
      amount: amountInKobo,
      reference,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      callback_url: callbackUrl,
    };

    const data = await paystackRequest('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    res.json({
      data: {
        authorizationUrl: (data as any).data.authorization_url,
        reference: (data as any).data.reference,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { reference } = req.params;

    const data = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
    });

    const transaction = (data as any).data;

    if (transaction.status === 'success') {
      const orderId = transaction.metadata?.orderId;

      let order = null;
      if (orderId) {
        order = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            paymentTransactionId: reference,
          },
        });
      }

      res.json({
        status: 'success',
        order,
      });
    } else {
      const orderId = transaction.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
          },
        });
      }

      res.json({
        status: 'failed',
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function paystackWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!signature) {
      return res.status(400).send('Missing x-paystack-signature header');
    }

    const rawBody = req.body as Buffer;
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY as string)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(rawBody.toString('utf8'));

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const orderId = event.data.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            paymentTransactionId: reference,
          },
        });
      }
    } else if (event.event === 'charge.failed') {
      const orderId = event.data.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
          },
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[payments] Webhook processing error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(400).json({ error: 'Webhook processing failed' });
  }
}

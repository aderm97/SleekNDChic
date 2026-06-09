import sgMail from '@sendgrid/mail';
import { AppError } from '@/shared/middleware/errorHandler';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@sleekndchic.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  color?: string;
}

interface OrderDetails {
  orderNumber: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
}

// Email templates
const emailTemplates = {
  orderConfirmation: (order: OrderDetails): { subject: string; html: string; text: string } => {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
          ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
          ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.totalPrice.toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - SleekNDChic</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #C08081; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SleekNDChic</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Thank you for your order!</h2>
            <p style="color: #666; line-height: 1.6;">
              Hi there,<br><br>
              We're excited to confirm your order. Here are the details:
            </p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Status:</strong> ${order.status}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod === 'CARD' ? 'Card Payment' : 'Bank Transfer'}</p>
            </div>
            
            <h3 style="color: #333; margin-top: 30px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666;">Product</th>
                  <th style="padding: 10px; text-align: center; font-size: 12px; text-transform: uppercase; color: #666;">Qty</th>
                  <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #666;">Price</th>
                  <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase; color: #666;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
              <table style="width: 100%;">
                <tr>
                  <td style="text-align: right; padding: 5px;">Subtotal:</td>
                  <td style="text-align: right; padding: 5px; width: 120px;">₦${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 5px;">Shipping:</td>
                  <td style="text-align: right; padding: 5px;">₦${order.shippingCost.toLocaleString()}</td>
                </tr>
                ${order.discountAmount > 0 ? `
                <tr>
                  <td style="text-align: right; padding: 5px; color: #C08081;">Discount:</td>
                  <td style="text-align: right; padding: 5px; color: #C08081;">-₦${order.discountAmount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr style="font-size: 18px; font-weight: bold;">
                  <td style="text-align: right; padding: 10px 5px;">Total:</td>
                  <td style="text-align: right; padding: 10px 5px; color: #C08081;">₦${order.totalAmount.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 6px;">
              <h4 style="margin-top: 0; color: #333;">Shipping Address</h4>
              <p style="color: #666; margin: 5px 0; line-height: 1.6;">
                ${order.shippingAddress.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #666; font-size: 14px;">
                If you have any questions about your order, please contact us at 
                <a href="mailto:support@sleekndchic.com" style="color: #C08081;">support@sleekndchic.com</a>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #ffffff; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} SleekNDChic. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Thank you for your order!

Order Number: ${order.orderNumber}
Order Status: ${order.status}
Payment Method: ${order.paymentMethod === 'CARD' ? 'Card Payment' : 'Bank Transfer'}

Order Items:
${order.items.map(item => `
- ${item.name}
  ${item.size ? `Size: ${item.size}` : ''} ${item.color ? `Color: ${item.color}` : ''}
  Quantity: ${item.quantity}
  Price: ₦${item.unitPrice.toLocaleString()}
  Total: ₦${item.totalPrice.toLocaleString()}
`).join('')}

Order Summary:
Subtotal: ₦${order.subtotal.toLocaleString()}
Shipping: ₦${order.shippingCost.toLocaleString()}
${order.discountAmount > 0 ? `Discount: -₦${order.discountAmount.toLocaleString()}\n` : ''}
Total: ₦${order.totalAmount.toLocaleString()}

Shipping Address:
${order.shippingAddress}

If you have any questions, please contact us at support@sleekndchic.com

© ${new Date().getFullYear()} SleekNDChic. All rights reserved.
    `;

    return {
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
      text,
    };
  },

  shippingNotification: (order: OrderDetails & { trackingNumber?: string }): { subject: string; html: string; text: string } => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped - SleekNDChic</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #C08081; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SleekNDChic</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Your Order Has Shipped!</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Great news!</h2>
            <p style="color: #666; line-height: 1.6;">
              Hi there,<br><br>
              Your order <strong>${order.orderNumber}</strong> has been shipped and is on its way to you!
            </p>
            
            ${order.trackingNumber ? `
            <div style="background-color: #e8f5e9; border: 1px solid #4caf50; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #2e7d32;">Tracking Information</h4>
              <p style="margin: 5px 0; color: #333;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                You can use this tracking number to monitor your delivery progress.
              </p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px;">
              <h3 style="color: #333;">Order Summary</h3>
              <p style="color: #666;">
                <strong>Order Number:</strong> ${order.orderNumber}<br>
                <strong>Total Items:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}<br>
                <strong>Total Amount:</strong> ₦${order.totalAmount.toLocaleString()}
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #666; font-size: 14px;">
                Thank you for shopping with SleekNDChic!
              </p>
            </div>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #ffffff; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} SleekNDChic. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Your Order Has Shipped!

Great news! Your order ${order.orderNumber} has been shipped and is on its way to you!

${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}

You can use this tracking number to monitor your delivery progress.

` : ''}
Order Summary:
Order Number: ${order.orderNumber}
Total Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}
Total Amount: ₦${order.totalAmount.toLocaleString()}

Thank you for shopping with SleekNDChic!

© ${new Date().getFullYear()} SleekNDChic. All rights reserved.
    `;

    return {
      subject: `Your Order Has Shipped - ${order.orderNumber}`,
      html,
      text,
    };
  },
};

// Send email function
export async function sendEmail(
  to: string,
  template: 'orderConfirmation' | 'shippingNotification',
  orderData: OrderDetails & { trackingNumber?: string }
): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return;
  }

  try {
    const { subject, html, text } = emailTemplates[template](orderData);

    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully: ${template} to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw error to avoid breaking order flow
    // Just log it for monitoring
  }
}

// Send order confirmation email
export async function sendOrderConfirmation(order: OrderDetails): Promise<void> {
  await sendEmail(order.customerEmail, 'orderConfirmation', order);
}

// Send shipping notification email
export async function sendShippingNotification(
  order: OrderDetails,
  trackingNumber: string
): Promise<void> {
  await sendEmail(order.customerEmail, 'shippingNotification', { ...order, trackingNumber });
}

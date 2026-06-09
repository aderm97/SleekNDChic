import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/shared/lib/api';
import { LoadingSpinner } from '@/shared/components/ui';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type VerifyStatus = 'loading' | 'success' | 'failed' | 'error';

export function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [orderNumber, setOrderNumber] = useState<string>('');

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      return;
    }

    async function verifyPayment() {
      try {
        const response = await api.get(`/payments/verify/${encodeURIComponent(reference!)}`);
        const data = response.data;

        if (data.status === 'success' && data.order) {
          setStatus('success');
          setOrderNumber(data.order.orderNumber);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('error');
      }
    }

    verifyPayment();
  }, [reference]);

  return (
    <div className="container-custom section-padding">
      <div className="max-w-lg mx-auto text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <LoadingSpinner size="lg" />
            <h1 className="font-serif text-2xl font-semibold text-gray-900">
              Verifying your payment...
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your transaction.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-gray-900">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your payment has been confirmed and your order is being processed.
            </p>
            {orderNumber && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-semibold text-gray-900">{orderNumber}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {orderNumber && (
                <Link
                  to={`/order/${orderNumber}`}
                  className="btn-primary"
                >
                  View Order
                </Link>
              )}
              <Link to="/shop" className="btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-gray-900">
              Payment Failed
            </h1>
            <p className="text-gray-600">
              Your payment could not be completed. No charge has been made to your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/checkout" className="btn-primary">
                Try Again
              </Link>
              <Link to="/shop" className="btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-gray-900">
              Verification Error
            </h1>
            <p className="text-gray-600">
              We couldn't verify your payment at this time. If you were charged,
              please contact our support team with your transaction reference.
            </p>
            {reference && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Transaction Reference</p>
                <p className="text-sm font-mono text-gray-900 break-all">{reference}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(0)}
                className="btn-primary"
              >
                Retry Verification
              </button>
              <Link to="/" className="btn-secondary">
                Go Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Button, Input, Select } from '@/shared/components/ui';
import { formatPrice } from '@/shared/lib/utils';
import { useShippingStates } from '@/features/checkout/hooks/useShipping';
import { useCreateOrder } from '@/features/checkout/hooks/useCheckout';
import { useToast } from '@/shared/components/ui';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(4, 'ZIP code is required'),
  country: z.string().default('US'),
  paymentMethod: z.enum(['card', 'bank_transfer']),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const { data: shippingStates } = useShippingStates();
  const createOrder = useCreateOrder();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'US',
      paymentMethod: 'card',
    },
  });

  const selectedState = watch('state');
  const paymentMethod = watch('paymentMethod');

  // Calculate shipping cost
  const shippingCost = selectedState
    ? shippingStates?.data.find((s) => s.stateName === selectedState)?.price || 0
    : 0;

  const total = subtotal() + shippingCost;

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    try {
      const order = await createOrder.mutateAsync({
        email: data.email,
        phone: data.phone,
        address: {
          state: data.state,
          city: data.city,
          street: data.address,
          zip: data.zip,
          country: data.country,
        },
        paymentMethod: data.paymentMethod,
      });

      clearCart();
      navigate(`/order/${order.data.orderNumber}`);
    } catch (error) {
      addToast('Failed to create order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stateOptions = shippingStates?.data.map((s) => ({
    value: s.stateName,
    label: `${s.stateName} - ${formatPrice(s.price)}`,
  })) || [];

  return (
    <div className="container-custom section-padding">
      <h1 className="font-serif text-3xl font-semibold text-gray-900 mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-8 space-y-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Phone"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
                <Input
                  label="Last Name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
              <Input
                label="Address"
                {...register('address')}
                error={errors.address?.message}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  {...register('city')}
                  error={errors.city?.message}
                />
                <Select
                  label="State"
                  options={[
                    { value: '', label: 'Select state' },
                    ...stateOptions,
                    { value: 'Other', label: 'Other (we will contact you)' },
                  ]}
                  {...register('state')}
                  error={errors.state?.message}
                />
                <Input
                  label="ZIP Code"
                  {...register('zip')}
                  error={errors.zip?.message}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="card"
                  {...register('paymentMethod')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    Credit/Debit Card
                  </span>
                  <span className="block text-sm text-gray-500">
                    Pay securely with your card
                  </span>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="bank_transfer"
                  {...register('paymentMethod')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    Bank Transfer
                  </span>
                  <span className="block text-sm text-gray-500">
                    Pay via bank transfer (order processed after confirmation)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-gray-500"> x {item.quantity}</span>
                  </div>
                  <span>{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {shippingCost > 0 ? formatPrice(shippingCost) : 'Calculated'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-medium text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-6"
              isLoading={isSubmitting}
            >
              {paymentMethod === 'card' ? 'Pay Now' : 'Place Order'}
            </Button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

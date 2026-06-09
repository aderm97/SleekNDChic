import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Button } from '@/shared/components/ui';
import { formatPrice } from '@/shared/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCartStore();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Shopping Cart ({totalItems()})
                      </h2>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={closeCart}
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg">Your cart is empty</p>
                          <p className="text-gray-400 text-sm mt-2">
                            Add some items to get started
                          </p>
                          <Button
                            variant="primary"
                            className="mt-6"
                            onClick={closeCart}
                            asChild
                          >
                            <Link to="/shop">Continue Shopping</Link>
                          </Button>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {items.map((item) => (
                            <li key={item.id} className="py-6 flex">
                              {/* Product Image */}
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                {item.product.images?.[0] ? (
                                  <img
                                    src={item.product.images[0].url}
                                    alt={item.product.images[0].altText || item.product.name}
                                    className="h-full w-full object-cover object-center"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between">
                                    <h3 className="text-base font-medium text-gray-900">
                                      <Link
                                        to={`/product/${item.product.id}`}
                                        onClick={closeCart}
                                      >
                                        {item.product.name}
                                      </Link>
                                    </h3>
                                    <p className="ml-4 text-base font-medium text-gray-900">
                                      {formatPrice(item.totalPrice)}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.variant.size && `Size: ${item.variant.size}`}
                                    {item.variant.size && item.variant.color && ' / '}
                                    {item.variant.color && `Color: ${item.variant.color}`}
                                  </p>
                                </div>

                                <div className="flex flex-1 items-end justify-between text-sm">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                      className="p-2 hover:bg-gray-100"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-3 font-medium">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                      className="p-2 hover:bg-gray-100"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.variantId)}
                                    className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                          <p>Subtotal</p>
                          <p>{formatPrice(subtotal())}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 mb-6">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          onClick={closeCart}
                          asChild
                        >
                          <Link to="/checkout">Checkout</Link>
                        </Button>
                        <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                          <button
                            type="button"
                            className="font-medium text-primary hover:text-primary-dark"
                            onClick={closeCart}
                          >
                            Continue Shopping
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

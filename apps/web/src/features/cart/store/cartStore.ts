import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Variant } from '@/shared/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (product: Product, variant: Variant, quantity: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.variantId === variant.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.variantId === variant.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      totalPrice: (item.quantity + quantity) * item.unitPrice,
                    }
                  : item
              ),
            };
          }

          const newItem: CartItem = {
            id: `${product.id}-${variant.id}-${Date.now()}`,
            variantId: variant.id,
            productId: product.id,
            product,
            variant,
            quantity,
            unitPrice: product.basePrice,
            totalPrice: product.basePrice * quantity,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? {
                  ...item,
                  quantity,
                  totalPrice: quantity * item.unitPrice,
                }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },
    }),
    {
      name: 'sleekndchic-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

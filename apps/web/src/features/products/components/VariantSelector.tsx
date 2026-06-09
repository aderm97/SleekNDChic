import { Variant } from '@/shared/types';
import { getStockStatus, getStockStatusLabel } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelectVariant: (variant: Variant) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  size = 'md',
}: VariantSelectorProps) {
  // Group variants by size and color
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  const sizeClasses = {
    sm: 'h-8 min-w-[2rem] px-2 text-xs',
    md: 'h-10 min-w-[2.5rem] px-3 text-sm',
    lg: 'h-12 min-w-[3rem] px-4 text-base',
  };

  const colorSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Size {selectedVariant?.size && `- ${selectedVariant.size}`}
          </h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = variants.find((v) => v.size === size);
              const isSelected = selectedVariant?.size === size;
              const isOutOfStock = variant?.stockQuantity === 0;

              return (
                <button
                  key={size}
                  onClick={() => variant && onSelectVariant(variant)}
                  disabled={isOutOfStock}
                  className={cn(
                    'border rounded-md font-medium transition-all',
                    sizeClasses[size as keyof typeof sizeClasses],
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                    isOutOfStock && 'opacity-50 cursor-not-allowed line-through'
                  )}
                  title={isOutOfStock ? 'Out of stock' : size}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Color {selectedVariant?.color && `- ${selectedVariant.color}`}
          </h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const variant = variants.find((v) => v.color === color);
              const isSelected = selectedVariant?.color === color;
              const isOutOfStock = variant?.stockQuantity === 0;

              return (
                <button
                  key={color}
                  onClick={() => variant && onSelectVariant(variant)}
                  disabled={isOutOfStock}
                  className={cn(
                    'rounded-full border-2 transition-all flex items-center justify-center',
                    colorSizeClasses[size],
                    isSelected
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-gray-200 hover:border-gray-300',
                    isOutOfStock && 'opacity-50 cursor-not-allowed'
                  )}
                  title={isOutOfStock ? `${color} - Out of stock` : color}
                >
                  <span
                    className="w-full h-full rounded-full"
                    style={{
                      backgroundColor: getColorHex(color || ''),
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="text-sm text-gray-600">
          <span
            className={cn(
              'inline-flex items-center gap-1.5',
              selectedVariant.stockQuantity > 5
                ? 'text-green-600'
                : selectedVariant.stockQuantity > 0
                ? 'text-amber-600'
                : 'text-red-600'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                selectedVariant.stockQuantity > 5
                  ? 'bg-green-600'
                  : selectedVariant.stockQuantity > 0
                  ? 'bg-amber-600'
                  : 'bg-red-600'
              )}
            />
            {getStockStatusLabel(getStockStatus(selectedVariant))}
            {selectedVariant.stockQuantity > 0 &&
              ` (${selectedVariant.stockQuantity} available)`}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper to convert color names to hex (simplified)
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
    gray: '#6B7280',
    navy: '#1E3A8A',
    beige: '#F5F5DC',
    brown: '#92400E',
    orange: '#F97316',
    teal: '#14B8A6',
    cream: '#FFFDD0',
    burgundy: '#800020',
  };

  const normalizedColor = color.toLowerCase();
  return colorMap[normalizedColor] || '#9CA3AF';
}

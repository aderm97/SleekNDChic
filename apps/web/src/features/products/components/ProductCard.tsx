import { Link } from 'react-router-dom';
import { Product } from '@/shared/types';
import { formatPrice, getStockStatus } from '@/shared/lib/utils';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0];
  const hasVariants = product.variants && product.variants.length > 0;
  const firstVariant = product.variants?.[0];
  const stockStatus = firstVariant ? getStockStatus(firstVariant) : 'out_of_stock';

  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.altText || product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />

        {/* Quick Add Button */}
        {stockStatus !== 'out_of_stock' && (
          <Link
            to={`/product/${product.id}`}
            className="absolute bottom-4 left-4 right-4 bg-white text-gray-900 py-3 px-4 rounded-md font-medium text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-center hover:bg-gray-50"
          >
            Quick View
          </Link>
        )}

        {/* Out of Stock Badge */}
        {stockStatus === 'out_of_stock' && (
          <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 text-xs font-medium rounded">
            Out of Stock
          </div>
        )}

        {/* Low Stock Badge */}
        {stockStatus === 'low_stock' && (
          <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 text-xs font-medium rounded">
            Low Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900">
          <Link to={`/product/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(product.basePrice)}
          </p>
          {hasVariants && (
            <p className="text-xs text-gray-500">
              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

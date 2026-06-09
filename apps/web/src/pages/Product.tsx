import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { useProduct } from '@/features/products/hooks/useProducts';
import { VariantSelector } from '@/features/products/components/VariantSelector';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Button, PageLoader } from '@/shared/components/ui';
import { formatPrice, getStockStatus } from '@/shared/lib/utils';
import { useToast } from '@/shared/components/ui';

export function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productResponse, isLoading } = useProduct(id || '');
  const { addItem, openCart } = useCartStore();
  const { addToast } = useToast();
  
  const [selectedVariant, setSelectedVariant] = useState(productResponse?.data.variants[0] || null);
  const [quantity, setQuantity] = useState(1);

  const product = productResponse?.data;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  const stockStatus = selectedVariant ? getStockStatus(selectedVariant) : 'out_of_stock';
  const canAddToCart = selectedVariant && stockStatus !== 'out_of_stock';

  const handleAddToCart = () => {
    if (!selectedVariant || !canAddToCart) return;

    addItem(product, selectedVariant, quantity);
    addToast('Added to cart successfully!', 'success');
    openCart();
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stockQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const mainImage = product.images?.[0];

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
              {mainImage ? (
                <img
                  src={mainImage.url}
                  alt={mainImage.altText || product.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ShoppingBag className="h-20 w-20 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    className="aspect-square overflow-hidden rounded-md bg-gray-100 hover:opacity-75 transition-opacity"
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.name} - ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-medium text-gray-900">
                {formatPrice(product.basePrice)}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-gray-600">
              <p>{product.description}</p>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={(variant) => {
                  setSelectedVariant(variant);
                  setQuantity(1);
                }}
              />
            )}

            {/* Quantity Selector */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quantity</h4>
              <div className="flex items-center border border-gray-300 rounded-md w-fit">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 font-medium min-w-[4rem] text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (selectedVariant?.stockQuantity || 1)}
                  className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
              >
                {stockStatus === 'out_of_stock' ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Product Info */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500" />
                <span>Easy returns within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

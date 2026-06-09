import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { useProducts, useCategories } from '@/features/products/hooks/useProducts';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  
  const { data: products, isLoading } = useProducts({ category, search });
  const { data: categories } = useCategories();

  const handleCategoryChange = (catId: string | null) => {
    if (catId) {
      searchParams.set('category', catId);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (value: string) => {
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = category || search;

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            {category 
              ? categories?.data.find(c => c.id === category)?.name || 'Shop'
              : search 
                ? `Search: "${search}"`
                : 'All Products'
            }
          </h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  defaultValue={search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden sm:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    !category 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  All Products
                </button>
                {categories?.data.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      category === cat.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          {isMobileFiltersOpen && (
            <div className="sm:hidden fixed inset-0 z-50 bg-white p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Filters</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleCategoryChange(null);
                    setIsMobileFiltersOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-3 rounded-md text-base',
                    !category 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  All Products
                </button>
                {categories?.data.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategoryChange(cat.id);
                      setIsMobileFiltersOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-3 rounded-md text-base',
                      category === cat.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid 
              products={products?.data || []} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

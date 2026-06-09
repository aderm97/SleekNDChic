import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui';

export function NotFound() {
  return (
    <div className="container-custom section-padding">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-primary mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/shop">Browse Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

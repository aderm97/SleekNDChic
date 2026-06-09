import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { LoadingSpinner } from '@/shared/components/ui/Loading';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedAdminRoute({ children, requireAdmin = false }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading, isAdmin, isStaff } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Requires admin but user is staff only
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Requires staff (admin or staff) but user is neither
  if (!isStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

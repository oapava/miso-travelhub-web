import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface B2BProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for B2B pages.
 * Redirects unauthenticated users to the B2B login page.
 */
const B2BProtectedRoute: React.FC<B2BProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/business/login" replace />;
  }

  return <>{children}</>;
};

export default B2BProtectedRoute;

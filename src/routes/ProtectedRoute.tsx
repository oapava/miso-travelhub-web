import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { B2CRoutes } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={B2CRoutes.HOME} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

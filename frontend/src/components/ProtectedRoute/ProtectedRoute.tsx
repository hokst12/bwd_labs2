import { Navigate } from 'react-router-dom';
import { authService } from '../../api/auth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../api/auth';
import { useEffect, type JSX } from 'react';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Доступ запрещён. Перенаправление на страницу входа...');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};
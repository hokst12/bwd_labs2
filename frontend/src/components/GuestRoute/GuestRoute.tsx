import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../api/auth';
import { useEffect, type JSX } from 'react';

export const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Вы уже авторизованы. Перенаправление на страницу мероприятий...');
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/events';
    return <Navigate to={from} replace />;
  }

  return children;
};
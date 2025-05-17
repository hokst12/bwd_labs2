import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Main } from './pages/Main';
import { Auth } from './pages/Auth';
import { Register } from './pages/Register';
import { Events } from './pages/Events';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { EventsList } from './pages/Events/components/EventsList';
import { EventForm } from './pages/Events/components/EventForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Main />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/events',
    element: <Events />, // Основной layout
    children: [
      {
        path: '', // /events
        element: <EventsList />,
      },
      {
        path: 'new', // /events/new
        element: (
          <ProtectedRoute>
            <EventForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'edit/:id', // /events/edit/:id
        element: (
          <ProtectedRoute>
            <EventForm />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export const Router = () => <RouterProvider router={router} />;
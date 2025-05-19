import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Main } from './pages/Main';
import { Auth } from './pages/Auth';
import { Register } from './pages/Register';
import { Events } from './pages/Events';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { EventsList } from './pages/Events/components/EventsList';
import { EventForm } from './pages/Events/components/EventForm';
import { GuestRoute } from './components/GuestRoute/GuestRoute';
import { authService } from './api/auth';
import { Profile } from './pages/Profile/Profile';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Main />,
  },
  {
    path: '/auth',
    element: (
      <GuestRoute>
        <Auth />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/events',
    element: (
        <Events />
    ),
    children: [
      {
        path: '', // /events
        element: <EventsList />,
      },
      {
        path: 'new', // /events/new
        element: <EventForm />,
      },
      {
        path: 'edit/:id', // /events/edit/:id
        element: <EventForm />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export const Router = () => <RouterProvider router={router} />;

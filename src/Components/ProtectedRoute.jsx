import { Navigate, Outlet } from 'react-router-dom';
import useStore from '../store/useStore.js';

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (role && user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

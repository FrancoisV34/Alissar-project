import { Navigate, Outlet } from 'react-router-dom';
import useStore from '../store/useStore.js';

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useStore();
  const allowedRoles = Array.isArray(role) ? role : (role ? [role] : null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}

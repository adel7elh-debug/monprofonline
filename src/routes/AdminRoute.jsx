import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/roles';

export default function AdminRoute() {
  const { user, profile, profileLoading, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading || profileLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user && !profile) return <LoadingSpinner />;
  if (!isAdmin(profile)) return <Navigate to="/access-pending" replace />;
  return <Outlet />;
}

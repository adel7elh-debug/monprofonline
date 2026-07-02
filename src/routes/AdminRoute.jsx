import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/roles';

export default function AdminRoute() {
  const { user, profile, profileLoading, loading } = useAuth();
  if (loading || profileLoading) return <LoadingSpinner />;
  if (user && !profile) return <LoadingSpinner />;
  if (!isAdmin(profile)) return <Navigate to="/access-pending" replace />;
  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, profile, profileLoading, profileError, loading } = useAuth();
  const location = useLocation();
  console.log('PROTECTED ROUTE CHECK', {
    user,
    profile,
    loading,
  });
  if (loading || profileLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!profile && profileError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Profil introuvable pour cet utilisateur
        </div>
      </div>
    );
  }
  if (user && !profile) return <LoadingSpinner />;
  return <Outlet />;
}

import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getStudentPack } from '../lib/dataService';
import { isActiveStudent } from '../utils/roles';

export default function StudentRoute() {
  const { user, profile, profileLoading, profileError, loading } = useAuth();
  const [pack, setPack] = useState(null);
  const [accessError, setAccessError] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setChecking(true);
    setAccessError(null);
    setPack(null);

    if (!profile?.id) {
      setChecking(false);
      return;
    }

    getStudentPack(profile.id)
      .then((activePack) => {
        setPack(activePack);
        console.log('Student access check', { profile, activePack });
      })
      .catch((error) => {
        console.error('Student access check failed:', {
          profile,
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setPack(null);
        setAccessError(error);
      })
      .finally(() => setChecking(false));
  }, [profile?.id, profile?.role, profile?.access_status]);

  console.log('STUDENT ROUTE CHECK', {
    profile,
    activePack: pack,
  });

  if (loading || profileLoading || checking) return <LoadingSpinner />;
  if (user && !profile && profileError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <AlertMessage type="error">Profil introuvable pour cet utilisateur</AlertMessage>
      </div>
    );
  }
  if (user && !profile) return <LoadingSpinner />;
  if (profile?.role !== 'student') return <Navigate to="/access-pending" replace />;

  const debugAccess = (
    <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 text-left text-xs text-slate-600">
      <p><strong>profile.role:</strong> {profile?.role || '-'}</p>
      <p><strong>profile.access_status:</strong> {profile?.access_status || '-'}</p>
      <p><strong>activePack.status:</strong> {pack?.status || '-'}</p>
      <p><strong>activePack.end_date:</strong> {pack?.end_date || 'null'}</p>
    </div>
  );

  if (accessError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <AlertMessage type="error">
          Impossible de verifier votre pack actif. Merci de contacter l'administration.
        </AlertMessage>
        {debugAccess}
      </div>
    );
  }

  if (!isActiveStudent(profile, pack)) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <AlertMessage type="warning">
          Votre acces n'est pas encore active. Merci de contacter l'administration.
        </AlertMessage>
        {debugAccess}
      </div>
    );
  }

  return <Outlet context={{ profile, activePack: pack }} />;
}

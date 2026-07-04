import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getStudentPack } from '../lib/dataService';
import { isActiveStudent } from '../utils/roles';

const statusLabels = {
  active: 'Actif',
  pending: 'En attente',
  inactive: 'Inactif',
  expired: 'Expiré',
};

const roleLabels = {
  student: 'Étudiant',
  admin: 'Administrateur',
};

export default function StudentRoute() {
  const { user, profile, profileLoading, profileError, authLoading } = useAuth();
  const [pack, setPack] = useState(null);
  const [accessError, setAccessError] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

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

  if (authLoading || profileLoading || checking) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
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
      <p><strong>Rôle du profil :</strong> {roleLabels[profile?.role] || profile?.role || '-'}</p>
      <p><strong>Statut d’accès :</strong> {statusLabels[profile?.access_status] || profile?.access_status || '-'}</p>
      <p><strong>Statut du pack actif :</strong> {statusLabels[pack?.status] || pack?.status || '-'}</p>
      <p><strong>Date de fin du pack :</strong> {pack?.end_date || 'Aucune date de fin'}</p>
    </div>
  );

  if (accessError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <AlertMessage type="error">
          Impossible de vérifier votre pack actif. Merci de contacter l’administration.
        </AlertMessage>
        {debugAccess}
      </div>
    );
  }

  if (!isActiveStudent(profile, pack)) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <AlertMessage type="warning">
          Votre accès n’est pas encore activé. Merci de contacter l’administration.
        </AlertMessage>
        {debugAccess}
      </div>
    );
  }

  return <Outlet context={{ profile, activePack: pack }} />;
}

import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

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

export default function AccessPending() {
  const { user, profile, profileLoading, authLoading } = useAuth();

  if (authLoading || profileLoading) return <LoadingSpinner />;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <AlertMessage type="warning">
        Votre accès n’est pas encore activé. Merci de contacter l’administration.
      </AlertMessage>
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 text-left text-xs text-slate-600">
        <p><strong>Rôle :</strong> {roleLabels[profile?.role] || profile?.role || '-'}</p>
        <p><strong>Statut d’accès :</strong> {statusLabels[profile?.access_status] || profile?.access_status || '-'}</p>
        <p><strong>Email utilisateur :</strong> {user?.email || '-'}</p>
        <p><strong>ID du profil :</strong> {profile?.id || '-'}</p>
      </div>
    </main>
  );
}

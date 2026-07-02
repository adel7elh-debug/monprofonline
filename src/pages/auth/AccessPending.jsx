import AlertMessage from '../../components/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function AccessPending() {
  const { user, profile } = useAuth();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <AlertMessage type="warning">
        Votre acces n'est pas encore active. Merci de contacter l'administration.
      </AlertMessage>
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 text-left text-xs text-slate-600">
        <p><strong>role:</strong> {profile?.role || '-'}</p>
        <p><strong>access_status:</strong> {profile?.access_status || '-'}</p>
        <p><strong>user email:</strong> {user?.email || '-'}</p>
        <p><strong>profile id:</strong> {profile?.id || '-'}</p>
      </div>
    </main>
  );
}

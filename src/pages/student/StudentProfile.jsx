import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';

const roleLabels = {
  student: 'Étudiant',
  admin: 'Administrateur',
};

export default function StudentProfile() {
  const { profile } = useAuth();
  return (
    <Card className="max-w-2xl p-6">
      <h1 className="text-3xl font-black text-navy">Profil</h1>
      <div className="mt-6 grid gap-4 text-sm">
        <p><strong>Nom :</strong> {profile?.full_name}</p>
        <p><strong>Téléphone :</strong> {profile?.phone || '-'}</p>
        <p><strong>Rôle :</strong> {roleLabels[profile?.role] || profile?.role || '-'}</p>
        <p><strong>Statut :</strong> <Badge tone={profile?.access_status}>{profile?.access_status}</Badge></p>
      </div>
    </Card>
  );
}

import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { invokeFunction, listProfiles } from '../../lib/dataService';

export default function StudentsManagement() {
  const [profiles, setProfiles] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [passwordModal, setPasswordModal] = useState(null);
  const load = () => listProfiles().then(setProfiles);
  useEffect(() => { load(); }, []);
  const rows = useMemo(() => (profiles || [])
    .filter((item) => item.role === 'student')
    .filter((item) => !filter || item.access_status === filter)
    .filter((item) => item.full_name?.toLowerCase().includes(query.toLowerCase())), [profiles, query, filter]);
  const setAccess = async (row, access_status) => {
    await invokeFunction('activate-student-access', { student_id: row.id, access_status });
    load();
  };
  const resetPassword = async (row) => {
    const response = await invokeFunction('reset-student-password', { student_id: row.id });
    if (response?.temporary_password) {
      setPasswordModal({ ...response, full_name: row.full_name });
    }
    load();
  };
  const closePasswordModal = () => setPasswordModal(null);
  const copyPassword = async () => {
    if (passwordModal?.temporary_password) {
      await navigator.clipboard.writeText(passwordModal.temporary_password);
    }
  };
  if (!profiles) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Gestion des étudiants</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <FormInput label="Recherche" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Statut</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="expired">Expiré</option>
          </select>
        </label>
      </div>
      <div className="mt-6">
        <Table
          rows={rows}
          columns={[
            { key: 'full_name', label: 'Nom' },
            { key: 'phone', label: 'Téléphone' },
            { key: 'access_status', label: 'Statut', render: (row) => <Badge tone={row.access_status}>{row.access_status}</Badge> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setAccess(row, 'active')}>Activer</Button>
                  <Button variant="outline" onClick={() => setAccess(row, 'inactive')}>Désactiver</Button>
                  <Button variant="outline" onClick={() => setAccess(row, 'expired')}>Expirer</Button>
                  <Button variant="outline" onClick={() => resetPassword(row)}>Réinitialiser le mot de passe</Button>
                </div>
              ),
            },
          ]}
        />
      </div>
      <Modal open={Boolean(passwordModal)} title="Compte étudiant créé" onClose={closePasswordModal}>
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Email</p>
            <p className="mt-1 font-bold text-navy">{passwordModal?.email || passwordModal?.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Mot de passe temporaire</p>
            <div className="mt-1 rounded-md border border-slate-200 bg-mist px-3 py-2 font-mono text-lg font-bold text-navy">
              {passwordModal?.temporary_password}
            </div>
          </div>
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Copiez ce mot de passe maintenant et envoyez-le à l’étudiant. Il ne sera plus affiché après fermeture.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={copyPassword}>Copier le mot de passe</Button>
            <Button onClick={closePasswordModal}>Fermer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

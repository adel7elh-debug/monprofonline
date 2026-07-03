import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { invokeFunction, listRegistrationRequests, updateRowStatus } from '../../lib/dataService';
import { formatDateTime } from '../../utils/formatDate';

export default function RegistrationRequests() {
  const [requests, setRequests] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [passwordModal, setPasswordModal] = useState(null);
  const load = () => listRegistrationRequests().then(setRequests);
  useEffect(() => { load(); }, []);
  const rows = useMemo(() => requests?.filter((row) => !filter || row.status === filter) || [], [requests, filter]);
  const accept = async (row) => {
    const response = await invokeFunction('create-student-from-request', { request_id: row.id });
    setMessage(response?.message || 'Compte étudiant créé via la fonction sécurisée.');
    if (response?.temporary_password) {
      setPasswordModal(response);
      return;
    }
    load();
  };
  const reject = async (row) => {
    await updateRowStatus('registration_requests', row.id, 'rejected');
    load();
  };
  const closePasswordModal = () => {
    setPasswordModal(null);
    load();
  };
  const copyPassword = async () => {
    if (passwordModal?.temporary_password) {
      await navigator.clipboard.writeText(passwordModal.temporary_password);
    }
  };
  if (!requests) return <LoadingSpinner />;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black text-navy">Demandes d’inscription</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">Tous</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptées</option>
          <option value="rejected">Refusées</option>
        </select>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
      <div className="mt-6">
        <Table
          rows={rows}
          columns={[
            { key: 'full_name', label: 'Nom' },
            { key: 'phone', label: 'Téléphone' },
            { key: 'email', label: 'Email' },
            { key: 'city', label: 'Ville' },
            { key: 'status', label: 'Statut', render: (row) => <Badge tone={row.status}>{row.status}</Badge> },
            { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => accept(row)}>Créer le compte</Button>
                  <Button variant="outline" onClick={() => reject(row)}>Refuser</Button>
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
            <p className="mt-1 font-bold text-navy">{passwordModal?.email}</p>
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

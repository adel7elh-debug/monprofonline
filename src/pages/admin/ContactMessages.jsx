import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { deleteRow, listContactMessages, updateRowStatus } from '../../lib/dataService';
import { formatDateTime } from '../../utils/formatDate';

export default function ContactMessages() {
  const [messages, setMessages] = useState(null);
  const [filter, setFilter] = useState('');
  const load = () => listContactMessages().then(setMessages);
  useEffect(() => { load(); }, []);
  const rows = useMemo(() => messages?.filter((row) => !filter || row.status === filter) || [], [messages, filter]);
  if (!messages) return <LoadingSpinner />;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black text-navy">Messages contact</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">Tous</option>
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="closed">closed</option>
        </select>
      </div>
      <div className="mt-6">
        <Table
          rows={rows}
          columns={[
            { key: 'full_name', label: 'Nom' },
            { key: 'phone', label: 'Telephone' },
            { key: 'email', label: 'Email' },
            { key: 'message', label: 'Message' },
            { key: 'status', label: 'Statut', render: (row) => <Badge tone={row.status}>{row.status}</Badge> },
            { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => updateRowStatus('contact_messages', row.id, 'contacted').then(load)}>Contacte</Button>
                  <Button variant="outline" onClick={() => updateRowStatus('contact_messages', row.id, 'closed').then(load)}>Clore</Button>
                  <Button variant="danger" onClick={() => deleteRow('contact_messages', row.id).then(load)}>Supprimer</Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

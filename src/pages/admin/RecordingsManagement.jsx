import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { createRow, deleteRecording, listAdminRecordings, listPacks, listSubjects, updateRow } from '../../lib/dataService';
import { formatDate } from '../../utils/formatDate';

export default function RecordingsManagement() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', pack_id: '', youtube_video_url: '', youtube_playlist_url: '', session_date: '', embed_enabled: true, is_visible: true });
  const load = () => Promise.all([listAdminRecordings(), listSubjects(), listPacks()]).then(([recordings, subjects, packs]) => {
    setData({ recordings, subjects, packs });
    setForm((current) => ({ ...current, subject_id: current.subject_id || subjects[0]?.id || '', pack_id: current.pack_id || packs[0]?.id || '' }));
  });
  useEffect(() => { load(); }, []);
  const submit = async (event) => {
    event.preventDefault();
    await createRow('recordings', form);
    setForm({ title: '', description: '', subject_id: data.subjects[0]?.id || '', pack_id: data.packs[0]?.id || '', youtube_video_url: '', youtube_playlist_url: '', session_date: '', embed_enabled: true, is_visible: true });
    load();
  };
  const resetForm = () => {
    setForm({ title: '', description: '', subject_id: data.subjects[0]?.id || '', pack_id: data.packs[0]?.id || '', youtube_video_url: '', youtube_playlist_url: '', session_date: '', embed_enabled: true, is_visible: true });
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setMessage(null);
    try {
      const response = await deleteRecording(deleteTarget.id);
      setData((current) => ({
        ...current,
        recordings: (current?.recordings || []).filter((item) => item.id !== deleteTarget.id),
      }));
      setDeleteTarget(null);
      setMessage({ type: 'success', text: response?.message || 'Enregistrement supprimé avec succès.' });
      load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Impossible de supprimer cet enregistrement.' });
    } finally {
      setDeleting(false);
    }
  };
  if (!data) return <LoadingSpinner />;
  return (
    <div>
      {message ? (
        <div className="mb-4">
          <AlertMessage type={message.type}>{message.text}</AlertMessage>
        </div>
      ) : null}
      <h1 className="text-3xl font-black text-navy">Gestion des enregistrements</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Lien vidéo YouTube" value={form.youtube_video_url} onChange={(e) => setForm({ ...form, youtube_video_url: e.target.value })} />
          <FormInput label="Lien playlist YouTube" value={form.youtube_playlist_url} onChange={(e) => setForm({ ...form, youtube_playlist_url: e.target.value })} />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormInput label="Date de séance" type="datetime-local" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} />
          <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select value={form.pack_id} onChange={(e) => setForm({ ...form, pack_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Ajouter l’enregistrement</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
          </div>
        </form>
      </Card>
      <div className="mt-6">
        <Table
          rows={data.recordings}
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'subject', label: 'Matière', render: (row) => row.subjects?.name || '-' },
            { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
            { key: 'is_visible', label: 'Visible', render: (row) => <Badge tone={row.is_visible ? 'active' : 'inactive'}>{row.is_visible ? 'Oui' : 'Non'}</Badge> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => updateRow('recordings', row.id, { is_visible: !row.is_visible }).then(load)}>
                    {row.is_visible ? 'Masquer' : 'Afficher'}
                  </Button>
                  {profile?.role === 'admin' ? (
                    <Button
                      variant="danger"
                      className="border border-red-200"
                      onClick={() => {
                        setMessage(null);
                        setDeleteTarget(row);
                      }}
                    >
                      Supprimer
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </div>
      <Modal open={Boolean(deleteTarget)} title="Supprimer cet enregistrement ?" onClose={() => setDeleteTarget(null)}>
        <div className="grid gap-4">
          <p className="text-sm text-slate-700">
            Cette action supprimera l’enregistrement de la plateforme. Cette action est irréversible.
          </p>
          <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p className="font-semibold">{deleteTarget?.title || 'Enregistrement sélectionné'}</p>
            {deleteTarget?.youtube_video_url ? <p>{deleteTarget.youtube_video_url}</p> : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              Confirmer la suppression
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

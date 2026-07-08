import { useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import usePersistedFilters from '../../hooks/usePersistedFilters';
import usePersistedForm from '../../hooks/usePersistedForm';
import {
  clearStudentCache,
  createRow,
  deleteRecording,
  listAdminRecordings,
  listPacks,
  listSubjects,
  updateRow,
} from '../../lib/dataService';
import { formatDate } from '../../utils/formatDate';

const emptyForm = {
  title: '',
  description: '',
  subject_id: '',
  pack_id: '',
  youtube_video_url: '',
  youtube_playlist_url: '',
  google_drive_url: '',
  session_date: '',
  embed_enabled: true,
  is_visible: true,
};

const allowedVideoPrefixes = [
  'https://www.youtube.com/',
  'https://youtu.be/',
  'https://drive.google.com/',
];

const isAllowedVideoLink = (url) => !url || allowedVideoPrefixes.some((prefix) => url.startsWith(prefix));

const mapRecordingToForm = (recording) => ({
  title: recording.title || '',
  description: recording.description || '',
  subject_id: recording.subject_id || '',
  pack_id: recording.pack_id || '',
  youtube_video_url: recording.youtube_video_url || '',
  youtube_playlist_url: recording.youtube_playlist_url || '',
  google_drive_url: recording.google_drive_url || '',
  session_date: recording.session_date ? recording.session_date.slice(0, 16) : '',
  embed_enabled: recording.embed_enabled !== false,
  is_visible: recording.is_visible !== false,
});

export default function RecordingsManagement() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm, resetPersistedForm] = usePersistedForm('monprof_recording_draft', emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = usePersistedFilters('monprof_recording_filters', { search: '', subject: '', pack: '' });

  const load = () =>
    Promise.all([listAdminRecordings(), listSubjects(), listPacks()]).then(([recordings, subjects, packs]) => {
      if (import.meta.env.DEV) console.log('données récupérées enregistrements vidéo', { recordings, subjects, packs });
      setData({ recordings, subjects, packs });
      setForm((current) => ({
        ...current,
        subject_id: current.subject_id || subjects[0]?.id || '',
        pack_id: current.pack_id || packs[0]?.id || '',
      }));
    });

  useEffect(() => {
    load().catch((error) => {
      console.error('Admin recordings load failed:', error);
      setData({ recordings: [], subjects: [], packs: [] });
      setMessage({ type: 'error', text: 'Impossible de charger les enregistrements vidéo.' });
    });
  }, []);

  const filteredRecordings = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return (data?.recordings || []).filter((recording) => {
      const matchesSearch = !query || recording.title?.toLowerCase().includes(query);
      const matchesSubject = !filters.subject || recording.subject_id === filters.subject;
      const matchesPack = !filters.pack || recording.pack_id === filters.pack;
      return matchesSearch && matchesSubject && matchesPack;
    });
  }, [data?.recordings, filters]);

  const resetForm = () => {
    setEditing(null);
    resetPersistedForm({
      ...emptyForm,
      subject_id: data?.subjects?.[0]?.id || '',
      pack_id: data?.packs?.[0]?.id || '',
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);

    const videoLinks = [
      form.youtube_video_url.trim(),
      form.youtube_playlist_url.trim(),
      form.google_drive_url.trim(),
    ];

    if (!form.title.trim() || !form.subject_id || !form.pack_id) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    if (!videoLinks.some(Boolean)) {
      setMessage({ type: 'error', text: 'Veuillez renseigner au moins un lien vidéo.' });
      return;
    }

    if (!videoLinks.every(isAllowedVideoLink)) {
      setMessage({ type: 'error', text: 'Le lien doit commencer par https://www.youtube.com/, https://youtu.be/ ou https://drive.google.com/.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        subject_id: form.subject_id,
        pack_id: form.pack_id,
        youtube_video_url: form.youtube_video_url.trim() || null,
        youtube_playlist_url: form.youtube_playlist_url.trim() || null,
        google_drive_url: form.google_drive_url.trim() || null,
        session_date: form.session_date || null,
        embed_enabled: Boolean(form.embed_enabled),
        is_visible: Boolean(form.is_visible),
      };

      if (editing?.id) {
        await updateRow('recordings', editing.id, payload);
        setMessage({ type: 'success', text: 'Enregistrement vidéo modifié avec succès.' });
      } else {
        await createRow('recordings', payload);
        setMessage({ type: 'success', text: 'Enregistrement vidéo ajouté avec succès.' });
      }

      clearStudentCache();
      resetForm();
      await load();
    } catch (error) {
      console.error('Recording save failed:', {
        payload: form,
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setMessage({ type: 'error', text: error.message || 'Impossible d’enregistrer la vidéo.' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (recording) => {
    setMessage(null);
    setEditing(recording);
    setForm(mapRecordingToForm(recording));
  };

  const toggleVisibility = async (recording) => {
    setMessage(null);
    try {
      await updateRow('recordings', recording.id, { is_visible: !recording.is_visible });
      clearStudentCache();
      await load();
    } catch (error) {
      console.error('Recording visibility update failed:', {
        recordingId: recording.id,
        error,
        message: error.message,
      });
      setMessage({ type: 'error', text: error.message || 'Impossible de modifier le statut de la vidéo.' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setMessage(null);
    try {
      const response = await deleteRecording(deleteTarget.id);
      setDeleteTarget(null);
      clearStudentCache();
      setMessage({ type: 'success', text: response?.message || 'Enregistrement vidéo supprimé avec succès.' });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Impossible de supprimer cet enregistrement vidéo.' });
    } finally {
      setDeleting(false);
    }
  };

  if (!data) return <LoadingSpinner label="Chargement des données..." />;

  return (
    <div>
      {message ? (
        <div className="mb-4">
          <AlertMessage type={message.type}>{message.text}</AlertMessage>
        </div>
      ) : null}

      <h1 className="text-3xl font-black text-navy">Gestion des enregistrements vidéo</h1>

      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Lien YouTube" type="url" value={form.youtube_video_url} onChange={(e) => setForm({ ...form, youtube_video_url: e.target.value })} />
          <FormInput label="Lien playlist YouTube optionnel" type="url" value={form.youtube_playlist_url} onChange={(e) => setForm({ ...form, youtube_playlist_url: e.target.value })} />
          <FormInput label="Lien Google Drive optionnel" type="url" value={form.google_drive_url} onChange={(e) => setForm({ ...form, google_drive_url: e.target.value })} />
          <FormInput label="Date de séance" type="datetime-local" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Matière</span>
            <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-navy shadow-sm" required>
              {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Pack</span>
            <select value={form.pack_id} onChange={(e) => setForm({ ...form, pack_id: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-navy shadow-sm" required>
              {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700 md:col-span-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-royal" />
              Visible
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.embed_enabled} onChange={(e) => setForm({ ...form, embed_enabled: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-royal" />
              Embed activé
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Button type="submit" loading={saving}>{editing ? 'Modifier' : 'Ajouter'}</Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>Annuler</Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <FormInput label="Recherche par titre" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Filtre par matière</span>
            <select value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-navy shadow-sm">
              <option value="">Toutes les matières</option>
              {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Filtre par pack</span>
            <select value={filters.pack} onChange={(e) => setFilters({ ...filters, pack: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-navy shadow-sm">
              <option value="">Tous les packs</option>
              {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <div className="mt-6">
        <Table
          rows={filteredRecordings}
          emptyTitle="Aucun enregistrement vidéo."
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'subject', label: 'Matière', render: (row) => row.subjects?.name || '-' },
            { key: 'pack', label: 'Pack', render: (row) => row.packs?.name || '-' },
            { key: 'session_date', label: 'Date de séance', render: (row) => formatDate(row.session_date) },
            { key: 'embed_enabled', label: 'Embed', render: (row) => <Badge tone={row.embed_enabled ? 'active' : 'inactive'}>{row.embed_enabled ? 'Activé' : 'Désactivé'}</Badge> },
            { key: 'is_visible', label: 'Statut', render: (row) => <Badge tone={row.is_visible ? 'active' : 'inactive'}>{row.is_visible ? 'Visible' : 'Masqué'}</Badge> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => startEdit(row)}>Modifier</Button>
                  <Button variant="outline" onClick={() => toggleVisibility(row)}>
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

      <Modal open={Boolean(deleteTarget)} title="Supprimer cet enregistrement vidéo ?" onClose={() => setDeleteTarget(null)}>
        <div className="grid gap-4">
          <p className="text-sm text-slate-700">
            Cette action supprimera l’enregistrement vidéo de la plateforme. Elle est irréversible.
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

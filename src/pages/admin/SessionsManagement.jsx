import { useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import Table from '../../components/Table';
import {
  createSession,
  deleteSession,
  getAdminSessions,
  listPacks,
  listSubjects,
  updateSession,
} from '../../lib/dataService';
import { formatDate } from '../../utils/formatDate';

const emptyForm = {
  title: '',
  description: '',
  subject_id: '',
  pack_id: '',
  session_date: '',
  start_time: '',
  end_time: '',
  meet_link: '',
  replay_link: '',
  status: 'scheduled',
  is_visible: true,
};

const statusLabels = {
  scheduled: 'Programmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const statusTones = {
  scheduled: 'pending',
  completed: 'active',
  cancelled: 'expired',
};

const viewLabels = {
  current: 'Cette semaine',
  next: 'Semaine prochaine',
  all: 'Toutes les séances',
};

const toDateInput = (date) => date.toISOString().slice(0, 10);

const getWeekRange = (offset = 0) => {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1 + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toDateInput(monday), end: toDateInput(sunday) };
};

const getSessionDay = (session) =>
  new Intl.DateTimeFormat('fr-MA', { weekday: 'long', day: '2-digit', month: 'long' }).format(
    new Date(`${session.session_date}T00:00:00`),
  );

const getSessionTime = (session) =>
  [session.start_time?.slice(0, 5), session.end_time?.slice(0, 5)].filter(Boolean).join(' - ');

const matchesView = (session, view) => {
  if (view === 'all') return true;
  const range = getWeekRange(view === 'next' ? 1 : 0);
  return session.session_date >= range.start && session.session_date <= range.end;
};

export default function SessionsManagement() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView] = useState('current');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [packFilter, setPackFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [sessions, subjects, packs] = await Promise.all([getAdminSessions(), listSubjects(), listPacks()]);
    setData({ sessions, subjects, packs });
    setForm((current) => ({
      ...current,
      subject_id: current.subject_id || subjects[0]?.id || '',
      pack_id: current.pack_id || packs[0]?.id || '',
    }));
  };

  useEffect(() => {
    load().catch((err) => {
      console.error('Admin sessions load error:', err);
      setError('Impossible de charger l’agenda.');
    });
  }, []);

  const filteredSessions = useMemo(() => {
    const sessions = data?.sessions || [];
    return sessions.filter((session) => {
      if (!matchesView(session, view)) return false;
      if (subjectFilter && session.subject_id !== subjectFilter) return false;
      if (packFilter && session.pack_id !== packFilter) return false;
      if (statusFilter && session.status !== statusFilter) return false;
      return true;
    });
  }, [data, view, subjectFilter, packFilter, statusFilter]);

  const groupedSessions = useMemo(
    () =>
      filteredSessions.reduce((groups, session) => {
        const day = getSessionDay(session);
        return { ...groups, [day]: [...(groups[day] || []), session] };
      }, {}),
    [filteredSessions],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      subject_id: data?.subjects[0]?.id || '',
      pack_id: data?.packs[0]?.id || '',
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const payload = {
      ...form,
      subject_id: form.subject_id || null,
      pack_id: form.pack_id || null,
      end_time: form.end_time || null,
      meet_link: form.meet_link || null,
      replay_link: form.replay_link || null,
    };

    try {
      if (editingId) {
        await updateSession(editingId, payload);
        setMessage('Séance modifiée avec succès.');
      } else {
        await createSession(payload);
        setMessage('Séance créée avec succès.');
      }
      resetForm();
      await load();
    } catch (err) {
      console.error('Admin session save error:', err);
      setError('Impossible d’enregistrer la séance. Vérifiez les champs et vos droits Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (session) => {
    setEditingId(session.id);
    setMessage(null);
    setError(null);
    setForm({
      title: session.title || '',
      description: session.description || '',
      subject_id: session.subject_id || '',
      pack_id: session.pack_id || '',
      session_date: session.session_date || '',
      start_time: session.start_time?.slice(0, 5) || '',
      end_time: session.end_time?.slice(0, 5) || '',
      meet_link: session.meet_link || '',
      replay_link: session.replay_link || '',
      status: session.status || 'scheduled',
      is_visible: Boolean(session.is_visible),
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setMessage(null);
    setError(null);
    try {
      await deleteSession(deleteTarget.id);
      setMessage('Séance supprimée avec succès.');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      console.error('Admin session delete error:', err);
      setError('Impossible de supprimer la séance.');
    }
  };

  if (!data) return <LoadingSpinner />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-navy">Agenda</h1>
          <p className="mt-1 text-sm text-slate-600">Planning hebdomadaire des séances de préparation Master.</p>
        </div>
        {editingId ? <Button variant="outline" onClick={resetForm}>Nouvelle séance</Button> : null}
      </div>

      {message ? <AlertMessage type="success">{message}</AlertMessage> : null}
      {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

      <Card className="p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre de la séance" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Description" as="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Matière</span>
            <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Pack</span>
            <select value={form.pack_id} onChange={(e) => setForm({ ...form, pack_id: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
            </select>
          </label>
          <FormInput label="Date de la séance" type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} required />
          <FormInput label="Heure début" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
          <FormInput label="Heure fin" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <FormInput label="Lien Google Meet" value={form.meet_link} onChange={(e) => setForm({ ...form, meet_link: e.target.value })} />
          <FormInput label="Lien replay YouTube" value={form.replay_link} onChange={(e) => setForm({ ...form, replay_link: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Statut</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Visible</span>
            <select value={form.is_visible ? 'true' : 'false'} onChange={(e) => setForm({ ...form, is_visible: e.target.value === 'true' })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </label>
          <Button type="submit" loading={saving} className="md:col-span-3">
            {editingId ? 'Modifier la séance' : 'Ajouter la séance'}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <select value={view} onChange={(e) => setView(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {Object.entries(viewLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Toutes les matières</option>
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select value={packFilter} onChange={(e) => setPackFilter(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Tous les packs</option>
            {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid gap-4">
        {Object.entries(groupedSessions).map(([day, sessions]) => (
          <Card key={day} className="p-5">
            <h2 className="font-black capitalize text-navy">{day}</h2>
            <div className="mt-4 grid gap-3">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-md border border-slate-200 bg-mist p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-royal">{getSessionTime(session)} | {session.subjects?.name || '-'}</p>
                      <h3 className="mt-1 font-black text-navy">{session.title}</h3>
                      {session.description ? <p className="mt-1 text-sm text-slate-600">{session.description}</p> : null}
                    </div>
                    <Badge tone={statusTones[session.status]}>{statusLabels[session.status]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Table
        emptyTitle="Aucune séance programmée."
        rows={filteredSessions}
        columns={[
          { key: 'title', label: 'Titre' },
          { key: 'subject', label: 'Matière', render: (row) => row.subjects?.name || '-' },
          { key: 'pack', label: 'Pack', render: (row) => row.packs?.name || '-' },
          { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
          { key: 'start_time', label: 'Début', render: (row) => row.start_time?.slice(0, 5) || '-' },
          { key: 'end_time', label: 'Fin', render: (row) => row.end_time?.slice(0, 5) || '-' },
          { key: 'status', label: 'Statut', render: (row) => <Badge tone={statusTones[row.status]}>{statusLabels[row.status]}</Badge> },
          { key: 'is_visible', label: 'Visible', render: (row) => (row.is_visible ? 'Oui' : 'Non') },
          { key: 'meet_link', label: 'Meet', render: (row) => (row.meet_link ? <a className="font-semibold text-royal" href={row.meet_link} target="_blank" rel="noreferrer">Ouvrir</a> : '-') },
          { key: 'replay_link', label: 'Replay', render: (row) => (row.replay_link ? <a className="font-semibold text-royal" href={row.replay_link} target="_blank" rel="noreferrer">Ouvrir</a> : '-') },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => startEdit(row)}>Modifier</Button>
                <Button variant="danger" onClick={() => setDeleteTarget(row)}>Supprimer</Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la séance"
        message="Cette action supprimera définitivement la séance du planning."
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

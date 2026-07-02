import { useEffect, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, listAdminRecordings, listPacks, listSubjects, updateRow } from '../../lib/dataService';
import { formatDate } from '../../utils/formatDate';

export default function RecordingsManagement() {
  const [data, setData] = useState(null);
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
  if (!data) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Gestion des enregistrements</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Lien video YouTube" value={form.youtube_video_url} onChange={(e) => setForm({ ...form, youtube_video_url: e.target.value })} />
          <FormInput label="Lien playlist YouTube" value={form.youtube_playlist_url} onChange={(e) => setForm({ ...form, youtube_playlist_url: e.target.value })} />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormInput label="Date seance" type="datetime-local" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} />
          <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select value={form.pack_id} onChange={(e) => setForm({ ...form, pack_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
          </select>
          <Button type="submit">Ajouter enregistrement</Button>
        </form>
      </Card>
      <div className="mt-6">
        <Table
          rows={data.recordings}
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'subject', label: 'Matiere', render: (row) => row.subjects?.name || '-' },
            { key: 'session_date', label: 'Date', render: (row) => formatDate(row.session_date) },
            { key: 'is_visible', label: 'Visible', render: (row) => <Badge tone={row.is_visible ? 'active' : 'inactive'}>{row.is_visible ? 'Oui' : 'Non'}</Badge> },
            { key: 'actions', label: 'Actions', render: (row) => <Button variant="outline" onClick={() => updateRow('recordings', row.id, { is_visible: !row.is_visible }).then(load)}>{row.is_visible ? 'Masquer' : 'Afficher'}</Button> },
          ]}
        />
      </div>
    </div>
  );
}

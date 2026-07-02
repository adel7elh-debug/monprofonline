import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, listAdminQuizzes, listPacks, listSubjects, updateRow } from '../../lib/dataService';

export default function QuizzesManagement() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', pack_id: '', duration_minutes: 30, is_published: false });
  const load = () => Promise.all([listAdminQuizzes(), listSubjects(), listPacks()]).then(([quizzes, subjects, packs]) => {
    setData({ quizzes, subjects, packs });
    setForm((current) => ({ ...current, subject_id: current.subject_id || subjects[0]?.id || '', pack_id: current.pack_id || packs[0]?.id || '' }));
  });
  useEffect(() => { load(); }, []);
  const submit = async (event) => {
    event.preventDefault();
    await createRow('quizzes', form);
    setForm({ title: '', description: '', subject_id: data.subjects[0]?.id || '', pack_id: data.packs[0]?.id || '', duration_minutes: 30, is_published: false });
    load();
  };
  if (!data) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Gestion QCM</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormInput label="Duree minutes" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select value={form.pack_id} onChange={(e) => setForm({ ...form, pack_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
          </select>
          <Button type="submit">Creer QCM</Button>
        </form>
      </Card>
      <div className="mt-6">
        <Table
          rows={data.quizzes}
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'duration_minutes', label: 'Duree' },
            { key: 'is_published', label: 'Publie', render: (row) => <Badge tone={row.is_published ? 'active' : 'inactive'}>{row.is_published ? 'Oui' : 'Non'}</Badge> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/quizzes/${row.id}`}><Button variant="secondary">Editer</Button></Link>
                  <Button variant="outline" onClick={() => updateRow('quizzes', row.id, { is_published: !row.is_published }).then(load)}>
                    {row.is_published ? 'Desactiver' : 'Publier'}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

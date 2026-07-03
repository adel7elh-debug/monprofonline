import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, deleteRow, listSubjects } from '../../lib/dataService';

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', display_order: 0 });
  const load = () => listSubjects().then(setSubjects);
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    await createRow('subjects', form);
    setForm({ name: '', description: '', display_order: 0 });
    load();
  };
  if (!subjects) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Gestion des matières</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <FormInput label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormInput label="Ordre" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
          <Button type="submit" className="self-end">Ajouter une matière</Button>
        </form>
      </Card>
      <div className="mt-6">
        <Table
          rows={subjects}
          columns={[
            { key: 'display_order', label: 'Ordre' },
            { key: 'name', label: 'Nom' },
            { key: 'description', label: 'Description' },
            { key: 'actions', label: 'Actions', render: (row) => <Button variant="outline" onClick={() => deleteRow('subjects', row.id).then(load)}>Supprimer</Button> },
          ]}
        />
      </div>
    </div>
  );
}

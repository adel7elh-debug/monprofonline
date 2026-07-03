import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, listPacks, updateRow } from '../../lib/dataService';

export default function PacksManagement() {
  const [packs, setPacks] = useState(null);
  const [form, setForm] = useState({ name: '', price: 1300, description: '', is_active: true });
  const load = () => listPacks().then(setPacks);
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    await createRow('packs', form);
    setForm({ name: '', price: 1300, description: '', is_active: true });
    load();
  };
  if (!packs) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Gestion des packs</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <FormInput label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="Prix" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" className="self-end">Ajouter un pack</Button>
        </form>
      </Card>
      <div className="mt-6">
        <Table
          rows={packs}
          columns={[
            { key: 'name', label: 'Nom' },
            { key: 'price', label: 'Prix', render: (row) => `${row.price || 0} DH` },
            { key: 'description', label: 'Description' },
            { key: 'is_active', label: 'Actif', render: (row) => (row.is_active ? 'Oui' : 'Non') },
            { key: 'actions', label: 'Actions', render: (row) => <Button variant="outline" onClick={() => updateRow('packs', row.id, { is_active: !row.is_active }).then(load)}>{row.is_active ? 'Désactiver' : 'Activer'}</Button> },
          ]}
        />
      </div>
    </div>
  );
}

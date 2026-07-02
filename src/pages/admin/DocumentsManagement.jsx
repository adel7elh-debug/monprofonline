import { useEffect, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, listAdminDocuments, listPacks, listSubjects, uploadDocumentPdf } from '../../lib/dataService';

export default function DocumentsManagement() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', pack_id: '', document_type: 'support', is_visible: true });
  const load = () => Promise.all([listAdminDocuments(), listSubjects(), listPacks()]).then(([documents, subjects, packs]) => {
    setData({ documents, subjects, packs });
    setForm((current) => ({ ...current, subject_id: current.subject_id || subjects[0]?.id || '', pack_id: current.pack_id || packs[0]?.id || '' }));
  });
  useEffect(() => { load(); }, []);
  const submit = async (event) => {
    event.preventDefault();
    const file_path = await uploadDocumentPdf(file);
    await createRow('documents', { ...form, file_path });
    setForm({ title: '', description: '', subject_id: data.subjects[0]?.id || '', pack_id: data.packs[0]?.id || '', document_type: 'support', is_visible: true });
    setFile(null);
    load();
  };
  if (!data) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Gestion documents PDF</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">PDF</span>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0])} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Matiere</span>
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
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Type</span>
            <select value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {['support', 'resume', 'annale', 'correction'].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <Button type="submit" className="md:col-span-3">Ajouter document</Button>
        </form>
      </Card>
      <div className="mt-6">
        <Table
          rows={data.documents}
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'document_type', label: 'Type' },
            { key: 'subject', label: 'Matiere', render: (row) => row.subjects?.name || '-' },
            { key: 'is_visible', label: 'Visible', render: (row) => <Badge tone={row.is_visible ? 'active' : 'inactive'}>{row.is_visible ? 'Oui' : 'Non'}</Badge> },
            { key: 'file_path', label: 'Chemin fichier' },
          ]}
        />
      </div>
    </div>
  );
}

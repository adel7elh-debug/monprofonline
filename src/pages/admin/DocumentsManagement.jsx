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
import { createRow, deleteDocument, listAdminDocuments, listPacks, listSubjects, uploadDocumentPdf } from '../../lib/dataService';

export default function DocumentsManagement() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setMessage(null);
    try {
      const response = await deleteDocument(deleteTarget.id);
      setData((current) => ({
        ...current,
        documents: (current?.documents || []).filter((item) => item.id !== deleteTarget.id),
      }));
      setDeleteTarget(null);
      setMessage({ type: 'success', text: response?.message || 'Document supprimé avec succès.' });
      load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Impossible de supprimer ce document.' });
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
      <h1 className="text-3xl font-black text-navy">Gestion des documents PDF</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">PDF</span>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0])} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
          </label>
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
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Type</span>
            <select value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {[
                ['support', 'Support'],
                ['resume', 'Résumé'],
                ['annale', 'Annale'],
                ['correction', 'Correction'],
              ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <Button type="submit" className="md:col-span-3">Ajouter le document</Button>
        </form>
      </Card>
      <div className="mt-6">
        <Table
          rows={data.documents}
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'document_type', label: 'Type' },
            { key: 'subject', label: 'Matière', render: (row) => row.subjects?.name || '-' },
            { key: 'is_visible', label: 'Visible', render: (row) => <Badge tone={row.is_visible ? 'active' : 'inactive'}>{row.is_visible ? 'Oui' : 'Non'}</Badge> },
            { key: 'file_path', label: 'Chemin du fichier' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (profile?.role === 'admin' ? (
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
              ) : null),
            },
          ]}
        />
      </div>
      <Modal open={Boolean(deleteTarget)} title="Supprimer ce document PDF ?" onClose={() => setDeleteTarget(null)}>
        <div className="grid gap-4">
          <p className="text-sm text-slate-700">
            Cette action supprimera le document de la plateforme. Cette action est irréversible.
          </p>
          <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p className="font-semibold">{deleteTarget?.title || 'Document sélectionné'}</p>
            {deleteTarget?.file_path ? <p>{deleteTarget.file_path}</p> : null}
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

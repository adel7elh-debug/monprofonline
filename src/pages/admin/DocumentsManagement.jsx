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
import { createRow, deleteDocument, listAdminDocuments, listPacks, listSubjects, uploadDocumentPdf } from '../../lib/dataService';

const draftKey = 'monprof_pdf_draft';
const filtersKey = 'monprof_pdf_filters';
const maxPdfSize = 20 * 1024 * 1024;

const emptyForm = {
  title: '',
  description: '',
  subject_id: '',
  pack_id: '',
  document_type: 'support',
  is_visible: true,
};

const documentTypes = [
  ['support', 'Support'],
  ['resume', 'Résumé'],
  ['annale', 'Annale'],
  ['correction', 'Correction'],
];

export default function DocumentsManagement() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm, resetPersistedForm] = usePersistedForm(draftKey, emptyForm);
  const [filters, setFilters] = usePersistedFilters(filtersKey, { search: '', subject: '', pack: '', type: '' });

  const load = () =>
    Promise.all([listAdminDocuments(), listSubjects(), listPacks()]).then(([documents, subjects, packs]) => {
      if (import.meta.env.DEV) console.log('données récupérées documents PDF', { documents, subjects, packs });
      setData({ documents, subjects, packs });
      setForm((current) => ({
        ...current,
        subject_id: current.subject_id || subjects[0]?.id || '',
        pack_id: current.pack_id || packs[0]?.id || '',
      }));
    });

  useEffect(() => {
    load().catch((error) => {
      console.error('Erreur Supabase exacte documents PDF:', error);
      setData({ documents: [], subjects: [], packs: [] });
      setMessage({ type: 'error', text: error.message || 'Impossible de charger les données.' });
    });
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return (data?.documents || []).filter((document) => {
      if (query && !document.title?.toLowerCase().includes(query)) return false;
      if (filters.subject && document.subject_id !== filters.subject) return false;
      if (filters.pack && document.pack_id !== filters.pack) return false;
      if (filters.type && document.document_type !== filters.type) return false;
      return true;
    });
  }, [data?.documents, filters]);

  const resetForm = () => {
    resetPersistedForm({
      ...emptyForm,
      subject_id: data?.subjects[0]?.id || '',
      pack_id: data?.packs[0]?.id || '',
    });
    setFile(null);
    setFileInputKey((value) => value + 1);
  };

  const validateFile = (nextFile) => {
    if (!nextFile) {
      setFile(null);
      return;
    }
    const isPdf = nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFile(null);
      setFileInputKey((value) => value + 1);
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier PDF.' });
      return;
    }
    if (nextFile.size > maxPdfSize) {
      setFile(null);
      setFileInputKey((value) => value + 1);
      setMessage({ type: 'error', text: 'Le fichier PDF est trop lourd. Taille maximale : 20 Mo.' });
      return;
    }
    setMessage(null);
    setFile(nextFile);
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    if (!form.title.trim() || !form.subject_id || !form.pack_id || !form.document_type || !file) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    setSaving(true);
    try {
      const file_path = await uploadDocumentPdf(file);
      await createRow('documents', {
        title: form.title.trim(),
        description: form.description.trim() || null,
        subject_id: form.subject_id,
        pack_id: form.pack_id,
        document_type: form.document_type,
        file_path,
        is_visible: true,
      });
      resetForm();
      setMessage({ type: 'success', text: 'Document ajouté avec succès.' });
      await load();
    } catch (error) {
      console.error('Erreur Supabase exacte ajout document PDF:', {
        form,
        file: file ? { name: file.name, size: file.size, type: file.type } : null,
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setMessage({ type: 'error', text: error.message || 'Impossible d’ajouter le document.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setMessage(null);
    try {
      const response = await deleteDocument(deleteTarget.id);
      setDeleteTarget(null);
      setMessage({ type: 'success', text: response?.message || 'Document supprimé avec succès.' });
      await load();
    } catch (error) {
      console.error('Erreur Supabase exacte suppression document PDF:', error);
      setMessage({ type: 'error', text: error.message || 'Impossible de supprimer ce document.' });
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
      <h1 className="text-3xl font-black text-navy">Gestion des documents PDF</h1>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">PDF</span>
            <input
              key={fileInputKey}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => validateFile(e.target.files?.[0])}
              className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            {file ? <span className="mt-1 block text-xs font-semibold text-slate-500">{file.name}</span> : null}
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
              {documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-3">
            <Button type="submit" loading={saving}>{saving ? 'Ajout en cours...' : 'Ajouter le document'}</Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>Annuler</Button>
          </div>
        </form>
      </Card>

      <Card className="mt-5 p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <FormInput label="Recherche" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Matière</span>
            <select value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">Toutes les matières</option>
              {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Pack</span>
            <select value={filters.pack} onChange={(e) => setFilters({ ...filters, pack: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">Tous les packs</option>
              {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Type</span>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">Tous les types</option>
              {documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <div className="mt-6">
        <Table
          rows={filteredDocuments}
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

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { createRow, importQuizQuestions, listAdminQuizzes, listPacks, listSubjects, updateRow } from '../../lib/dataService';
import { parseQuestionImportFile, validateQuestionImportRows } from '../../utils/questionImport';

const emptyForm = {
  title: '',
  description: '',
  subject_id: '',
  pack_id: '',
  duration_minutes: 30,
  is_published: false,
};

export default function QuizzesManagement() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm, resetPersistedForm] = usePersistedForm('monprof_qcm_draft', emptyForm);
  const [filters, setFilters] = usePersistedFilters('monprof_qcm_filters', { search: '', subject: '', pack: '' });
  const [importModal, setImportModal] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null);

  const load = () =>
    Promise.all([listAdminQuizzes(), listSubjects(), listPacks()]).then(([quizzes, subjects, packs]) => {
      if (import.meta.env.DEV) console.log('données récupérées QCM admin', { quizzes, subjects, packs });
      setData({ quizzes, subjects, packs });
      setForm((current) => ({
        ...current,
        subject_id: current.subject_id || subjects[0]?.id || '',
        pack_id: current.pack_id || packs[0]?.id || '',
      }));
    });

  useEffect(() => {
    load().catch((error) => {
      console.error('Erreur Supabase exacte QCM admin:', error);
      setData({ quizzes: [], subjects: [], packs: [] });
      setMessage({ type: 'error', text: error.message || 'Impossible de charger les données.' });
    });
  }, []);

  const rows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return (data?.quizzes || []).filter((quiz) => {
      if (query && !quiz.title?.toLowerCase().includes(query)) return false;
      if (filters.subject && quiz.subject_id !== filters.subject) return false;
      if (filters.pack && quiz.pack_id !== filters.pack) return false;
      return true;
    });
  }, [data?.quizzes, filters]);

  const resetForm = () => {
    resetPersistedForm({
      ...emptyForm,
      subject_id: data?.subjects[0]?.id || '',
      pack_id: data?.packs[0]?.id || '',
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      await createRow('quizzes', form);
      resetForm();
      setMessage({ type: 'success', text: 'QCM créé avec succès.' });
      await load();
    } catch (error) {
      console.error('Erreur Supabase exacte création QCM:', {
        form,
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setMessage({ type: 'error', text: error.message || 'Impossible de créer le QCM.' });
    }
  };

  const closeImportModal = () => {
    if (importing) return;
    setImportModal(false);
    setImportRows([]);
  };

  const parseImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    try {
      const rows = await parseQuestionImportFile(file);
      setImportRows(validateQuestionImportRows(rows, data.subjects));
    } catch (error) {
      setImportRows([]);
      setMessage({ type: 'error', text: error.message || 'Impossible de lire le fichier.' });
    } finally {
      event.target.value = '';
    }
  };

  const confirmImport = async () => {
    const validRows = importRows.filter((row) => !row.errors.length);
    if (!validRows.length) return;
    setImporting(true);
    setMessage(null);
    try {
      await importQuizQuestions({
        rows: validRows,
        subjects: data.subjects,
        quizzes: data.quizzes,
        defaultPackId: form.pack_id || data.packs[0]?.id,
      });
      setImportModal(false);
      setImportRows([]);
      setMessage({ type: 'success', text: 'Questions importées avec succès.' });
      await load();
    } catch (error) {
      console.error('Erreur Supabase exacte import QCM:', error);
      setMessage({ type: 'error', text: error.message || 'Impossible d’importer les questions.' });
    } finally {
      setImporting(false);
    }
  };

  const togglePublish = async (quiz) => {
    try {
      await updateRow('quizzes', quiz.id, { is_published: !quiz.is_published });
      await load();
    } catch (error) {
      console.error('Erreur Supabase exacte publication QCM:', error);
      setMessage({ type: 'error', text: error.message || 'Impossible de modifier le statut du QCM.' });
    }
  };

  if (!data) return <LoadingSpinner label="Chargement des données..." />;
  const importErrors = importRows.flatMap((row) => row.errors.map((error) => `Ligne ${row.line} : ${error}`));

  return (
    <div>
      {message ? (
        <div className="mb-4">
          <AlertMessage type={message.type}>{message.text}</AlertMessage>
        </div>
      ) : null}
      <h1 className="text-3xl font-black text-navy">Gestion QCM</h1>
      {profile?.role === 'admin' ? (
        <div className="mt-4">
          <Button variant="outline" onClick={() => setImportModal(true)}>Importer des questions</Button>
        </div>
      ) : null}
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <FormInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormInput label="Durée en minutes" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select value={form.pack_id} onChange={(e) => setForm({ ...form, pack_id: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Créer le QCM</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
          </div>
        </form>
      </Card>

      <Card className="mt-5 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <FormInput label="Recherche" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <select value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Toutes les matières</option>
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select value={filters.pack} onChange={(e) => setFilters({ ...filters, pack: e.target.value })} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Tous les packs</option>
            {data.packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
          </select>
        </div>
      </Card>

      <div className="mt-6">
        <Table
          rows={rows}
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'duration_minutes', label: 'Durée' },
            { key: 'is_published', label: 'Publié', render: (row) => <Badge tone={row.is_published ? 'active' : 'inactive'}>{row.is_published ? 'Oui' : 'Non'}</Badge> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Link to={`/admin/quizzes/${row.id}`}><Button variant="secondary">Modifier</Button></Link>
                  <Button variant="outline" onClick={() => togglePublish(row)}>
                    {row.is_published ? 'Désactiver' : 'Publier'}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
      <Modal open={importModal} title="Importer des questions" onClose={closeImportModal}>
        <div className="grid gap-4">
          <AlertMessage type="info">
            Colonnes attendues : quiz_title, subject, question, answer_a, answer_b, answer_c, answer_d, correct_answer, explanation.
          </AlertMessage>
          <input
            type="file"
            accept=".csv,.tsv,.xlsx"
            onChange={parseImport}
            className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          {importRows.length ? (
            <>
              <p className="text-sm font-semibold text-slate-700">{importRows.length} question(s) détectée(s).</p>
              {importErrors.length ? (
                <AlertMessage type="error">
                  <div className="grid gap-1">
                    {importErrors.map((error) => <span key={error}>{error}</span>)}
                  </div>
                </AlertMessage>
              ) : null}
              <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-mist text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Ligne</th>
                      <th className="px-3 py-2">QCM</th>
                      <th className="px-3 py-2">Matière</th>
                      <th className="px-3 py-2">Question</th>
                      <th className="px-3 py-2">Bonne réponse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importRows.slice(0, 20).map((row) => (
                      <tr key={row.line} className={row.errors.length ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2">{row.line}</td>
                        <td className="px-3 py-2">{row.quiz_title}</td>
                        <td className="px-3 py-2">{row.subject}</td>
                        <td className="px-3 py-2">{row.question}</td>
                        <td className="px-3 py-2">{row.correct_answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={closeImportModal} disabled={importing}>Annuler</Button>
                <Button onClick={confirmImport} loading={importing} disabled={Boolean(importErrors.length)}>
                  Confirmer l’import
                </Button>
              </div>
            </>
          ) : null}
          {!importRows.length ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={closeImportModal} disabled={importing}>Annuler</Button>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

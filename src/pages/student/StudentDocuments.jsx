import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { listStudentDocuments, listStudentSubjects } from '../../lib/dataService';
import { supabase } from '../../lib/supabaseClient';

const types = ['support', 'resume', 'annale', 'correction'];
const typeLabels = {
  support: 'Support',
  resume: 'Résumé',
  annale: 'Annale',
  correction: 'Correction',
};

export default function StudentDocuments() {
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [searchParams] = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [type, setType] = useState('');
  const [data, setData] = useState(null);
  const [openingAction, setOpeningAction] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!activePack?.pack_id) {
      setData({ subjects: [], documents: [] });
      return;
    }
    Promise.all([listStudentSubjects(activePack.pack_id), listStudentDocuments(activePack.pack_id)])
      .then(([subjects, documents]) => setData({ subjects, documents }))
      .catch((error) => {
        console.error('Student documents load failed:', error);
        setData({ subjects: [], documents: [] });
      });
  }, [activePack?.pack_id]);

  const documents = useMemo(() => {
    if (!data) return [];
    return data.documents.filter((doc) => (!subject || doc.subject_id === subject) && (!type || doc.document_type === type));
  }, [data, subject, type]);

  const handleOpenDocument = async (doc, action = 'open') => {
    setMessage(null);
    if (!doc.file_path) {
      setMessage({ type: 'error', text: 'Fichier PDF introuvable pour ce document.' });
      return;
    }

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      setMessage({ type: 'error', text: 'Autorisez les pop-ups pour ouvrir le PDF.' });
      return;
    }

    const actionKey = `${doc.id}:${action}`;
    setOpeningAction(actionKey);
    try {
      const { data: signedData, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) {
        newWindow.close();
        console.error('Student document signed URL storage error:', {
          documentId: doc.id,
          filePath: doc.file_path,
          error,
          message: error.message,
          statusCode: error.statusCode,
        });
        setMessage({ type: 'error', text: error.message || 'Impossible d’ouvrir le PDF.' });
        return;
      }

      if (!signedData?.signedUrl) {
        newWindow.close();
        setMessage({ type: 'error', text: 'Impossible de générer le lien sécurisé du PDF.' });
        return;
      }

      newWindow.location.href = signedData.signedUrl;
    } catch (error) {
      newWindow.close();
      console.error('Student document signed URL load failed:', {
        documentId: doc.id,
        filePath: doc.file_path,
        error,
        message: error.message,
      });
      setMessage({ type: 'error', text: error.message || 'Impossible d’ouvrir le PDF.' });
    } finally {
      setOpeningAction(null);
    }
  };

  if (!data) return <LoadingSpinner label="Chargement des documents..." />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Supports PDF</h1>
      {message ? (
        <div className="mt-4">
          <AlertMessage type={message.type}>{message.text}</AlertMessage>
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">Toutes les matières</option>
          {data.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">Tous les types</option>
          {types.map((item) => <option key={item} value={item}>{typeLabels[item]}</option>)}
        </select>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gold">{typeLabels[doc.document_type] || doc.document_type}</p>
            <h2 className="mt-2 font-black text-navy">{doc.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{doc.description}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">{doc.subjects?.name || doc.subjects?.[0]?.name}</p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                loading={openingAction === `${doc.id}:open`}
                disabled={Boolean(openingAction)}
                onClick={() => handleOpenDocument(doc, 'open')}
              >
                <Eye className="h-4 w-4" />Lire le PDF
              </Button>
              <Button
                variant="outline"
                loading={openingAction === `${doc.id}:download`}
                disabled={Boolean(openingAction)}
                onClick={() => handleOpenDocument(doc, 'download')}
              >
                <Download className="h-4 w-4" />Télécharger
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {!documents.length ? <div className="mt-6"><EmptyState title="Aucun document disponible" /></div> : null}
    </div>
  );
}

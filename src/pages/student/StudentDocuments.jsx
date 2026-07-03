import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getDocumentSignedUrl, listDocuments, listSubjects } from '../../lib/dataService';

const types = ['support', 'resume', 'annale', 'correction'];
const typeLabels = {
  support: 'Support',
  resume: 'Résumé',
  annale: 'Annale',
  correction: 'Correction',
};

export default function StudentDocuments() {
  const [searchParams] = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [type, setType] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([listSubjects(), listDocuments()]).then(([subjects, documents]) => setData({ subjects, documents }));
  }, []);

  const documents = useMemo(() => {
    if (!data) return [];
    return data.documents.filter((doc) => (!subject || doc.subject_id === subject) && (!type || doc.document_type === type));
  }, [data, subject, type]);

  const openDocument = async (id) => {
    const url = await getDocumentSignedUrl(id);
    if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!data) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Supports PDF</h1>
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
              <Button variant="secondary" onClick={() => openDocument(doc.id)}><Eye className="h-4 w-4" />Consulter</Button>
              <Button variant="outline" onClick={() => openDocument(doc.id)}><Download className="h-4 w-4" />Télécharger</Button>
            </div>
          </Card>
        ))}
      </div>
      {!documents.length ? <div className="mt-6"><EmptyState title="Aucun document disponible" /></div> : null}
    </div>
  );
}

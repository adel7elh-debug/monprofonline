import { useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { listRecordings, listSubjects } from '../../lib/dataService';
import { formatDate } from '../../utils/formatDate';
import { getYoutubeEmbedUrl } from '../../utils/youtube';

export default function StudentRecordings() {
  const [subject, setSubject] = useState('');
  const [data, setData] = useState(null);
  useEffect(() => {
    Promise.all([listSubjects(), listRecordings()]).then(([subjects, recordings]) => setData({ subjects, recordings }));
  }, []);
  const recordings = useMemo(() => data?.recordings.filter((item) => !subject || item.subject_id === subject) || [], [data, subject]);
  if (!data) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Mes enregistrements</h1>
      <div className="mt-4"><AlertMessage type="info">Ce contenu est reserve aux etudiants inscrits. Merci de ne pas partager les liens.</AlertMessage></div>
      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="focus-ring mt-5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
        <option value="">Toutes les matieres</option>
        {data.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {recordings.map((recording) => {
          const url = recording.youtube_playlist_url || recording.youtube_video_url;
          const embed = recording.embed_enabled ? getYoutubeEmbedUrl(url) : null;
          return (
            <Card key={recording.id} className="p-5">
              <h2 className="font-black text-navy">{recording.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{recording.subjects?.name} - {formatDate(recording.session_date)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{recording.description}</p>
              {embed ? <iframe className="mt-4 aspect-video w-full rounded-md" src={embed} title={recording.title} allowFullScreen /> : null}
              <a href={url} target="_blank" rel="noreferrer"><Button className="mt-4">Voir l'enregistrement</Button></a>
            </Card>
          );
        })}
      </div>
      {!recordings.length ? <div className="mt-6"><EmptyState title="Aucun enregistrement" /></div> : null}
    </div>
  );
}

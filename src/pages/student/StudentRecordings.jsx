import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { listStudentRecordings, listStudentSubjects } from '../../lib/dataService';
import { formatDate } from '../../utils/formatDate';
import { getYoutubeEmbedUrl } from '../../utils/youtube';

export default function StudentRecordings() {
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [subject, setSubject] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activePack?.pack_id) {
      console.warn('Aucun pack actif : aucun enregistrement video ne peut etre charge.');
      setData({ subjects: [], recordings: [] });
      return;
    }

    Promise.all([listStudentSubjects(activePack.pack_id), listStudentRecordings(activePack.pack_id)])
      .then(([subjects, recordings]) => {
        console.log('recordings reçus', recordings);
        const packRecordings = recordings.filter((recording) => recording.pack_id === activePack.pack_id);
        console.log('recordings filtrés par pack', { activePackId: activePack.pack_id, recordings: packRecordings });
        setData({ subjects, recordings: packRecordings });
      })
      .catch((loadError) => {
        console.error('Erreur Supabase enregistrements vidéo:', {
          activePackId: activePack.pack_id,
          error: loadError,
          message: loadError.message,
          details: loadError.details,
          hint: loadError.hint,
          code: loadError.code,
        });
        setError(loadError.message || 'Impossible de charger les enregistrements vidéo.');
        setData({ subjects: [], recordings: [] });
      });
  }, [activePack?.pack_id]);

  const recordings = useMemo(
    () => data?.recordings.filter((item) => !subject || item.subject_id === subject) || [],
    [data, subject],
  );

  const openVideo = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) setError('Autorisez les pop-ups pour ouvrir la vidéo.');
  };

  if (!data) return <LoadingSpinner label="Chargement des enregistrements vidéo..." />;

  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Enregistrements vidéo</h1>
      <div className="mt-4">
        <AlertMessage type="info">Ce contenu est réservé aux étudiants inscrits. Merci de ne pas partager les liens.</AlertMessage>
      </div>
      {error ? (
        <div className="mt-4">
          <AlertMessage type="error">{error}</AlertMessage>
        </div>
      ) : null}

      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="focus-ring mt-5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
        <option value="">Toutes les matières</option>
        {data.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {recordings.map((recording) => {
          const videoUrl = recording.youtube_video_url || recording.youtube_playlist_url;
          const embedUrl = recording.embed_enabled ? getYoutubeEmbedUrl(videoUrl) : null;

          return (
            <Card key={recording.id} className="p-5">
              <h2 className="font-black text-navy">{recording.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {recording.subjects?.name || 'Matière'} - {formatDate(recording.session_date)}
              </p>
              {recording.description ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">{recording.description}</p>
              ) : null}

              {embedUrl ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-navy shadow-sm">
                  <iframe
                    src={embedUrl}
                    title={recording.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}

              {videoUrl ? (
                <Button className="mt-4" onClick={() => openVideo(videoUrl)}>
                  Regarder la vidéo
                </Button>
              ) : null}
            </Card>
          );
        })}
      </div>

      {!recordings.length ? (
        <div className="mt-6">
          <EmptyState title="Aucun enregistrement vidéo disponible pour le moment." />
        </div>
      ) : null}
    </div>
  );
}

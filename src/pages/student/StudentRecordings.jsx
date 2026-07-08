import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { listStudentRecordings, listStudentSubjects } from '../../lib/dataService';
import { supabase } from '../../lib/supabaseClient';
import { getYoutubeEmbedUrl } from '../../utils/youtube';

const getEmbeddableVideoUrl = (url) => {
  const youtubeUrl = getYoutubeEmbedUrl(url);
  if (youtubeUrl) return youtubeUrl;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    if (parsed.hostname.includes('drive.google.com')) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      return fileMatch?.[1] ? `https://drive.google.com/file/d/${fileMatch[1]}/preview` : null;
    }
  } catch {
    return null;
  }

  return null;
};

export default function StudentRecordings() {
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [subject, setSubject] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!activePack?.pack_id) {
      console.warn('Aucun pack actif : aucun enregistrement video ne peut etre charge.');
      setData({ subjects: [], recordings: [] });
      return;
    }

    Promise.all([listStudentSubjects(activePack.pack_id), listStudentRecordings(activePack.pack_id)])
      .then(([subjects, recordings]) => setData({ subjects, recordings }))
      .catch((loadError) => {
        console.error('Student video recordings load failed:', {
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

  const openExternalVideo = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) setError('Autorisez les pop-ups pour ouvrir la vidéo.');
  };

  const openStoredVideo = async (recording) => {
    if (!recording.file_path) {
      setError('Lien vidéo introuvable. Merci de contacter l’administration.');
      return;
    }

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      setError('Autorisez les pop-ups pour ouvrir la vidéo.');
      return;
    }

    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('videos')
        .createSignedUrl(recording.file_path, 3600);

      if (signedError || !signedData?.signedUrl) {
        newWindow.close();
        console.error('Video signed URL creation failed:', {
          recordingId: recording.id,
          filePath: recording.file_path,
          error: signedError,
          message: signedError?.message,
        });
        setError(signedError?.message || 'Impossible d’ouvrir la vidéo.');
        return;
      }

      newWindow.location.href = signedData.signedUrl;
    } catch (signedError) {
      newWindow.close();
      console.error('Video open failed:', signedError);
      setError(signedError.message || 'Impossible d’ouvrir la vidéo.');
    }
  };

  const handleWatchVideo = (recording) => {
    setError(null);
    if (recording.video_url) {
      const embedUrl = getEmbeddableVideoUrl(recording.video_url);
      if (embedUrl) {
        setPlayer({ title: recording.title, url: embedUrl });
        return;
      }
      openExternalVideo(recording.video_url);
      return;
    }
    openStoredVideo(recording);
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
        {recordings.map((recording) => (
          <Card key={recording.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-black text-navy">{recording.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {recording.subjects?.name || 'Matière'}{recording.session_label ? ` - ${recording.session_label}` : ''}
                </p>
              </div>
              {recording.duration_minutes ? (
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-navy">{recording.duration_minutes} min</span>
              ) : null}
            </div>
            {recording.description ? (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{recording.description}</p>
            ) : null}
            <Button className="mt-4" onClick={() => handleWatchVideo(recording)}>
              Regarder la vidéo
            </Button>
          </Card>
        ))}
      </div>

      {!recordings.length ? (
        <div className="mt-6">
          <EmptyState title="Aucun enregistrement vidéo disponible pour le moment." />
        </div>
      ) : null}

      <Modal open={Boolean(player)} title={player?.title || 'Enregistrement vidéo'} onClose={() => setPlayer(null)}>
        <div className="aspect-video overflow-hidden rounded-lg bg-navy">
          {player?.url ? (
            <iframe
              src={player.url}
              title={player.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

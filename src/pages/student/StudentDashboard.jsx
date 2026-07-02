import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { listAttempts, listDocuments, listQuizzes, listRecordings } from '../../lib/dataService';
import { formatDate } from '../../utils/formatDate';
import AlertMessage from '../../components/AlertMessage';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([listDocuments(), listQuizzes(), listRecordings(), listAttempts()]).then(
      ([documents, quizzes, recordings, attempts]) => setData({ documents, quizzes, recordings, attempts }),
    );
  }, []);

  if (!data) return <LoadingSpinner />;
  if (!activePack) {
    return (
      <AlertMessage type="warning">
        Pack actif introuvable. Merci de contacter l'administration.
      </AlertMessage>
    );
  }

  const studentAttempts = data.attempts.filter((item) => item.student_id === profile.id || profile.id === 'student-demo');
  const lastAttempt = studentAttempts[0];
  const progression = Math.min(100, Math.round(((studentAttempts.length + data.documents.length) / 12) * 100));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-navy">Bonjour {profile?.full_name}</h1>
        <p className="mt-1 text-slate-600">Votre espace de preparation Master.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ['Pack actif', activePack?.packs?.name || 'Pack complet'],
          ['Statut acces', profile?.access_status],
          ['Debut acces', formatDate(activePack?.start_date)],
          ['Fin acces', formatDate(activePack?.end_date)],
          ['Supports', data.documents.length],
          ['QCM', data.quizzes.length],
          ['Enregistrements', data.recordings.length],
          ['Derniere note', lastAttempt ? `${lastAttempt.score}/${lastAttempt.total_questions}` : '-'],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-navy">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-navy">Progression generale</h2>
          <span className="text-sm font-bold text-royal">{progression}%</span>
        </div>
        <div className="mt-4 h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-gold" style={{ width: `${progression}%` }} />
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getStudentDashboardSummary } from '../../lib/dataService';
import { formatDate, formatDateTime } from '../../utils/formatDate';

const statusLabels = {
  active: 'Actif',
  pending: 'En attente',
  inactive: 'Inactif',
  expired: 'Expiré',
};

export default function StudentDashboard() {
  const { profile } = useAuth();
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activePack?.pack_id || !profile?.id) {
      setData({ nextSessions: [], recentQuizzes: [], recentAttempts: [] });
      return;
    }

    getStudentDashboardSummary({ activePackId: activePack.pack_id, studentId: profile.id })
      .then(setData)
      .catch((err) => {
        console.error('Student dashboard summary load failed:', err);
        setError('Impossible de charger le résumé de votre espace.');
        setData({ nextSessions: [], recentQuizzes: [], recentAttempts: [] });
      });
  }, [activePack?.pack_id, profile?.id]);

  if (!data) return <LoadingSpinner label="Chargement de l’espace étudiant..." />;
  if (!activePack) {
    return (
      <AlertMessage type="warning">
        Pack actif introuvable. Merci de contacter l’administration.
      </AlertMessage>
    );
  }

  const lastAttempt = data.recentAttempts[0];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-navy">Bonjour {profile?.full_name}</h1>
        <p className="mt-1 text-slate-600">Votre espace de préparation Master.</p>
      </div>

      {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ['Pack actif', activePack?.packs?.name || 'Pack complet'],
          ['Statut d’accès', statusLabels[profile?.access_status] || profile?.access_status || '-'],
          ['Début d’accès', formatDate(activePack?.start_date)],
          ['Fin d’accès', formatDate(activePack?.end_date)],
          ['Prochaines séances', data.nextSessions.length],
          ['QCM récents', data.recentQuizzes.length],
          ['Tentatives récentes', data.recentAttempts.length],
          ['Dernière note', lastAttempt ? `${lastAttempt.score}/${lastAttempt.total_questions}` : '-'],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-navy">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-black text-navy">Accès rapides</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/student/documents"><Button variant="outline">Supports PDF</Button></Link>
          <Link to="/student/quizzes"><Button variant="outline">QCM</Button></Link>
          <Link to="/student/agenda"><Button variant="outline">Agenda</Button></Link>
          <Link to="/student/recordings"><Button variant="outline">Enregistrements vidéo</Button></Link>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-black text-navy">Prochaines séances</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {data.nextSessions.map((session) => (
              <p key={session.id}>
                <strong className="text-navy">{formatDate(session.session_date)}</strong> - {session.title}
              </p>
            ))}
            {!data.nextSessions.length ? <p>Aucune séance programmée cette semaine.</p> : null}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-black text-navy">Derniers QCM</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {data.recentQuizzes.map((quiz) => (
              <p key={quiz.id}>
                <strong className="text-navy">{quiz.title}</strong> - {quiz.duration_minutes} min
              </p>
            ))}
            {!data.recentQuizzes.length ? <p>Aucun QCM disponible pour le moment.</p> : null}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-black text-navy">Derniers résultats</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            {data.recentAttempts.map((attempt) => (
              <p key={attempt.id}>
                <strong className="text-navy">{attempt.quizzes?.title || 'QCM'}</strong> - {attempt.score}/{attempt.total_questions} le {formatDateTime(attempt.created_at)}
              </p>
            ))}
            {!data.recentAttempts.length ? <p>Aucune tentative enregistrée.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

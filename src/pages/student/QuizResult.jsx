import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getQuizAttemptCorrection } from '../../lib/dataService';

export default function QuizResult() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const attemptId = searchParams.get('attempt');
  const [loadedCorrection, setLoadedCorrection] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state || !attemptId || !profile?.id || !activePack?.pack_id) return;
    setLoadedCorrection(null);
    setError(null);
    getQuizAttemptCorrection({ attemptId, studentId: profile.id, activePackId: activePack.pack_id })
      .then(setLoadedCorrection)
      .catch((err) => {
        console.error('Student quiz correction load failed:', err);
        setError('Impossible de charger cette correction.');
      });
  }, [activePack?.pack_id, attemptId, profile?.id, state]);

  const result = state || loadedCorrection;

  if (!state && attemptId && !error && !loadedCorrection) {
    return <LoadingSpinner label="Chargement de la correction..." />;
  }

  if (error) {
    return (
      <div className="grid gap-4">
        <AlertMessage type="error">{error}</AlertMessage>
        <div>
          <Button variant="outline" onClick={() => navigate('/student/history')}>Retour à l'historique</Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="grid gap-4">
        <AlertMessage type="warning">Aucun résultat à afficher.</AlertMessage>
        <div>
          <Button variant="outline" onClick={() => navigate('/student/quizzes')}>Retour aux QCM</Button>
        </div>
      </div>
    );
  }

  const { questions, selected, attempt } = result;

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="p-6">
        <h1 className="text-3xl font-black text-navy">Résultat final</h1>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div><p className="text-sm text-slate-500">Score</p><p className="text-2xl font-black text-navy">{attempt.score}</p></div>
          <div><p className="text-sm text-slate-500">Questions</p><p className="text-2xl font-black text-navy">{attempt.total_questions}</p></div>
          <div><p className="text-sm text-slate-500">Pourcentage</p><p className="text-2xl font-black text-navy">{attempt.percentage}%</p></div>
          <div><p className="text-sm text-slate-500">Erreurs</p><p className="text-2xl font-black text-navy">{attempt.total_questions - attempt.score}</p></div>
        </div>
      </Card>
      <div className="mt-6 grid gap-4">
        {questions.map((question) => {
          const picked = selected[question.id] || [];
          const correct = question.answers.filter((answer) => answer.is_correct).map((answer) => answer.id);
          const ok = [...picked].sort().join(',') === [...correct].sort().join(',');
          return (
            <Card key={question.id} className="p-5">
              <h2 className="font-black text-navy">{question.question_text}</h2>
              <p className={`mt-2 text-sm font-bold ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{ok ? 'Bonne réponse' : 'Mauvaise réponse'}</p>
              <p className="mt-2 text-sm text-slate-600">Correction : {question.answers.filter((answer) => answer.is_correct).map((answer) => answer.answer_text).join(', ')}</p>
              <p className="mt-2 text-sm text-slate-600">{question.explanation}</p>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/student/history"><Button>Voir l'historique</Button></Link>
        <Button variant="outline" onClick={() => navigate('/student/quizzes')}>Retour aux QCM</Button>
      </div>
    </div>
  );
}

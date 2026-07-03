import { Link, useLocation, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function QuizResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state) return <AlertMessage type="warning">Aucun résultat à afficher.</AlertMessage>;
  const { questions, selected, attempt } = state;
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
          const ok = picked.sort().join(',') === correct.sort().join(',');
          return (
            <Card key={question.id} className="p-5">
              <h2 className="font-black text-navy">{question.question_text}</h2>
              <p className={`mt-2 text-sm font-bold ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{ok ? 'Bonne réponse' : 'Mauvaise réponse'}</p>
              <p className="mt-2 text-sm text-slate-600">Correction : {question.answers.filter((a) => a.is_correct).map((a) => a.answer_text).join(', ')}</p>
              <p className="mt-2 text-sm text-slate-600">{question.explanation}</p>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex gap-2">
        <Link to="/student/history"><Button>Historique</Button></Link>
        <Button variant="outline" onClick={() => navigate('/student/quizzes')}>Retour aux QCM</Button>
      </div>
    </div>
  );
}

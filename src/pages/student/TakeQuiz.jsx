import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getQuizWithQuestions, saveQuizAttempt } from '../../lib/dataService';

export default function TakeQuiz() {
  const { quizId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    getQuizWithQuestions(quizId).then(setData).catch((err) => setError(err.message));
  }, [quizId]);

  const question = data?.questions[current];
  const selectedIds = useMemo(() => selected[question?.id] || [], [selected, question?.id]);

  const toggle = (answerId) => {
    setSelected((state) => {
      const existing = state[question.id] || [];
      const next = existing.includes(answerId) ? existing.filter((id) => id !== answerId) : [...existing, answerId];
      return { ...state, [question.id]: next };
    });
  };

  const submit = async () => {
    const answers = data.questions.flatMap((item) => {
      const expected = item.answers.filter((answer) => answer.is_correct).map((answer) => answer.id).sort().join(',');
      const picked = (selected[item.id] || []).sort().join(',');
      return (selected[item.id] || []).map((answerId) => ({
        question_id: item.id,
        selected_answer_id: answerId,
        is_correct: expected === picked,
      }));
    });
    const score = data.questions.reduce((total, item) => {
      const expected = item.answers.filter((answer) => answer.is_correct).map((answer) => answer.id).sort().join(',');
      const picked = (selected[item.id] || []).sort().join(',');
      return total + (expected === picked ? 1 : 0);
    }, 0);
    const attempt = await saveQuizAttempt({
      quizId,
      studentId: profile.id,
      score,
      totalQuestions: data.questions.length,
      answers,
    });
    navigate(`/student/quizzes/${quizId}/result`, { state: { quiz: data.quiz, questions: data.questions, selected, attempt } });
  };

  if (error) return <AlertMessage type="error">{error}</AlertMessage>;
  if (!data) return <LoadingSpinner />;
  if (!question) return <AlertMessage type="warning">Ce QCM ne contient pas encore de questions.</AlertMessage>;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-wide text-gold">Question {current + 1} / {data.questions.length}</p>
      <h1 className="mt-2 text-2xl font-black text-navy">{data.quiz?.title}</h1>
      <Card className="mt-5 p-6">
        <h2 className="text-lg font-black text-navy">{question.question_text}</h2>
        <div className="mt-5 grid gap-3">
          {question.answers.map((answer) => (
            <label key={answer.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-semibold ${selectedIds.includes(answer.id) ? 'border-royal bg-blue-50 text-royal' : 'border-slate-200 bg-white text-slate-700'}`}>
              <input type="checkbox" checked={selectedIds.includes(answer.id)} onChange={() => toggle(answer.id)} />
              {answer.answer_text}
            </label>
          ))}
        </div>
      </Card>
      <div className="mt-5 flex justify-between">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}>Précédent</Button>
        {current < data.questions.length - 1 ? (
          <Button onClick={() => setCurrent((value) => value + 1)}>Suivant</Button>
        ) : (
          <Button onClick={submit}>Valider le QCM</Button>
        )}
      </div>
    </div>
  );
}

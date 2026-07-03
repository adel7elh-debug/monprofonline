import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, getQuizWithQuestions } from '../../lib/dataService';

export default function QuizEditor() {
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [question, setQuestion] = useState({ question_text: '', explanation: '', display_order: 0 });
  const [answers, setAnswers] = useState([
    { answer_text: '', is_correct: true },
    { answer_text: '', is_correct: false },
  ]);
  const load = () => getQuizWithQuestions(quizId).then(setData);
  useEffect(() => { load(); }, [quizId]);
  const submit = async (event) => {
    event.preventDefault();
    const created = await createRow('questions', { ...question, quiz_id: quizId });
    await Promise.all(answers.filter((item) => item.answer_text).map((answer) => createRow('answers', { ...answer, question_id: created.id })));
    setQuestion({ question_text: '', explanation: '', display_order: 0 });
    load();
  };
  if (!data) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Éditeur de QCM</h1>
      <p className="mt-1 text-slate-600">{data.quiz?.title}</p>
      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3">
          <FormInput label="Question" value={question.question_text} onChange={(e) => setQuestion({ ...question, question_text: e.target.value })} required />
          <FormInput label="Explication" value={question.explanation} onChange={(e) => setQuestion({ ...question, explanation: e.target.value })} />
          {answers.map((answer, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_auto]">
              <FormInput label={`Réponse ${index + 1}`} value={answer.answer_text} onChange={(e) => setAnswers((items) => items.map((item, i) => i === index ? { ...item, answer_text: e.target.value } : item))} />
              <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={answer.is_correct} onChange={(e) => setAnswers((items) => items.map((item, i) => i === index ? { ...item, is_correct: e.target.checked } : item))} />
                Bonne réponse
              </label>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setAnswers((items) => [...items, { answer_text: '', is_correct: false }])}>Ajouter une réponse</Button>
            <Button type="submit">Ajouter la question</Button>
          </div>
        </form>
      </Card>
      <div className="mt-6 grid gap-4">
        {data.questions.map((item) => (
          <Card key={item.id} className="p-5">
            <h2 className="font-black text-navy">{item.question_text}</h2>
            <ul className="mt-3 grid gap-1 text-sm text-slate-600">
              {item.answers?.map((answer) => <li key={answer.id}>{answer.is_correct ? '[correcte] ' : ''}{answer.answer_text}</li>)}
            </ul>
            <p className="mt-3 text-sm text-slate-500">{item.explanation}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

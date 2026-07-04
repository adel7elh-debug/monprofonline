import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, deleteRow, getQuizWithQuestions, updateRow } from '../../lib/dataService';

const emptyAnswers = () => [
  { answer_text: '', is_correct: true },
  { answer_text: '', is_correct: false },
  { answer_text: '', is_correct: false },
  { answer_text: '', is_correct: false },
];

const answerLabels = ['A', 'B', 'C', 'D'];

export default function QuizEditor() {
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [question, setQuestion] = useState({ question_text: '', explanation: '', display_order: 0 });
  const [answers, setAnswers] = useState(emptyAnswers());
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [message, setMessage] = useState(null);

  const load = () => getQuizWithQuestions(quizId).then(setData);
  useEffect(() => { load(); }, [quizId]);

  const resetForm = () => {
    setQuestion({ question_text: '', explanation: '', display_order: 0 });
    setAnswers(emptyAnswers());
    setEditingQuestionId(null);
  };

  const setCorrectAnswer = (index) => {
    setAnswers((items) => items.map((item, itemIndex) => ({ ...item, is_correct: itemIndex === index })));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    const filledAnswers = answers.filter((item) => item.answer_text.trim());
    if (filledAnswers.length !== 4) {
      setMessage({ type: 'error', text: 'Ajoutez les 4 réponses avant d’enregistrer la question.' });
      return;
    }

    if (editingQuestionId) {
      await updateRow('questions', editingQuestionId, question);
      await Promise.all(answers.map((answer) => {
        const payload = { answer_text: answer.answer_text, is_correct: answer.is_correct, question_id: editingQuestionId };
        return answer.id ? updateRow('answers', answer.id, payload) : createRow('answers', payload);
      }));
      setMessage({ type: 'success', text: 'Question modifiée avec succès.' });
    } else {
      const created = await createRow('questions', { ...question, quiz_id: quizId });
      await Promise.all(answers.map((answer) => createRow('answers', { ...answer, question_id: created.id })));
      setMessage({ type: 'success', text: 'Question ajoutée avec succès.' });
    }

    resetForm();
    load();
  };

  const editQuestion = (item) => {
    const nextAnswers = emptyAnswers().map((answer, index) => ({
      ...answer,
      ...(item.answers?.[index] || {}),
      is_correct: Boolean(item.answers?.[index]?.is_correct),
    }));
    if (!nextAnswers.some((answer) => answer.is_correct)) nextAnswers[0].is_correct = true;
    setQuestion({
      question_text: item.question_text,
      explanation: item.explanation || '',
      display_order: item.display_order || 0,
    });
    setAnswers(nextAnswers);
    setEditingQuestionId(item.id);
    setMessage(null);
  };

  const removeQuestion = async (item) => {
    const confirmed = window.confirm('Supprimer cette question ? Cette action est irréversible.');
    if (!confirmed) return;
    await Promise.all((item.answers || []).map((answer) => deleteRow('answers', answer.id)));
    await deleteRow('questions', item.id);
    if (editingQuestionId === item.id) resetForm();
    setMessage({ type: 'success', text: 'Question supprimée avec succès.' });
    load();
  };

  if (!data) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Éditeur de QCM</h1>
      <p className="mt-1 text-slate-600">{data.quiz?.title}</p>

      {message ? (
        <div className="mt-4">
          <AlertMessage type={message.type}>{message.text}</AlertMessage>
        </div>
      ) : null}

      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3">
          <FormInput label="Question" value={question.question_text} onChange={(e) => setQuestion({ ...question, question_text: e.target.value })} required />
          <FormInput label="Explication" value={question.explanation} onChange={(e) => setQuestion({ ...question, explanation: e.target.value })} />
          {answers.map((answer, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_auto]">
              <FormInput
                label={`Réponse ${answerLabels[index]}`}
                value={answer.answer_text}
                onChange={(e) => setAnswers((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, answer_text: e.target.value } : item))}
                required
              />
              <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
                <input type="radio" name="correct-answer" checked={answer.is_correct} onChange={() => setCorrectAnswer(index)} />
                Bonne réponse
              </label>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {editingQuestionId ? <Button type="button" variant="outline" onClick={resetForm}>Annuler la modification</Button> : null}
            <Button type="submit">{editingQuestionId ? 'Modifier la question' : 'Ajouter la question'}</Button>
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
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => editQuestion(item)}>Modifier</Button>
              <Button variant="danger" onClick={() => removeQuestion(item)}>Supprimer</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

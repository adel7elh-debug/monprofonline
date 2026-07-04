import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { listStudentQuizzes, listStudentSubjects } from '../../lib/dataService';

export default function StudentQuizzes() {
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [subject, setSubject] = useState('');
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!activePack?.pack_id) {
      setData({ subjects: [], quizzes: [] });
      return;
    }
    Promise.all([listStudentSubjects(activePack.pack_id), listStudentQuizzes(activePack.pack_id)])
      .then(([subjects, quizzes]) => setData({ subjects, quizzes }))
      .catch((error) => {
        console.error('Student quizzes load failed:', error);
        setData({ subjects: [], quizzes: [] });
      });
  }, [activePack?.pack_id]);
  const quizzes = useMemo(() => data?.quizzes.filter((quiz) => !subject || quiz.subject_id === subject) || [], [data, subject]);
  if (!data) return <LoadingSpinner label="Chargement des QCM..." />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">QCM</h1>
      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="focus-ring mt-5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
        <option value="">Toutes les matières</option>
        {data.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-5">
            <h2 className="font-black text-navy">{quiz.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">{quiz.duration_minutes} minutes</p>
            <Link to={`/student/quizzes/${quiz.id}`}><Button className="mt-4 w-full">Commencer le QCM</Button></Link>
          </Card>
        ))}
      </div>
      {!quizzes.length ? <div className="mt-6"><EmptyState title="Aucun QCM disponible" /></div> : null}
    </div>
  );
}

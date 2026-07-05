import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getStudentSubjectsOverview } from '../../lib/dataService';

export default function StudentSubjects() {
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!activePack?.pack_id) {
      setData({ subjects: [], documentCounts: {}, quizCounts: {}, recordingCounts: {} });
      return;
    }
    getStudentSubjectsOverview(activePack.pack_id).then(setData).catch((error) => {
      console.error('Student subjects load failed:', error);
      setData({ subjects: [], documentCounts: {}, quizCounts: {}, recordingCounts: {} });
    });
  }, [activePack?.pack_id]);
  if (!data) return <LoadingSpinner label="Chargement..." />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Mes matières</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.subjects.map((subject) => (
          <Card key={subject.id} className="p-5">
            <h2 className="font-black text-navy">{subject.name}</h2>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <p>{data.documentCounts[subject.id] || 0} documents</p>
              <p>{data.quizCounts[subject.id] || 0} QCM</p>
              <p>{data.recordingCounts[subject.id] || 0} enregistrements</p>
            </div>
            <Link to={`/student/documents?subject=${subject.id}`}><Button variant="outline" className="mt-4 w-full">Consulter</Button></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

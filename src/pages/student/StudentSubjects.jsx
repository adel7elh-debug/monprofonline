import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { listDocuments, listQuizzes, listRecordings, listSubjects } from '../../lib/dataService';

export default function StudentSubjects() {
  const [data, setData] = useState(null);
  useEffect(() => {
    Promise.all([listSubjects(), listDocuments(), listQuizzes(), listRecordings()]).then(
      ([subjects, documents, quizzes, recordings]) => setData({ subjects, documents, quizzes, recordings }),
    );
  }, []);
  if (!data) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Mes matières</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.subjects.map((subject) => (
          <Card key={subject.id} className="p-5">
            <h2 className="font-black text-navy">{subject.name}</h2>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <p>{data.documents.filter((item) => item.subject_id === subject.id).length} documents</p>
              <p>{data.quizzes.filter((item) => item.subject_id === subject.id).length} QCM</p>
              <p>{data.recordings.filter((item) => item.subject_id === subject.id).length} enregistrements</p>
            </div>
            <Link to={`/student/documents?subject=${subject.id}`}><Button variant="outline" className="mt-4 w-full">Consulter</Button></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

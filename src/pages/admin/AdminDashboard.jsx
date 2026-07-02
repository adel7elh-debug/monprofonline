import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Table from '../../components/Table';
import {
  listAttempts,
  listContactMessages,
  listDocuments,
  listProfiles,
  listQuizzes,
  listRecordings,
  listRegistrationRequests,
} from '../../lib/dataService';
import { formatDateTime } from '../../utils/formatDate';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    Promise.all([
      listProfiles(),
      listRegistrationRequests(),
      listDocuments(),
      listQuizzes(),
      listRecordings(),
      listAttempts(),
      listContactMessages(),
    ]).then(([profiles, requests, documents, quizzes, recordings, attempts, messages]) =>
      setData({ profiles, requests, documents, quizzes, recordings, attempts, messages }),
    );
  }, []);
  if (!data) return <LoadingSpinner />;
  const students = data.profiles.filter((profile) => profile.role === 'student');
  const average = data.attempts.length
    ? Math.round(data.attempts.reduce((total, item) => total + Number(item.percentage || 0), 0) / data.attempts.length)
    : 0;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Dashboard admin</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Etudiants total', students.length],
          ['Etudiants actifs', students.filter((item) => item.access_status === 'active').length],
          ['Demandes en attente', data.requests.filter((item) => item.status === 'pending').length],
          ['Supports', data.documents.length],
          ['QCM', data.quizzes.length],
          ['Enregistrements', data.recordings.length],
          ['Tentatives QCM', data.attempts.length],
          ['Moyenne scores', `${average}%`],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-navy">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 font-black text-navy">Dernieres demandes</h2>
          <Table
            rows={data.requests.slice(0, 5)}
            columns={[
              { key: 'full_name', label: 'Nom' },
              { key: 'phone', label: 'Telephone' },
              { key: 'status', label: 'Statut' },
              { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
            ]}
          />
        </div>
        <div>
          <h2 className="mb-3 font-black text-navy">Dernieres tentatives</h2>
          <Table
            rows={data.attempts.slice(0, 5)}
            columns={[
              { key: 'quiz', label: 'QCM', render: (row) => row.quizzes?.title || row.quiz_id },
              { key: 'score', label: 'Score', render: (row) => `${row.score}/${row.total_questions}` },
              { key: 'percentage', label: '%' },
              { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

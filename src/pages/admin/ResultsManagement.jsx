import { useEffect, useState } from 'react';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { listAttempts } from '../../lib/dataService';
import { formatDateTime } from '../../utils/formatDate';

export default function ResultsManagement() {
  const [attempts, setAttempts] = useState(null);
  useEffect(() => { listAttempts().then(setAttempts); }, []);
  if (!attempts) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Résultats des étudiants</h1>
      <div className="mt-6">
        <Table
          rows={attempts}
          columns={[
            { key: 'student', label: 'Étudiant', render: (row) => row.profiles?.full_name || row.student_id },
            { key: 'quiz', label: 'QCM', render: (row) => row.quizzes?.title || row.quiz_id },
            { key: 'score', label: 'Score', render: (row) => `${row.score}/${row.total_questions}` },
            { key: 'percentage', label: 'Pourcentage', render: (row) => <Badge tone={row.percentage >= 50 ? 'active' : 'expired'}>{row.percentage}%</Badge> },
            { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
          ]}
        />
      </div>
    </div>
  );
}

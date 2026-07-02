import { useEffect, useState } from 'react';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { listAttempts } from '../../lib/dataService';
import { formatDateTime } from '../../utils/formatDate';

export default function QuizHistory() {
  const [attempts, setAttempts] = useState(null);
  useEffect(() => { listAttempts().then(setAttempts); }, []);
  if (!attempts) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-black text-navy">Historique QCM</h1>
      <div className="mt-6">
        <Table
          rows={attempts}
          columns={[
            { key: 'created_at', label: 'Date', render: (row) => formatDateTime(row.created_at) },
            { key: 'quiz', label: 'QCM', render: (row) => row.quizzes?.title || row.quiz_id },
            { key: 'score', label: 'Score', render: (row) => `${row.score}/${row.total_questions}` },
            { key: 'percentage', label: 'Pourcentage', render: (row) => <Badge tone={row.percentage >= 50 ? 'active' : 'expired'}>{row.percentage}%</Badge> },
            { key: 'details', label: 'Details', render: () => 'Correction disponible apres chaque tentative' },
          ]}
        />
      </div>
    </div>
  );
}

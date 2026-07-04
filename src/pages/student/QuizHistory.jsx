import { useEffect, useState } from 'react';
import Badge from '../../components/Badge';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { listStudentAttempts } from '../../lib/dataService';
import { formatDateTime } from '../../utils/formatDate';

export default function QuizHistory() {
  const { profile } = useAuth();
  const [attempts, setAttempts] = useState(null);
  useEffect(() => {
    if (!profile?.id) {
      setAttempts([]);
      return;
    }
    listStudentAttempts(profile.id)
      .then(setAttempts)
      .catch((error) => {
        console.error('Student quiz history load failed:', error);
        setAttempts([]);
      });
  }, [profile?.id]);
  if (!attempts) return <LoadingSpinner label="Chargement de l’historique..." />;
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
            { key: 'details', label: 'Détails', render: () => 'Correction disponible après chaque tentative' },
          ]}
        />
      </div>
    </div>
  );
}

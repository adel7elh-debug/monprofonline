import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CalendarDays, PlayCircle, Video } from 'lucide-react';
import AlertMessage from '../../components/AlertMessage';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getStudentSessions, listStudentSubjects } from '../../lib/dataService';

const statusLabels = {
  scheduled: 'Programmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const statusTones = {
  scheduled: 'pending',
  completed: 'active',
  cancelled: 'expired',
};

const viewLabels = {
  current: 'Cette semaine',
  next: 'Semaine prochaine',
  all: 'Toutes les séances',
};

const toDateInput = (date) => date.toISOString().slice(0, 10);

const getWeekRange = (offset = 0) => {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1 + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toDateInput(monday), end: toDateInput(sunday) };
};

const getSessionDay = (session) =>
  new Intl.DateTimeFormat('fr-MA', { weekday: 'long', day: '2-digit', month: 'long' }).format(
    new Date(`${session.session_date}T00:00:00`),
  );

const getSessionTime = (session) =>
  [session.start_time?.slice(0, 5), session.end_time?.slice(0, 5)].filter(Boolean).join(' - ');

const matchesView = (session, view) => {
  if (view === 'all') return true;
  const range = getWeekRange(view === 'next' ? 1 : 0);
  return session.session_date >= range.start && session.session_date <= range.end;
};

export default function StudentAgenda() {
  const outletContext = useOutletContext() || {};
  const { activePack } = outletContext;
  const [data, setData] = useState(null);
  const [view, setView] = useState('current');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    if (!activePack?.pack_id) {
      setData({ sessions: [], subjects: [] });
      return;
    }

    const range = view === 'all' ? { start: toDateInput(new Date()) } : getWeekRange(view === 'next' ? 1 : 0);
    Promise.all([getStudentSessions(activePack.pack_id, { from: range.start, to: range.end, limit: view === 'all' ? 100 : 50 }), listStudentSubjects(activePack.pack_id)])
      .then(([sessions, subjects]) => setData({ sessions, subjects }))
      .catch((err) => {
        console.error('Student agenda load error:', err);
        setError('Impossible de charger votre agenda.');
        setData({ sessions: [], subjects: [] });
      });
  }, [activePack?.pack_id, view]);

  const filteredSessions = useMemo(() => {
    const sessions = data?.sessions || [];
    return sessions.filter((session) => {
      if (!matchesView(session, view)) return false;
      if (subjectFilter && session.subject_id !== subjectFilter) return false;
      return true;
    });
  }, [data, view, subjectFilter]);

  const groupedSessions = useMemo(
    () =>
      filteredSessions.reduce((groups, session) => {
        const day = getSessionDay(session);
        return { ...groups, [day]: [...(groups[day] || []), session] };
      }, {}),
    [filteredSessions],
  );

  if (!data) return <LoadingSpinner label="Chargement de l’agenda..." />;

  if (!activePack?.pack_id) {
    return (
      <AlertMessage type="warning">
        Pack actif introuvable. Merci de contacter l’administration.
      </AlertMessage>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black text-navy">Agenda</h1>
        <p className="mt-1 text-sm text-slate-600">Consultez les séances programmées pour votre pack.</p>
      </div>

      {error ? <AlertMessage type="error">{error}</AlertMessage> : null}

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <select value={view} onChange={(e) => setView(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            {Object.entries(viewLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Toutes les matières</option>
            {data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
        </div>
      </Card>

      {filteredSessions.length ? (
        <div className="grid gap-4">
          {Object.entries(groupedSessions).map(([day, sessions]) => (
            <Card key={day} className="p-5">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gold" />
                <h2 className="font-black capitalize text-navy">{day}</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {sessions.map((session) => (
                  <div key={session.id} className="rounded-md border border-slate-200 bg-mist p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-royal">
                          {getSessionTime(session)} | {session.subjects?.name || 'Matière'}
                        </p>
                        <h3 className="mt-1 font-black text-navy">{session.title}</h3>
                        {session.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{session.description}</p> : null}
                      </div>
                      <Badge tone={statusTones[session.status]}>{statusLabels[session.status]}</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {session.meet_link ? (
                        <a href={session.meet_link} target="_blank" rel="noreferrer">
                          <Button variant="secondary"><Video className="h-4 w-4" />Rejoindre la séance</Button>
                        </a>
                      ) : null}
                      {session.replay_link ? (
                        <a href={session.replay_link} target="_blank" rel="noreferrer">
                          <Button variant="outline"><PlayCircle className="h-4 w-4" />Voir le replay</Button>
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Aucune séance programmée pour le moment." />
      )}
    </div>
  );
}

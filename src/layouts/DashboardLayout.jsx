import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  Home,
  Inbox,
  Library,
  MessageSquare,
  PlaySquare,
  Settings,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const studentItems = [
  { to: '/student', label: 'Dashboard', icon: Home },
  { to: '/student/subjects', label: 'Mes matières', icon: Library },
  { to: '/student/documents', label: 'Supports PDF', icon: FileText },
  { to: '/student/quizzes', label: 'QCM', icon: ClipboardList },
  { to: '/student/history', label: 'Historique QCM', icon: Trophy },
  { to: '/student/recordings', label: 'Enregistrements', icon: PlaySquare },
  { to: '/student/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/student/profile', label: 'Profil', icon: Settings },
];

const adminItems = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/requests', label: 'Demandes', icon: Inbox },
  { to: '/admin/students', label: 'Étudiants', icon: Users },
  { to: '/admin/packs', label: 'Packs', icon: FolderKanban },
  { to: '/admin/subjects', label: 'Matières', icon: BookOpen },
  { to: '/admin/documents', label: 'Documents PDF', icon: FileText },
  { to: '/admin/quizzes', label: 'QCM', icon: ClipboardList },
  { to: '/admin/results', label: 'Résultats', icon: Trophy },
  { to: '/admin/recordings', label: 'Enregistrements', icon: PlaySquare },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/messages', label: 'Messages contact', icon: MessageSquare },
];

export default function DashboardLayout({ area }) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const parentContext = useOutletContext() || {};
  const items = area === 'admin' ? adminItems : studentItems;
  const title = area === 'admin' ? 'Espace admin' : 'Espace étudiant';
  return (
    <div className="min-h-screen bg-mist">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar items={items} title={title} />
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-navy/60 lg:hidden">
          <div className="h-full">
            <Button variant="ghost" className="absolute right-3 top-3 text-white" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
            <Sidebar items={items} title={title} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
                <GraduationCap className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gold">{title}</p>
                <h1 className="font-black text-navy">{profile?.full_name || 'MonProf Online'}</h1>
              </div>
            </div>
            <HelpCircle className="h-5 w-5 text-slate-400" />
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet context={parentContext} />
        </div>
      </main>
    </div>
  );
}

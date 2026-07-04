import { Link, NavLink } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import Button from './Button';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';

const getDashboardPath = (profile) => {
  if (profile?.role === 'admin') return '/admin';
  if (profile?.role === 'student') return '/student';
  return null;
};

const getDashboardLabel = (profile) => {
  if (profile?.role === 'admin') return 'Espace admin';
  if (profile?.role === 'student') return 'Espace étudiant';
  return 'Mon espace';
};

export default function Header({ onMenu }) {
  const { user, profile, profileLoading, loading, signOut } = useAuth();
  const dashboardPath = getDashboardPath(profile);
  const dashboardLoading = loading || profileLoading || !dashboardPath;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[80px] max-w-7xl items-center justify-between px-4 py-2 sm:px-6 md:min-h-[92px] lg:min-h-[104px] lg:px-8">
        <Link to="/" className="flex min-w-0 items-center">
          <BrandLogo imageClassName="h-16 w-auto md:h-20 lg:h-24" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <NavLink to="/packs" className={({ isActive }) => (isActive ? 'text-royal' : '')}>
            Packs
          </NavLink>
          <NavLink to="/inscription" className={({ isActive }) => (isActive ? 'text-royal' : '')}>
            Inscription
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'text-royal' : '')}>
            Contact
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => (isActive ? 'text-royal' : '')}>
            FAQ
          </NavLink>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-600">{profile?.full_name || user.email}</span>
              {dashboardPath ? (
                <Link to={dashboardPath}>
                  <Button variant="secondary" className="bg-navy hover:bg-royal">
                    {getDashboardLabel(profile)}
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" className="bg-navy hover:bg-royal" disabled={dashboardLoading}>
                  Mon espace
                </Button>
              )}
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="secondary">Connexion</Button>
            </Link>
          )}
        </div>
        <Button variant="ghost" className="md:hidden" onClick={onMenu} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

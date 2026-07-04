import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
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

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user, profile, profileLoading, loading, signOut } = useAuth();
  const dashboardPath = getDashboardPath(profile);
  const dashboardLoading = loading || profileLoading || !dashboardPath;
  const closeMenu = () => setOpen(false);
  const logout = () => {
    closeMenu();
    signOut();
  };

  return (
    <div className="app-shell bg-mist">
      <Header onMenu={() => setOpen((value) => !value)} />
      {open ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2 text-sm font-semibold text-navy">
            <Link to="/packs" onClick={closeMenu}>Packs</Link>
            <Link to="/professeurs" onClick={closeMenu}>Nos profs</Link>
            <Link to="/inscription" onClick={closeMenu}>Inscription</Link>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
            <Link to="/faq" onClick={closeMenu}>FAQ</Link>
            {user ? (
              <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3">
                <span className="text-sm font-semibold text-slate-600">{profile?.full_name || user.email}</span>
                {dashboardPath ? (
                  <Link to={dashboardPath} onClick={closeMenu}>
                    <Button className="w-full bg-navy hover:bg-royal" variant="secondary">
                      {getDashboardLabel(profile)}
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full bg-navy hover:bg-royal" variant="secondary" disabled={dashboardLoading}>
                    Mon espace
                  </Button>
                )}
                <Button className="w-full" variant="outline" onClick={logout}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={closeMenu}>
                <Button className="mt-2 w-full" variant="secondary">Connexion</Button>
              </Link>
            )}
          </div>
        </div>
      ) : null}
      <Outlet />
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-semibold text-navy">MonProf Online - Préparation aux concours de Master</p>
          <p>Le paiement est géré manuellement hors plateforme.</p>
        </div>
      </footer>
    </div>
  );
}

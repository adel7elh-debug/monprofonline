import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, LogOut, Menu } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenu }) {
  const { user, profile, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-black text-navy">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-royal text-white">
            <GraduationCap className="h-6 w-6" />
          </span>
          <span>MonProf Online</span>
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
              <span className="text-sm text-slate-600">{profile?.full_name}</span>
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

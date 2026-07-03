import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell bg-mist">
      <Header onMenu={() => setOpen((value) => !value)} />
      {open ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2 text-sm font-semibold text-navy">
            <Link to="/packs" onClick={() => setOpen(false)}>Packs</Link>
            <Link to="/inscription" onClick={() => setOpen(false)}>Inscription</Link>
            <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
            <Link to="/faq" onClick={() => setOpen(false)}>FAQ</Link>
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full" variant="secondary">Connexion</Button>
            </Link>
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

import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import BrandLogo from './BrandLogo';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ items, title, onNavigate }) {
  const { signOut } = useAuth();
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-navy text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center rounded-md bg-white px-3 py-3">
          <BrandLogo imageClassName="h-16 w-auto md:h-20" />
        </div>
        <h2 className="mt-1 text-lg font-black">{title}</h2>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-navy' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Button variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}

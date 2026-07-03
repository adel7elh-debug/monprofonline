const toneMap = {
  active: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  inactive: 'bg-slate-100 text-slate-700',
  expired: 'bg-red-100 text-red-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-amber-100 text-amber-800',
  closed: 'bg-slate-100 text-slate-700',
  default: 'bg-slate-100 text-slate-700',
};

const labelMap = {
  active: 'Actif',
  pending: 'En attente',
  inactive: 'Inactif',
  expired: 'Expiré',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  new: 'Nouveau',
  contacted: 'Contacté',
  closed: 'Clôturé',
};

export default function Badge({ children, tone = 'default' }) {
  const label = typeof children === 'string' ? labelMap[children] || children : children;

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneMap[tone] || toneMap.default}`}>
      {label}
    </span>
  );
}

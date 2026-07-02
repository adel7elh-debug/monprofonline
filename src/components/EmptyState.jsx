import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Aucun element', description = 'Les donnees apparaitront ici.' }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <Inbox className="mx-auto h-8 w-8 text-slate-400" />
      <h3 className="mt-3 font-semibold text-navy">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

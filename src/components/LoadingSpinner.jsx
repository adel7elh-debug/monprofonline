import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Chargement...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-slate-600">
      <Loader2 className="h-5 w-5 animate-spin text-royal" />
      {label}
    </div>
  );
}

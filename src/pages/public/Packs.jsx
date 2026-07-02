import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';

const items = [
  'Preparation ecrite',
  'Preparation orale',
  'Supports PDF',
  'Resumes',
  'Annales corrigees',
  'QCM corriges',
  'Enregistrements des seances',
  'Accompagnement personnalise',
  'Acces espace etudiant',
];

export default function Packs() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="overflow-hidden">
        <div className="bg-navy p-6 text-white">
          <Badge tone="pending">Offre limitee</Badge>
          <h1 className="mt-4 text-3xl font-black">Pack Complet Preparation Master</h1>
          <p className="mt-2 text-white/75">Un parcours complet pour preparer les epreuves ecrites et orales.</p>
        </div>
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_280px]">
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-200 bg-mist p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Prix</p>
            <p className="mt-2 text-4xl font-black text-navy">1300 DH</p>
            <p className="mt-2 text-sm text-slate-600">Aucun paiement en ligne dans cette version.</p>
            <div className="mt-5 grid gap-2">
              <Link to="/inscription"><Button className="w-full">Demander l'inscription</Button></Link>
              <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full"><MessageCircle className="h-4 w-4" />WhatsApp</Button>
              </a>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}

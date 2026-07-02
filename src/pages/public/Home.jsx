import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  MessageCircle,
  PlaySquare,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';

const images = {
  hero: '/images/hero-student.jpg',
  online: '/images/online-learning.jpg',
  group: '/images/study-group.jpg',
};

const features = [
  [BookOpenCheck, 'Suivi structure', 'Programme clair pour reviser progressivement, sans se disperser.'],
  [FileCheck2, 'QCM corriges', 'Evaluation avec corrections detaillees et explications utiles.'],
  [ShieldCheck, 'Supports proteges', 'PDF accessibles uniquement aux etudiants actifs du pack.'],
  [PlaySquare, 'Replay YouTube', 'Enregistrements non repertories dans l espace etudiant.'],
];

const steps = [
  ['01', 'Inscription', 'Vous envoyez votre demande et l administration vous contacte pour confirmer votre acces.'],
  ['02', 'Supports et QCM', 'Vous accedez aux PDF, resumes, annales et QCM corriges selon votre pack actif.'],
  ['03', 'Ecrit + oral', 'Vous avancez avec une methode complete pour l ecrit, puis la preparation orale.'],
];

export default function Home() {
  return (
    <>
      <section className="overflow-hidden bg-navy text-white">
        <div className="mx-auto grid min-h-[640px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-gold shadow-soft">
              <GraduationCap className="h-4 w-4" />
              Concours Master au Maroc
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Preparez vos concours de Master avec MonProf Online
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Supports PDF, resumes, QCM corriges, seances en ligne, enregistrements et accompagnement personnalise.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/inscription"><Button>S'inscrire maintenant</Button></Link>
              <Link to="/packs"><Button variant="outline">Voir les packs</Button></Link>
              <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer">
                <Button variant="secondary"><MessageCircle className="h-4 w-4" />Contact WhatsApp</Button>
              </a>
            </div>
            <div className="mt-10 grid max-w-xl gap-4 text-sm text-white/75 sm:grid-cols-3">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-gold" />Acces controle</p>
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-gold" />Replays inclus</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" />Suivi humain</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 hidden h-28 w-28 rounded-full border border-gold/30 lg:block" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-soft">
              <img
                src={images.hero}
                alt="Etudiants universitaires en revision avec ordinateur et cahiers"
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
              <div className="absolute inset-0 bg-navy/30" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-white/95 p-5 text-navy shadow-soft sm:left-auto sm:w-72">
                <p className="text-xs font-black uppercase tracking-wide text-gold">Pack complet</p>
                <h2 className="mt-2 text-xl font-black">PDF + QCM + Replays</h2>
                <p className="mt-2 text-sm font-semibold text-slate-600">Preparation ecrite & orale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-gold">Avantages</p>
            <h2 className="mt-2 text-3xl font-black text-navy">Un espace clair pour progresser avec confiance</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Une experience simple, serieuse et pensee pour les etudiants qui preparent un concours selectif.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([Icon, title, text]) => (
            <Card key={title} className="group overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-royal/10 text-royal">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-black text-navy">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              <div className="mt-5 h-1 w-12 rounded-full bg-gold transition group-hover:w-20" />
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="relative overflow-hidden rounded-2xl shadow-soft">
            <img
              src={images.online}
              alt="Etudiant suivant un cours en ligne sur ordinateur portable"
              className="h-full min-h-[360px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-navy/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/95 p-4 text-navy shadow-soft">
              <p className="text-sm font-bold text-slate-600">Formation en ligne</p>
              <p className="mt-1 text-xl font-black">Cours, supports et QCM au meme endroit</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-gold">Methode</p>
            <h2 className="mt-2 text-3xl font-black text-navy">Une methode simple pour reussir votre concours</h2>
            <div className="mt-8 grid gap-4">
              {steps.map(([number, title, text]) => (
                <div key={title} className="grid grid-cols-[56px_1fr] gap-4 rounded-xl border border-slate-200 bg-mist p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-sm font-black text-gold">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-black text-navy">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            ['Pourquoi choisir MonProf Online', 'Une preparation serieuse, organisee et centree sur les attentes des concours Master.'],
            ['Ce que contient la preparation', 'Ecrit, oral, methodologie, annales, corrections, QCM et accompagnement.'],
            ['Methode de preparation', 'Des seances ciblees, des supports pratiques et des evaluations regulieres.'],
            ['Supports PDF et QCM', 'Les ressources sont liees au pack actif et protegees par Supabase.'],
            ['Seances et enregistrements', 'Acces aux liens YouTube uniquement depuis l espace etudiant connecte.'],
            ['Temoignages', 'Des etudiants accompagnes avec une methode claire et un suivi humain.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-navy">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="grid overflow-hidden md:grid-cols-[0.9fr_1.1fr]">
          <img
            src={images.group}
            alt="Groupe d etudiants universitaires qui revisent ensemble"
            className="h-64 w-full object-cover md:h-full"
          />
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-gold">Pack disponible</p>
              <h2 className="mt-2 text-2xl font-black text-navy">Pack Complet Preparation Master - 1300 DH</h2>
              <p className="mt-2 text-slate-600">Paiement manuel apres confirmation avec l administration.</p>
            </div>
            <Link to="/packs">
              <Button>
                Voir l offre
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
}

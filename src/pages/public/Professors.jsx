import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpenCheck, CheckCircle2, GraduationCap, MessageCircle } from 'lucide-react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';

const professors = [
  {
    name: 'Adel El Haddioui',
    initials: 'AE',
    photo: '/images/professors/adil-elhaddioui.jpg',
    specialty:
      'Comptabilité, finance, gestion administrative, management et accompagnement professionnel.',
    presentation:
      'Professionnel de la comptabilité, de la finance, de la gestion administrative et du management, disposant de plus de 10 ans d’expérience dans la formation professionnelle.',
    experiences: [
      'Manager et Responsable de Site au sein d’une entreprise européenne',
      'Ex-Directeur Administratif et Financier (DAF)',
      'Formateur professionnel à l’OFPPT et à l’IIPM',
      'Professeur universitaire à la FIEP France',
      'Auditeur ISO 9001, ISO 14001 et ISO 45001',
      'Ingénieur en Management Environnemental',
    ],
    subjects: [
      'Comptabilité',
      'Finance',
      'Gestion financière',
      'Fiscalité',
      'Contrôle de gestion',
      'Management',
      'Méthodologie concours',
    ],
    message:
      'Mon objectif est d’aider les étudiants à comprendre les notions essentielles, à s’entraîner avec méthode et à préparer les concours de Master avec confiance.',
  },
  {
    name: 'Oumaima Hafid',
    initials: 'OH',
    photo: '/images/professors/oumaima-hafid.jpg',
    specialty:
      'Sciences de gestion, accompagnement des TPME, formation professionnelle et préparation aux concours.',
    presentation:
      'Doctorante en sciences de gestion, cheffe de projet chez séminaire.com, conseillère en accompagnement des TPME et formatrice en gestion.',
    experiences: [
      'Doctorante en sciences de gestion',
      'Cheffe de projet chez séminaire.com',
      'Conseillère en accompagnement des TPME',
      'Formatrice en gestion',
      'Expérience en formation professionnelle',
      'Expérience en cours de soutien',
    ],
    subjects: [
      'Gestion financière',
      'Fiscalité',
      'Marketing',
      'Management stratégique',
      'Contrôle de gestion',
      'Méthodologie concours',
    ],
    message:
      'Mon objectif est d’accompagner les étudiants avec une méthode claire, des exemples pratiques et une préparation orientée réussite aux concours de Master.',
  },
];

const methodItems = [
  'Explication simple des notions importantes',
  'QCM corrigés pour s’entraîner',
  'Séances en ligne avec replay',
  'Accompagnement pour l’oral et la méthodologie',
];

function ProfessorPhoto({ professor }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-xl bg-gradient-to-br from-navy to-royal text-5xl font-black text-gold md:h-full">
        {professor.initials}
      </div>
    );
  }

  return (
    <img
      src={professor.photo}
      alt={professor.name}
      width="520"
      height="620"
      loading="lazy"
      decoding="async"
      className="h-72 w-full rounded-xl object-cover md:h-full"
      onError={() => setFailed(true)}
    />
  );
}

function ProfessorCard({ professor }) {
  return (
    <Card className="overflow-hidden p-5 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <ProfessorPhoto professor={professor} />
        <div>
          <Badge tone="active">Intervenant MonProf Online</Badge>
          <h2 className="mt-4 text-2xl font-black text-navy">{professor.name}</h2>
          <p className="mt-3 rounded-lg bg-mist p-4 text-sm font-semibold leading-6 text-slate-700">
            {professor.specialty}
          </p>
          <p className="mt-4 leading-7 text-slate-600">{professor.presentation}</p>

          <div className="mt-6">
            <h3 className="flex items-center gap-2 font-black text-navy">
              <Award className="h-4 w-4 text-gold" />
              Fonctions et expériences
            </h3>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600">
              {professor.experiences.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="flex items-center gap-2 font-black text-navy">
              <BookOpenCheck className="h-4 w-4 text-gold" />
              Matières enseignées
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {professor.subjects.map((subject) => (
                <span key={subject} className="rounded-full bg-royal/10 px-3 py-1 text-xs font-bold text-royal">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4">
            <h3 className="flex items-center gap-2 font-black text-navy">
              <MessageCircle className="h-4 w-4 text-gold" />
              Message
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{professor.message}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Professors() {
  return (
    <main>
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-gold">
              <GraduationCap className="h-4 w-4" />
              Équipe pédagogique
            </div>
            <h1 className="mt-6 text-4xl font-black sm:text-5xl">À propos des profs</h1>
            <p className="mt-5 text-lg leading-8 text-white/80">
              Une équipe pédagogique mobilisée pour vous aider à préparer vos concours de Master avec méthode, clarté et confiance.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:px-8">
        {professors.map((professor) => (
          <ProfessorCard key={professor.name} professor={professor} />
        ))}
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="p-6 lg:p-8">
            <h2 className="text-3xl font-black text-navy">Notre méthode pédagogique</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {methodItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-mist p-4 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="bg-navy p-6 text-white lg:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black">Prêt à préparer votre concours avec méthode ?</h2>
              <p className="mt-3 max-w-2xl leading-7 text-white/75">
                Rejoignez le pack de préparation et accédez aux supports, QCM, séances et replays.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/inscription"><Button>S’inscrire maintenant</Button></Link>
              <Link to="/packs"><Button variant="outline">Voir les packs</Button></Link>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}

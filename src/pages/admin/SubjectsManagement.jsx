import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createRow, deleteRow, listSubjects, updateRow } from '../../lib/dataService';

const categories = [
  'Comptabilité',
  'Finance',
  'Fiscalité',
  'Management',
  'Marketing',
  'Économie',
  'RH',
  'Logistique',
  'Commerce international',
  'Développement durable',
  'Entrepreneuriat',
  'Méthodologie',
  'Oral',
];

const levels = ['Débutant', 'Intermédiaire', 'Avancé'];

const emptyForm = {
  name: '',
  description: '',
  category: 'Comptabilité',
  level: 'Intermédiaire',
  is_visible: true,
  display_order: 0,
};

const defaultSubjects = [
  ['Comptabilité générale & PCM', 'Bilan, CPC, journal, grand livre, balance, états de synthèse.', 'Comptabilité', 'Débutant'],
  ['Comptabilité générale & CGNC', 'Principes du Plan Comptable Marocain, amortissements, provisions.', 'Comptabilité', 'Intermédiaire'],
  ['Comptabilité analytique', 'Coûts complets, coûts variables, seuil de rentabilité.', 'Comptabilité', 'Intermédiaire'],
  ['Contrôle de gestion', 'Budgets, écarts, KPI, tableaux de bord, pilotage de performance.', 'Management', 'Avancé'],
  ['Fiscalité marocaine', 'TVA, IS, IR, déclarations fiscales et obligations fiscales.', 'Fiscalité', 'Intermédiaire'],
  ['Analyse financière', 'FR, BFR, trésorerie, ratios, SIG, CAF, diagnostic financier.', 'Finance', 'Intermédiaire'],
  ['Gestion financière', 'Choix d’investissement, VAN, TRI, rentabilité, financement.', 'Finance', 'Avancé'],
  ['Mathématiques financières', 'Actualisation, capitalisation, emprunts, annuités.', 'Finance', 'Intermédiaire'],
  ['Statistiques', 'Séries statistiques, probabilités, indices, analyse quantitative.', 'Économie', 'Intermédiaire'],
  ['Finance et banque', 'Marchés financiers, produits bancaires, risques bancaires.', 'Finance', 'Avancé'],
  ['Économie monétaire et bancaire', 'Politique monétaire, système bancaire, rôle de Bank Al-Maghrib.', 'Économie', 'Avancé'],
  ['Audit & contrôle interne', 'Démarche d’audit, contrôle interne, déontologie.', 'Comptabilité', 'Avancé'],
  ['Droit des affaires', 'Sociétés, contrats, obligations comptables, cadre légal.', 'Management', 'Intermédiaire'],
  ['Management général', 'Fonctions de management, leadership, organisation.', 'Management', 'Débutant'],
  ['Management stratégique', 'SWOT, PESTEL, BCG, diagnostic stratégique.', 'Management', 'Avancé'],
  ['Théories des organisations', 'École classique, relations humaines, évolution organisationnelle.', 'Management', 'Intermédiaire'],
  ['Marketing fondamental', 'Segmentation, ciblage, positionnement, mix marketing.', 'Marketing', 'Débutant'],
  ['Marketing digital', 'Réseaux sociaux, SEO, stratégie de contenu.', 'Marketing', 'Intermédiaire'],
  ['Techniques de vente', 'Argumentaire, objections, négociation commerciale.', 'Marketing', 'Intermédiaire'],
  ['Ressources humaines', 'Recrutement, GPEC, motivation, gestion des talents.', 'RH', 'Intermédiaire'],
  ['Droit du travail marocain', 'Contrats, licenciement, cadre légal du travail.', 'RH', 'Intermédiaire'],
  ['Rémunération & performance', 'Paie, primes, évaluation, gestion de la performance.', 'RH', 'Avancé'],
  ['Logistique & Supply Chain', 'Flux, SCM, stocks, approvisionnement, transport.', 'Logistique', 'Intermédiaire'],
  ['Commerce international', 'Incoterms, douane, paiement international, export.', 'Commerce international', 'Intermédiaire'],
  ['Économie générale', 'Microéconomie, macroéconomie, politiques économiques.', 'Économie', 'Débutant'],
  ['Microéconomie', 'Offre, demande, marché, élasticité, comportement des agents.', 'Économie', 'Intermédiaire'],
  ['Macroéconomie', 'PIB, inflation, chômage, politiques monétaires et budgétaires.', 'Économie', 'Intermédiaire'],
  ['Économie marocaine', 'Secteurs clés, politiques publiques, développement économique.', 'Économie', 'Intermédiaire'],
  ['Économie internationale', 'Commerce international, balance des paiements, taux de change.', 'Économie', 'Avancé'],
  ['Gouvernance économique', 'Institutions, transparence, gouvernance publique.', 'Économie', 'Avancé'],
  ['Économie du développement', 'Croissance, développement, sous-développement, stratégies.', 'Économie', 'Avancé'],
  ['Économie de l’environnement', 'Externalités, biens communs, fiscalité environnementale.', 'Développement durable', 'Avancé'],
  ['Développement durable & RSE', 'ODD, RSE, ISO 26000, gestion durable.', 'Développement durable', 'Intermédiaire'],
  ['Économie sociale et solidaire', 'Coopératives, associations, mutuelles, ESS au Maroc.', 'Développement durable', 'Intermédiaire'],
  ['Économie de l’énergie', 'Transition énergétique, énergies renouvelables, politique énergétique.', 'Développement durable', 'Avancé'],
  ['Entrepreneuriat', 'Business plan, étude de marché, création d’entreprise.', 'Entrepreneuriat', 'Intermédiaire'],
  ['Business Model Canvas', 'Modèle économique, proposition de valeur, stratégie projet.', 'Entrepreneuriat', 'Intermédiaire'],
  ['Méthodologie concours', 'QCM, étude de cas, dissertation, gestion du temps.', 'Méthodologie', 'Débutant'],
  ['Annales corrigées', 'Anciens concours, corrections détaillées, concours blancs.', 'Méthodologie', 'Intermédiaire'],
  ['Préparation orale', 'Entretien, motivation, projet professionnel, posture orale.', 'Oral', 'Intermédiaire'],
].map(([name, description, category, level], index) => ({
  name,
  description,
  category,
  level,
  is_visible: true,
  display_order: index + 1,
}));

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => listSubjects().then(setSubjects);

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (subjects || []).filter((subject) => {
      if (normalizedQuery && !subject.name?.toLowerCase().includes(normalizedQuery)) return false;
      if (categoryFilter && subject.category !== categoryFilter) return false;
      return true;
    });
  }, [subjects, query, categoryFilter]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category || null,
      level: form.level || 'Intermédiaire',
      is_visible: Boolean(form.is_visible),
      display_order: Number(form.display_order) || 0,
    };

    try {
      if (editingId) {
        await updateRow('subjects', editingId, payload);
        setMessage('Matière modifiée avec succès.');
      } else {
        await createRow('subjects', payload);
        setMessage('Matière ajoutée avec succès.');
      }
      resetForm();
      await load();
    } catch (err) {
      console.error('Subject save error:', err);
      setError(err.message || 'Impossible d’enregistrer la matière.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject.id);
    setMessage(null);
    setError(null);
    setForm({
      name: subject.name || '',
      description: subject.description || '',
      category: subject.category || 'Comptabilité',
      level: subject.level || 'Intermédiaire',
      is_visible: subject.is_visible !== false,
      display_order: subject.display_order || 0,
    });
  };

  const seedDefaultSubjects = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const existingNames = new Set((subjects || []).map((subject) => subject.name?.trim().toLowerCase()));
      const missingSubjects = defaultSubjects.filter((subject) => !existingNames.has(subject.name.toLowerCase()));
      await Promise.all(missingSubjects.map((subject) => createRow('subjects', subject)));
      setMessage(
        missingSubjects.length
          ? `${missingSubjects.length} matières par défaut ajoutées.`
          : 'Toutes les matières par défaut existent déjà.',
      );
      await load();
    } catch (err) {
      console.error('Default subjects insert error:', err);
      setError(err.message || 'Impossible d’ajouter les matières par défaut.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (subject) => {
    setMessage(null);
    setError(null);
    try {
      await deleteRow('subjects', subject.id);
      setMessage('Matière supprimée avec succès.');
      await load();
    } catch (err) {
      console.error('Subject delete error:', err);
      setError(err.message || 'Impossible de supprimer la matière.');
    }
  };

  if (!subjects) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-navy">Gestion des matières</h1>
          <p className="mt-1 text-sm text-slate-600">Matières de préparation aux concours de Master FSJES Maroc.</p>
        </div>
        <Button onClick={seedDefaultSubjects} loading={saving}>Ajouter les matières par défaut</Button>
      </div>

      {message ? <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}

      <Card className="mt-5 p-5">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <FormInput label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Catégorie</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Niveau</span>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {levels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
          <FormInput label="Ordre" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Statut</span>
            <select value={form.is_visible ? 'active' : 'hidden'} onChange={(e) => setForm({ ...form, is_visible: e.target.value === 'active' })} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="active">Actif</option>
              <option value="hidden">Masqué</option>
            </select>
          </label>
          <div className="flex items-end gap-2 md:col-span-2">
            <Button type="submit" loading={saving}>{editingId ? 'Modifier la matière' : 'Ajouter une matière'}</Button>
            {editingId ? <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button> : null}
          </div>
        </form>
      </Card>

      <Card className="mt-5 p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput label="Recherche par nom" value={query} onChange={(e) => setQuery(e.target.value)} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Filtrer par catégorie</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">Toutes les catégories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <div className="mt-6">
        <Table
          rows={rows}
          emptyTitle="Aucune matière trouvée."
          columns={[
            { key: 'display_order', label: 'Ordre' },
            { key: 'name', label: 'Nom' },
            { key: 'category', label: 'Catégorie', render: (row) => row.category || '-' },
            { key: 'level', label: 'Niveau', render: (row) => row.level || '-' },
            {
              key: 'is_visible',
              label: 'Statut',
              render: (row) => <Badge tone={row.is_visible === false ? 'inactive' : 'active'}>{row.is_visible === false ? 'Masqué' : 'Actif'}</Badge>,
            },
            { key: 'description', label: 'Description' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => startEdit(row)}>Modifier</Button>
                  <Button variant="danger" onClick={() => remove(row)}>Supprimer</Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

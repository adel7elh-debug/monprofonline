alter table public.subjects
add column if not exists category text,
add column if not exists level text default 'Intermédiaire',
add column if not exists is_visible boolean default true;

update public.subjects
set level = coalesce(level, 'Intermédiaire'),
    is_visible = coalesce(is_visible, true);

insert into public.subjects (name, description, category, level, is_visible, display_order)
select name, description, category, level, true, display_order
from (
  values
    ('Comptabilité générale & PCM', 'Bilan, CPC, journal, grand livre, balance, états de synthèse.', 'Comptabilité', 'Débutant', 1),
    ('Comptabilité générale & CGNC', 'Principes du Plan Comptable Marocain, amortissements, provisions.', 'Comptabilité', 'Intermédiaire', 2),
    ('Comptabilité analytique', 'Coûts complets, coûts variables, seuil de rentabilité.', 'Comptabilité', 'Intermédiaire', 3),
    ('Contrôle de gestion', 'Budgets, écarts, KPI, tableaux de bord, pilotage de performance.', 'Management', 'Avancé', 4),
    ('Fiscalité marocaine', 'TVA, IS, IR, déclarations fiscales et obligations fiscales.', 'Fiscalité', 'Intermédiaire', 5),
    ('Analyse financière', 'FR, BFR, trésorerie, ratios, SIG, CAF, diagnostic financier.', 'Finance', 'Intermédiaire', 6),
    ('Gestion financière', 'Choix d’investissement, VAN, TRI, rentabilité, financement.', 'Finance', 'Avancé', 7),
    ('Mathématiques financières', 'Actualisation, capitalisation, emprunts, annuités.', 'Finance', 'Intermédiaire', 8),
    ('Statistiques', 'Séries statistiques, probabilités, indices, analyse quantitative.', 'Économie', 'Intermédiaire', 9),
    ('Finance et banque', 'Marchés financiers, produits bancaires, risques bancaires.', 'Finance', 'Avancé', 10),
    ('Économie monétaire et bancaire', 'Politique monétaire, système bancaire, rôle de Bank Al-Maghrib.', 'Économie', 'Avancé', 11),
    ('Audit & contrôle interne', 'Démarche d’audit, contrôle interne, déontologie.', 'Comptabilité', 'Avancé', 12),
    ('Droit des affaires', 'Sociétés, contrats, obligations comptables, cadre légal.', 'Management', 'Intermédiaire', 13),
    ('Management général', 'Fonctions de management, leadership, organisation.', 'Management', 'Débutant', 14),
    ('Management stratégique', 'SWOT, PESTEL, BCG, diagnostic stratégique.', 'Management', 'Avancé', 15),
    ('Théories des organisations', 'École classique, relations humaines, évolution organisationnelle.', 'Management', 'Intermédiaire', 16),
    ('Marketing fondamental', 'Segmentation, ciblage, positionnement, mix marketing.', 'Marketing', 'Débutant', 17),
    ('Marketing digital', 'Réseaux sociaux, SEO, stratégie de contenu.', 'Marketing', 'Intermédiaire', 18),
    ('Techniques de vente', 'Argumentaire, objections, négociation commerciale.', 'Marketing', 'Intermédiaire', 19),
    ('Ressources humaines', 'Recrutement, GPEC, motivation, gestion des talents.', 'RH', 'Intermédiaire', 20),
    ('Droit du travail marocain', 'Contrats, licenciement, cadre légal du travail.', 'RH', 'Intermédiaire', 21),
    ('Rémunération & performance', 'Paie, primes, évaluation, gestion de la performance.', 'RH', 'Avancé', 22),
    ('Logistique & Supply Chain', 'Flux, SCM, stocks, approvisionnement, transport.', 'Logistique', 'Intermédiaire', 23),
    ('Commerce international', 'Incoterms, douane, paiement international, export.', 'Commerce international', 'Intermédiaire', 24),
    ('Économie générale', 'Microéconomie, macroéconomie, politiques économiques.', 'Économie', 'Débutant', 25),
    ('Microéconomie', 'Offre, demande, marché, élasticité, comportement des agents.', 'Économie', 'Intermédiaire', 26),
    ('Macroéconomie', 'PIB, inflation, chômage, politiques monétaires et budgétaires.', 'Économie', 'Intermédiaire', 27),
    ('Économie marocaine', 'Secteurs clés, politiques publiques, développement économique.', 'Économie', 'Intermédiaire', 28),
    ('Économie internationale', 'Commerce international, balance des paiements, taux de change.', 'Économie', 'Avancé', 29),
    ('Gouvernance économique', 'Institutions, transparence, gouvernance publique.', 'Économie', 'Avancé', 30),
    ('Économie du développement', 'Croissance, développement, sous-développement, stratégies.', 'Économie', 'Avancé', 31),
    ('Économie de l’environnement', 'Externalités, biens communs, fiscalité environnementale.', 'Développement durable', 'Avancé', 32),
    ('Développement durable & RSE', 'ODD, RSE, ISO 26000, gestion durable.', 'Développement durable', 'Intermédiaire', 33),
    ('Économie sociale et solidaire', 'Coopératives, associations, mutuelles, ESS au Maroc.', 'Développement durable', 'Intermédiaire', 34),
    ('Économie de l’énergie', 'Transition énergétique, énergies renouvelables, politique énergétique.', 'Développement durable', 'Avancé', 35),
    ('Entrepreneuriat', 'Business plan, étude de marché, création d’entreprise.', 'Entrepreneuriat', 'Intermédiaire', 36),
    ('Business Model Canvas', 'Modèle économique, proposition de valeur, stratégie projet.', 'Entrepreneuriat', 'Intermédiaire', 37),
    ('Méthodologie concours', 'QCM, étude de cas, dissertation, gestion du temps.', 'Méthodologie', 'Débutant', 38),
    ('Annales corrigées', 'Anciens concours, corrections détaillées, concours blancs.', 'Méthodologie', 'Intermédiaire', 39),
    ('Préparation orale', 'Entretien, motivation, projet professionnel, posture orale.', 'Oral', 'Intermédiaire', 40)
) as defaults(name, description, category, level, display_order)
where not exists (
  select 1
  from public.subjects s
  where lower(trim(s.name)) = lower(trim(defaults.name))
);

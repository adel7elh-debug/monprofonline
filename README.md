# MonProf Online - Preparation Concours Master

MVP React + Vite + Supabase pour gerer les inscriptions, acces etudiants, documents PDF proteges, QCM, resultats et enregistrements YouTube non repertories.

## Installation

```bash
npm install
npm run dev
npm run build
```

## Variables frontend

Creer `.env` a partir de `.env.example` :

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Ne jamais ajouter de `service_role` dans Vite ou React.

## Supabase

1. Creer un projet Supabase.
2. Executer `supabase/migrations/001_initial_schema.sql` dans SQL Editor.
3. Creer le bucket Storage prive `documents`.
4. Deployer les Edge Functions :
   - `create-student-from-request`
   - `activate-student-access`
   - `generate-document-signed-url`
5. Configurer les secrets cote Supabase :

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Premier compte admin

1. Creer un utilisateur dans Supabase Auth depuis le dashboard.
2. Copier son `user id`.
3. Inserer son profil admin :

```sql
insert into public.profiles (id, full_name, phone, role, access_status)
values ('USER_ID_ICI', 'Admin MonProf', '0600000000', 'admin', 'active');
```

Les comptes etudiants sont ensuite crees depuis l espace admin via l Edge Function `create-student-from-request`.

## Vercel

1. Importer le depot.
2. Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. Lancer le deploiement.
4. Verifier que `npm run build` passe avant publication.

## Architecture courte

- `src/pages/public` : pages publiques et demandes d'inscription.
- `src/pages/student` : espace etudiant avec acces controle.
- `src/pages/admin` : console admin.
- `src/context/AuthContext.jsx` : session, profil et redirection par role.
- `src/lib/dataService.js` : acces donnees Supabase avec secours demo.
- `supabase/functions` : actions sensibles utilisant la cle `service_role` uniquement cote serveur.

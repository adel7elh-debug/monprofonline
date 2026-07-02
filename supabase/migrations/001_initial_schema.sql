create extension if not exists pgcrypto;

create table if not exists public.packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text check (role in ('admin','student')) not null default 'student',
  access_status text check (access_status in ('pending','active','inactive','expired')) not null default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  city text,
  study_level text,
  field text,
  pack_id uuid references public.packs(id) on delete set null,
  message text,
  status text check (status in ('pending','accepted','rejected')) default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text,
  email text,
  message text not null,
  status text check (status in ('new','contacted','closed')) default 'new',
  created_at timestamp with time zone default now()
);

create table if not exists public.student_packs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  pack_id uuid references public.packs(id) on delete cascade,
  status text check (status in ('active','inactive','expired')) default 'active',
  start_date date,
  end_date date,
  created_at timestamp with time zone default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  pack_id uuid references public.packs(id) on delete cascade,
  file_path text not null,
  document_type text check (document_type in ('support','resume','annale','correction')) not null,
  is_visible boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  pack_id uuid references public.packs(id) on delete cascade,
  duration_minutes integer default 30,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  question_text text not null,
  explanation text,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  score numeric default 0,
  total_questions integer default 0,
  percentage numeric default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.quiz_attempts(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  selected_answer_id uuid references public.answers(id) on delete set null,
  is_correct boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  pack_id uuid references public.packs(id) on delete cascade,
  youtube_video_url text,
  youtube_playlist_url text,
  session_date timestamp with time zone,
  embed_enabled boolean default true,
  is_visible boolean default true,
  created_at timestamp with time zone default now()
);

create index if not exists idx_student_packs_student on public.student_packs(student_id);
create index if not exists idx_documents_pack on public.documents(pack_id);
create index if not exists idx_quizzes_pack on public.quizzes(pack_id);
create index if not exists idx_attempts_student on public.quiz_attempts(student_id);
create index if not exists idx_recordings_pack on public.recordings(pack_id);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_active_student()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'student'
      and access_status = 'active'
  );
$$;

create or replace function public.has_active_pack(target_pack_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_packs sp
    join public.profiles p on p.id = sp.student_id
    where sp.student_id = auth.uid()
      and sp.pack_id = target_pack_id
      and sp.status = 'active'
      and p.role = 'student'
      and p.access_status = 'active'
      and (sp.start_date is null or sp.start_date <= current_date)
      and (sp.end_date is null or sp.end_date >= current_date)
  );
$$;

alter table public.packs enable row level security;
alter table public.subjects enable row level security;
alter table public.profiles enable row level security;
alter table public.registration_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.student_packs enable row level security;
alter table public.documents enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.recordings enable row level security;

create policy "admins manage packs" on public.packs for all using (public.is_admin()) with check (public.is_admin());
create policy "students read active packs" on public.packs for select using (is_active = true and exists (select 1 from public.student_packs sp where sp.pack_id = packs.id and sp.student_id = auth.uid() and sp.status = 'active'));
create policy "public reads active packs" on public.packs for select using (is_active = true);

create policy "admins manage subjects" on public.subjects for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated reads subjects" on public.subjects for select using (auth.uid() is not null);

create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "users read own profile" on public.profiles for select using (id = auth.uid());

create policy "public creates registration requests" on public.registration_requests for insert with check (true);
create policy "admins manage registration requests" on public.registration_requests for all using (public.is_admin()) with check (public.is_admin());

create policy "public creates contact messages" on public.contact_messages for insert with check (true);
create policy "admins manage contact messages" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage student packs" on public.student_packs for all using (public.is_admin()) with check (public.is_admin());
create policy "students read own active pack" on public.student_packs for select using (student_id = auth.uid());

create policy "admins manage documents" on public.documents for all using (public.is_admin()) with check (public.is_admin());
create policy "students read pack documents" on public.documents for select using (is_visible = true and public.has_active_pack(pack_id));

create policy "admins manage quizzes" on public.quizzes for all using (public.is_admin()) with check (public.is_admin());
create policy "students read pack quizzes" on public.quizzes for select using (is_published = true and public.has_active_pack(pack_id));

create policy "admins manage questions" on public.questions for all using (public.is_admin()) with check (public.is_admin());
create policy "students read quiz questions" on public.questions for select using (
  exists (
    select 1 from public.quizzes q
    where q.id = questions.quiz_id and q.is_published = true and public.has_active_pack(q.pack_id)
  )
);

create policy "admins manage answers" on public.answers for all using (public.is_admin()) with check (public.is_admin());
create policy "students read quiz answers" on public.answers for select using (
  exists (
    select 1
    from public.questions qu
    join public.quizzes q on q.id = qu.quiz_id
    where qu.id = answers.question_id and q.is_published = true and public.has_active_pack(q.pack_id)
  )
);

create policy "admins manage quiz attempts" on public.quiz_attempts for all using (public.is_admin()) with check (public.is_admin());
create policy "students read own attempts" on public.quiz_attempts for select using (student_id = auth.uid());
create policy "students create own attempts" on public.quiz_attempts for insert with check (student_id = auth.uid() and public.is_active_student());

create policy "admins manage attempt answers" on public.quiz_attempt_answers for all using (public.is_admin()) with check (public.is_admin());
create policy "students read own attempt answers" on public.quiz_attempt_answers for select using (
  exists (select 1 from public.quiz_attempts qa where qa.id = attempt_id and qa.student_id = auth.uid())
);
create policy "students create own attempt answers" on public.quiz_attempt_answers for insert with check (
  exists (select 1 from public.quiz_attempts qa where qa.id = attempt_id and qa.student_id = auth.uid())
);

create policy "admins manage recordings" on public.recordings for all using (public.is_admin()) with check (public.is_admin());
create policy "students read pack recordings" on public.recordings for select using (is_visible = true and public.has_active_pack(pack_id));

insert into public.packs (id, name, price, description, is_active)
values ('11111111-1111-1111-1111-111111111111', 'Pack Complet Preparation Master', 1300, 'Preparation ecrite, orale, supports PDF, annales, QCM et accompagnement.', true)
on conflict (id) do nothing;

insert into public.subjects (id, name, description, display_order) values
('21111111-1111-1111-1111-111111111111', 'Economie generale', 'Concepts economiques essentiels.', 1),
('22222222-2222-2222-2222-222222222222', 'Management', 'Organisation et management.', 2),
('23333333-3333-3333-3333-333333333333', 'Finance', 'Finance generale.', 3),
('24444444-4444-4444-4444-444444444444', 'Marketing', 'Marketing et marche.', 4),
('25555555-5555-5555-5555-555555555555', 'Comptabilite', 'Bases comptables.', 5),
('26666666-6666-6666-6666-666666666666', 'Methodologie', 'Methodologie concours.', 6),
('27777777-7777-7777-7777-777777777777', 'Culture generale economique', 'Actualite et culture economique.', 7),
('28888888-8888-8888-8888-888888888888', 'Preparation orale', 'Entretien et posture orale.', 8)
on conflict (id) do nothing;

insert into public.documents (title, description, subject_id, pack_id, file_path, document_type, is_visible) values
('Resume economie generale', 'Synthese des notions essentielles.', '21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'demo/resume-economie.pdf', 'resume', true),
('Annales management corrigees', 'Sujets et corrections.', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'demo/annales-management.pdf', 'annale', true),
('Support preparation orale', 'Methodologie de l entretien oral.', '28888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'demo/oral.pdf', 'support', true);

insert into public.quizzes (id, title, description, subject_id, pack_id, duration_minutes, is_published) values
('31111111-1111-1111-1111-111111111111', 'QCM Economie - Fondamentaux', 'Notions economiques de base.', '21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 30, true),
('32222222-2222-2222-2222-222222222222', 'QCM Management - Organisations', 'Structures et styles.', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 25, true)
on conflict (id) do nothing;

insert into public.questions (id, quiz_id, question_text, explanation, display_order) values
('41111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', 'Quel indicateur mesure la richesse produite par une economie ?', 'Le PIB mesure la valeur des biens et services finaux produits.', 1),
('42222222-2222-2222-2222-222222222222', '31111111-1111-1111-1111-111111111111', 'Une inflation elevee reduit generalement le pouvoir d achat.', 'A revenu constant, la hausse generale des prix reduit la quantite achetable.', 2),
('43333333-3333-3333-3333-333333333333', '32222222-2222-2222-2222-222222222222', 'Le management participatif implique les collaborateurs dans les decisions.', 'Ce style favorise la contribution et la responsabilisation.', 1)
on conflict (id) do nothing;

insert into public.answers (question_id, answer_text, is_correct) values
('41111111-1111-1111-1111-111111111111', 'PIB', true),
('41111111-1111-1111-1111-111111111111', 'Inflation', false),
('41111111-1111-1111-1111-111111111111', 'Taux de change', false),
('42222222-2222-2222-2222-222222222222', 'Vrai', true),
('42222222-2222-2222-2222-222222222222', 'Faux', false),
('43333333-3333-3333-3333-333333333333', 'Vrai', true),
('43333333-3333-3333-3333-333333333333', 'Faux', false);

insert into public.recordings (title, description, subject_id, pack_id, youtube_video_url, youtube_playlist_url, session_date, embed_enabled, is_visible) values
('Seance economie - cadrage concours', 'Replay de la premiere seance.', '21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', null, now(), true, true),
('Seance orale - methodologie', 'Conseils pour l entretien oral.', '28888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', null, now(), true, true);

insert into public.registration_requests (full_name, phone, email, city, study_level, field, pack_id, message, status) values
('Hajar Mansouri', '0633333333', 'hajar@example.com', 'Casablanca', 'Licence', 'Economie', '11111111-1111-1111-1111-111111111111', 'Je souhaite m inscrire.', 'pending'),
('Omar Idrissi', '0644444444', 'omar@example.com', 'Rabat', 'Bac+3', 'Gestion', '11111111-1111-1111-1111-111111111111', 'Merci de me contacter.', 'pending');

insert into public.contact_messages (full_name, phone, email, message, status) values
('Nadia', '0655555555', 'nadia@example.com', 'Je veux plus d informations sur les seances.', 'new'),
('Mehdi', '0666666666', 'mehdi@example.com', 'Est-ce que les enregistrements restent disponibles ?', 'contacted');

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

create policy "admins manage document files" on storage.objects
for all using (bucket_id = 'documents' and public.is_admin())
with check (bucket_id = 'documents' and public.is_admin());

create policy "students read allowed document files" on storage.objects
for select using (
  bucket_id = 'documents'
  and exists (
    select 1
    from public.documents d
    where d.file_path = storage.objects.name
      and d.is_visible = true
      and public.has_active_pack(d.pack_id)
  )
);

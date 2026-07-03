create extension if not exists pgcrypto;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  pack_id uuid references public.packs(id) on delete cascade,
  session_date date not null,
  start_time time not null,
  end_time time,
  meet_link text,
  replay_link text,
  status text check (status in ('scheduled','completed','cancelled')) default 'scheduled',
  is_visible boolean default true,
  created_at timestamp with time zone default now()
);

create index if not exists idx_sessions_pack on public.sessions(pack_id);
create index if not exists idx_sessions_subject on public.sessions(subject_id);
create index if not exists idx_sessions_date on public.sessions(session_date);
create index if not exists idx_sessions_status on public.sessions(status);

alter table public.sessions enable row level security;

drop policy if exists "admins manage sessions" on public.sessions;
drop policy if exists "students read pack sessions" on public.sessions;

create policy "admins manage sessions"
on public.sessions
for all
using (public.is_admin())
with check (public.is_admin());

create policy "students read pack sessions"
on public.sessions
for select
using (
  is_visible = true
  and public.has_active_pack(pack_id)
);

create table if not exists public.video_recordings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid references public.subjects(id) on delete set null,
  pack_id uuid references public.packs(id) on delete cascade,
  video_url text,
  file_path text,
  duration_minutes integer,
  session_label text,
  is_visible boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_video_recordings_pack on public.video_recordings(pack_id);
create index if not exists idx_video_recordings_subject on public.video_recordings(subject_id);

alter table public.video_recordings enable row level security;

drop policy if exists "admins manage video recordings" on public.video_recordings;
create policy "admins manage video recordings"
on public.video_recordings
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "students read pack video recordings" on public.video_recordings;
create policy "students read pack video recordings"
on public.video_recordings
for select
using (
  is_visible = true
  and public.has_active_pack(pack_id)
  and (
    subject_id is null
    or exists (
      select 1
      from public.subjects s
      where s.id = subject_id
        and coalesce(s.is_visible, true) = true
    )
  )
);

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do update set public = false;

drop policy if exists "admins manage video files" on storage.objects;
create policy "admins manage video files" on storage.objects
for all
using (bucket_id = 'videos' and public.is_admin())
with check (bucket_id = 'videos' and public.is_admin());

drop policy if exists "students read allowed video files" on storage.objects;
create policy "students read allowed video files" on storage.objects
for select
using (
  bucket_id = 'videos'
  and exists (
    select 1
    from public.video_recordings vr
    left join public.subjects s on s.id = vr.subject_id
    where vr.file_path = storage.objects.name
      and vr.is_visible = true
      and public.has_active_pack(vr.pack_id)
      and coalesce(s.is_visible, true) = true
  )
);

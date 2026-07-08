alter table public.recordings
add column if not exists google_drive_url text;

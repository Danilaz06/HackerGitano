-- Schema para HackeadorGitanoEspotifai
-- Ejecuta en Supabase SQL Editor

create table if not exists public.spotify_friends (
  spotify_id text primary key,
  display_name text,
  avatar_url text,
  top_tracks text,
  top_artists text,
  updated_at timestamptz default now()
);

alter table public.spotify_friends enable row level security;

create policy "Todos pueden leer" on public.spotify_friends
  for select using (true);

create policy "Cualquiera puede insertar" on public.spotify_friends
  for insert with check (true);

create policy "Cualquiera puede actualizar" on public.spotify_friends
  for update using (true);

-- Adds approximate (city-level) visitor coordinates for the admin globe.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
alter table public.site_visits
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

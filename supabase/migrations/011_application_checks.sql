-- ============================================
-- Optional verification docs on cleaner applications.
-- ============================================
alter table public.job_applications add column if not exists has_police_check boolean default false;
alter table public.job_applications add column if not exists police_check_url text;
alter table public.job_applications add column if not exists has_wwcc boolean default false;
alter table public.job_applications add column if not exists wwcc_url text;

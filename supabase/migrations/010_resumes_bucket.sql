-- ============================================
-- Private bucket for applicant resumes (PII). Not public — admins read via
-- short-lived signed URLs generated server-side.
-- ============================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- ============================================
-- Cleaner recruitment: job applications feeding an admin approval queue.
-- Approved applicants are promoted into the staff table (role 'cleaner').
-- ============================================

create table if not exists public.job_applications (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text not null,
  phone         text not null,
  suburbs       text,                       -- areas/suburbs they can cover
  experience    text,
  availability  text,
  has_abn       boolean default false,
  right_to_work boolean default false,
  resume_url    text,
  status        text not null default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected')),
  staff_id      uuid references public.staff(id),
  created_at    timestamptz default now()
);

alter table public.job_applications enable row level security;
create index if not exists job_applications_status_idx on public.job_applications(status);
create index if not exists job_applications_created_idx on public.job_applications(created_at desc);

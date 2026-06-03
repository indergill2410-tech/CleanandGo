-- ============================================
-- Clean&Go — Core Schema
-- Mirrors the deployed production database so a fresh environment
-- (`supabase db reset`) reproduces it exactly.
-- ============================================

create extension if not exists "uuid-ossp";

-- ============================================
-- CUSTOMERS
-- ============================================
create table if not exists public.customers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null unique,
  phone       text,
  created_at  timestamptz default now()
);

alter table public.customers enable row level security;
-- No anon/authenticated policies: customer records are written/read only by
-- trusted server code using the service-role key.

-- ============================================
-- STAFF (cleaners + admins; linked to auth.users)
-- ============================================
create table if not exists public.staff (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id),
  name             text not null,
  email            text not null unique,
  phone            text,
  suburb           text,
  role             text default 'cleaner',
  status           text default 'active',
  xero_employee_id text,
  created_at       timestamptz default now()
);

alter table public.staff enable row level security;

create index if not exists staff_user_id_idx on public.staff(user_id);

-- A staff member can read their own row (useful for client-side role checks).
drop policy if exists staff_read_own on public.staff;
create policy staff_read_own
  on public.staff for select
  using (user_id = (select auth.uid()));

-- ============================================
-- BOOKINGS
-- ============================================
create table if not exists public.bookings (
  id                uuid primary key default uuid_generate_v4(),
  customer_id       uuid references public.customers(id),
  staff_id          uuid references public.staff(id),
  service_type      text not null check (service_type in ('recurring', 'oneoff', 'endoflease')),
  bedrooms          int default 2,
  bathrooms         int default 1,
  extras            jsonb default '[]'::jsonb,
  address           text not null,
  suburb            text not null,
  scheduled_date    date not null,
  scheduled_time    time not null,
  status            text default 'pending' check (status in ('pending','confirmed','in_progress','completed','cancelled')),
  price_cents       int not null,
  notes             text,
  calcom_booking_id text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.bookings enable row level security;

create index if not exists bookings_customer_id_idx on public.bookings(customer_id);
create index if not exists bookings_staff_id_idx on public.bookings(staff_id);

-- Cleaners can see bookings assigned to them.
drop policy if exists staff_own_bookings on public.bookings;
create policy staff_own_bookings
  on public.bookings for select
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())));

-- ============================================
-- PAYMENTS (Stripe)
-- ============================================
create table if not exists public.payments (
  id                       uuid primary key default uuid_generate_v4(),
  booking_id               uuid references public.bookings(id),
  stripe_payment_intent_id text unique,
  stripe_customer_id       text,
  amount_cents             int not null,
  status                   text default 'pending' check (status in ('pending','held','captured','refunded','failed')),
  captured_at              timestamptz,
  created_at               timestamptz default now()
);

alter table public.payments enable row level security;
create index if not exists payments_booking_id_idx on public.payments(booking_id);
-- Service-role only (no anon/authenticated policies).

-- ============================================
-- JOB COMPLETIONS (cleaner checklist + photos)
-- ============================================
create table if not exists public.job_completions (
  id            uuid primary key default uuid_generate_v4(),
  booking_id    uuid references public.bookings(id) unique,
  staff_id      uuid references public.staff(id),
  checklist     jsonb default '{}'::jsonb,
  before_photos text[] default '{}'::text[],
  after_photos  text[] default '{}'::text[],
  start_time    timestamptz,
  end_time      timestamptz,
  notes         text,
  submitted_at  timestamptz default now()
);

alter table public.job_completions enable row level security;
create index if not exists job_completions_staff_id_idx on public.job_completions(staff_id);

drop policy if exists staff_own_completions on public.job_completions;
create policy staff_own_completions
  on public.job_completions for select
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())));

drop policy if exists staff_submit_completions on public.job_completions;
create policy staff_submit_completions
  on public.job_completions for insert
  with check (staff_id = (select id from public.staff where user_id = (select auth.uid())));

-- ============================================
-- TIMESHEETS (payroll → Xero)
-- ============================================
create table if not exists public.timesheets (
  id                uuid primary key default uuid_generate_v4(),
  staff_id          uuid references public.staff(id),
  booking_id        uuid references public.bookings(id),
  date              date not null,
  hours_worked      numeric not null,
  hourly_rate       numeric default 28.00,
  xero_synced       boolean default false,
  xero_timesheet_id text,
  created_at        timestamptz default now()
);

alter table public.timesheets enable row level security;
create index if not exists timesheets_staff_id_idx on public.timesheets(staff_id);
create index if not exists timesheets_booking_id_idx on public.timesheets(booking_id);
-- Service-role only (no anon/authenticated policies).

-- ============================================
-- Contractor operations, agreements, staff payments and business expenses.
-- Cleanngo currently pays cleaners on ABN, so these records create a
-- timestamped operating ledger before any external payroll integration.
-- ============================================

create table if not exists public.contractor_profiles (
  id                         uuid primary key default uuid_generate_v4(),
  staff_id                   uuid not null unique references public.staff(id) on delete cascade,
  legal_name                 text,
  preferred_name             text,
  date_of_birth              date,
  residential_address        text,
  emergency_contact_name     text,
  emergency_contact_phone    text,
  emergency_contact_relation text,
  abn                        text,
  business_name              text,
  gst_registered             boolean default false,
  bank_name                  text,
  bank_account_name          text,
  bsb                        text,
  account_number             text,
  insurance_url              text,
  police_check_number        text,
  police_check_expiry        date,
  wwcc_number                text,
  wwcc_expiry                date,
  driver_licence             text,
  vehicle_available          boolean default false,
  vehicle_registration       text,
  service_areas              text,
  availability               text,
  onboarding_status          text not null default 'incomplete' check (onboarding_status in ('incomplete','submitted','approved','blocked')),
  submitted_at               timestamptz,
  approved_at                timestamptz,
  approved_by                uuid references public.staff(id),
  admin_notes                text,
  created_at                 timestamptz default now(),
  updated_at                 timestamptz default now()
);

alter table public.contractor_profiles enable row level security;
create index if not exists contractor_profiles_staff_idx on public.contractor_profiles(staff_id);
create index if not exists contractor_profiles_status_idx on public.contractor_profiles(onboarding_status);

drop policy if exists contractor_profiles_read_own on public.contractor_profiles;
create policy contractor_profiles_read_own
  on public.contractor_profiles for select
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())));

drop policy if exists contractor_profiles_update_own on public.contractor_profiles;
create policy contractor_profiles_update_own
  on public.contractor_profiles for update
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())))
  with check (staff_id = (select id from public.staff where user_id = (select auth.uid())));

create table if not exists public.staff_agreements (
  id                       uuid primary key default uuid_generate_v4(),
  staff_id                 uuid not null references public.staff(id) on delete cascade,
  agreement_type           text not null check (agreement_type in ('contractor_service','onboarding_declaration','whs_chemical_safety','privacy_customer_access','payment_authorisation')),
  version                  text not null,
  title                    text not null,
  agreement_snapshot       text not null,
  staff_name_at_acceptance text,
  abn_at_acceptance        text,
  accepted_ip              text,
  accepted_user_agent      text,
  accepted_at              timestamptz default now(),
  revoked_at               timestamptz,
  created_at               timestamptz default now(),
  unique(staff_id, agreement_type, version)
);

alter table public.staff_agreements enable row level security;
create index if not exists staff_agreements_staff_idx on public.staff_agreements(staff_id);
create index if not exists staff_agreements_type_idx on public.staff_agreements(agreement_type);

drop policy if exists staff_agreements_read_own on public.staff_agreements;
create policy staff_agreements_read_own
  on public.staff_agreements for select
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())));

create table if not exists public.staff_payment_runs (
  id             uuid primary key default uuid_generate_v4(),
  period_start   date not null,
  period_end     date not null,
  status         text not null default 'draft' check (status in ('draft','approved','paid','cancelled')),
  total_cents    int not null default 0,
  notes          text,
  created_by     uuid references public.staff(id),
  approved_by    uuid references public.staff(id),
  paid_by        uuid references public.staff(id),
  created_at     timestamptz default now(),
  approved_at    timestamptz,
  paid_at        timestamptz,
  cancelled_at   timestamptz
);

alter table public.staff_payment_runs enable row level security;
create index if not exists staff_payment_runs_status_idx on public.staff_payment_runs(status);
create index if not exists staff_payment_runs_period_idx on public.staff_payment_runs(period_start, period_end);

create table if not exists public.staff_payments (
  id                uuid primary key default uuid_generate_v4(),
  payment_run_id    uuid references public.staff_payment_runs(id) on delete set null,
  staff_id          uuid not null references public.staff(id),
  booking_id        uuid references public.bookings(id) on delete set null,
  timesheet_id      uuid references public.timesheets(id) on delete set null,
  abn               text,
  pay_period_start  date,
  pay_period_end    date,
  hours_worked      numeric,
  rate_cents        int,
  adjustment_cents  int not null default 0,
  amount_cents      int not null,
  payment_method    text not null default 'bank_transfer' check (payment_method in ('bank_transfer','cash','other')),
  payment_reference text,
  status            text not null default 'draft' check (status in ('draft','approved','paid','cancelled')),
  notes             text,
  created_by        uuid references public.staff(id),
  approved_by       uuid references public.staff(id),
  paid_by           uuid references public.staff(id),
  created_at        timestamptz default now(),
  approved_at       timestamptz,
  paid_at           timestamptz,
  cancelled_at      timestamptz
);

alter table public.staff_payments enable row level security;
create index if not exists staff_payments_staff_idx on public.staff_payments(staff_id);
create index if not exists staff_payments_status_idx on public.staff_payments(status);
create index if not exists staff_payments_period_idx on public.staff_payments(pay_period_start, pay_period_end);
create index if not exists staff_payments_created_idx on public.staff_payments(created_at desc);

drop policy if exists staff_payments_read_own on public.staff_payments;
create policy staff_payments_read_own
  on public.staff_payments for select
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())));

create table if not exists public.business_expenses (
  id              uuid primary key default uuid_generate_v4(),
  expense_at      timestamptz not null default now(),
  category        text not null default 'other' check (category in ('fuel','supplies','equipment','ads','contractor','software','insurance','refunds','other')),
  vendor          text,
  amount_cents    int not null,
  gst_included    boolean default false,
  payment_method  text not null default 'card' check (payment_method in ('card','bank_transfer','cash','other')),
  receipt_url     text,
  booking_id      uuid references public.bookings(id) on delete set null,
  staff_id        uuid references public.staff(id) on delete set null,
  notes           text,
  created_by      uuid references public.staff(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.business_expenses enable row level security;
create index if not exists business_expenses_expense_at_idx on public.business_expenses(expense_at desc);
create index if not exists business_expenses_category_idx on public.business_expenses(category);
create index if not exists business_expenses_staff_idx on public.business_expenses(staff_id);

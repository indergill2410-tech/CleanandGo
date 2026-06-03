-- ============================================
-- Customer accounts + the reliability engine
-- - Customers get real accounts (linked to auth.users) to manage their plans.
-- - Backup coverage: when a cleaner is unavailable, visits are reassigned to
--   the subscription's backup cleaner.
-- - Missed-visit SLA: a genuinely missed visit issues an account credit.
-- ============================================

-- Customer accounts -------------------------------------------------
alter table public.customers add column if not exists user_id uuid references auth.users(id);
create index if not exists customers_user_id_idx on public.customers(user_id);

-- Coverage tracking on visits --------------------------------------
alter table public.bookings add column if not exists covered_by_backup boolean default false;
alter table public.bookings add column if not exists original_staff_id uuid references public.staff(id);

-- Allow a 'missed' visit status.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'missed'));

-- Staff unavailability drives the auto-backup engine ----------------
create table if not exists public.staff_unavailability (
  id         uuid primary key default uuid_generate_v4(),
  staff_id   uuid references public.staff(id),
  date       date not null,
  reason     text,
  created_at timestamptz default now()
);
alter table public.staff_unavailability enable row level security;
create index if not exists staff_unavailability_staff_date_idx
  on public.staff_unavailability(staff_id, date);

-- Account credits (missed-visit guarantee) -------------------------
create table if not exists public.account_credits (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references public.customers(id),
  subscription_id uuid references public.subscriptions(id),
  booking_id      uuid references public.bookings(id),
  amount_cents    int not null,
  reason          text,
  status          text not null default 'available'
                    check (status in ('available', 'applied', 'void')),
  created_at      timestamptz default now()
);
alter table public.account_credits enable row level security;
create index if not exists account_credits_customer_idx on public.account_credits(customer_id);

-- ============================================
-- Recurring subscriptions (homes + offices)
-- The per-visit fee is ADMIN-SET per customer (each job differs), then billed
-- automatically by Stripe at that amount. Visits are bookings linked back to
-- the subscription. Reliability: each plan has a primary + backup cleaner.
-- ============================================

create table if not exists public.subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  customer_id            uuid references public.customers(id),
  property_type          text not null default 'home' check (property_type in ('home', 'office')),
  frequency              text not null check (frequency in ('weekly', 'fortnightly', 'monthly')),
  preferred_day          text,                 -- e.g. 'tuesday'
  preferred_time         time,
  address                text not null,
  suburb                 text not null,
  bedrooms               int,                  -- homes
  bathrooms              int,                  -- homes
  office_sqm             int,                  -- offices
  details                jsonb default '{}'::jsonb,
  price_cents            int,                  -- admin-set per-visit price; null until quoted
  status                 text not null default 'requested'
                           check (status in ('requested', 'active', 'paused', 'cancelled')),
  primary_staff_id       uuid references public.staff(id),
  backup_staff_id        uuid references public.staff(id),
  stripe_customer_id     text,
  stripe_subscription_id text,
  manage_token           uuid default uuid_generate_v4(),  -- magic-link self-serve
  notes                  text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table public.subscriptions enable row level security;
-- Service-role only: created/read/updated by trusted server code + admin.

create index if not exists subscriptions_customer_id_idx on public.subscriptions(customer_id);
create index if not exists subscriptions_primary_staff_idx on public.subscriptions(primary_staff_id);
create index if not exists subscriptions_backup_staff_idx on public.subscriptions(backup_staff_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- Link recurring visits (bookings) back to their subscription.
alter table public.bookings add column if not exists subscription_id uuid references public.subscriptions(id);
create index if not exists bookings_subscription_id_idx on public.bookings(subscription_id);

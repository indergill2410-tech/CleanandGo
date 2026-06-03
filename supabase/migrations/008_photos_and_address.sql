-- ============================================
-- Optional booking photos + structured address (state/postcode)
-- for an Australia-wide operation.
-- ============================================

alter table public.bookings add column if not exists photos text[] default '{}'::text[];
alter table public.bookings add column if not exists state text;
alter table public.bookings add column if not exists postcode text;

alter table public.subscriptions add column if not exists photos text[] default '{}'::text[];
alter table public.subscriptions add column if not exists state text;
alter table public.subscriptions add column if not exists postcode text;

-- Public storage bucket for customer-supplied booking photos.
-- Uploads happen server-side via the service-role key; reads are public.
insert into storage.buckets (id, name, public)
values ('booking-photos', 'booking-photos', true)
on conflict (id) do nothing;

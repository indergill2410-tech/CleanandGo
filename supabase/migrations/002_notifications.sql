-- ============================================
-- Notifications (admin + customer activity feed)
-- ============================================

create table if not exists public.notifications (
  id             uuid primary key default uuid_generate_v4(),
  type           text not null, -- 'new_booking' | 'quote_sent' | 'job_update'
  title          text not null,
  message        text not null,
  booking_id     uuid references public.bookings(id) on delete cascade,
  customer_email text,
  read           boolean default false,
  created_at     timestamptz default now()
);

alter table public.notifications enable row level security;

create index if not exists notifications_read_idx on public.notifications(read, created_at desc);
create index if not exists notifications_booking_id_idx on public.notifications(booking_id);

-- Notifications are created server-side via the service-role key (no public
-- insert policy). Signed-in staff can read and mark them read.
drop policy if exists "Authenticated users can read notifications" on public.notifications;
create policy "Authenticated users can read notifications"
  on public.notifications for select
  using ((select auth.role()) = 'authenticated');

drop policy if exists "Authenticated users can update notifications" on public.notifications;
create policy "Authenticated users can update notifications"
  on public.notifications for update
  using ((select auth.role()) = 'authenticated');

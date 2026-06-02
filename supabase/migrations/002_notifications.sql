-- ============================================
-- Notifications table
-- Run in Supabase SQL Editor
-- ============================================

create table if not exists public.notifications (
  id           uuid default uuid_generate_v4() primary key,
  type         text not null, -- 'new_booking' | 'quote_sent' | 'job_update'
  title        text not null,
  message      text not null,
  booking_id   uuid references public.bookings(id) on delete cascade,
  customer_email text,
  read         boolean default false,
  created_at   timestamptz default now()
);

alter table public.notifications enable row level security;

-- Admins can see all notifications
create policy "Admins can manage notifications"
  on public.notifications for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Service role can insert notifications (from API)
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

-- Index for fast unread count
create index if not exists notifications_read_idx on public.notifications(read, created_at desc);

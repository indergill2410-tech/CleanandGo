-- ============================================
-- Clean&Go — Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table if not exists public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  full_name    text,
  role         text not null default 'customer' check (role in ('customer', 'cleaner', 'admin')),
  phone        text,
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- BOOKINGS
-- ============================================
create table if not exists public.bookings (
  id               uuid default uuid_generate_v4() primary key,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  address          text not null,
  suburb           text,
  service_type     text not null check (service_type in ('recurring', 'oneoff', 'endoflease')),
  bedrooms         int not null default 2,
  bathrooms        int not null default 1,
  extras           text[] default '{}',
  date             date not null,
  time             text not null,
  frequency        text default 'once' check (frequency in ('once', 'weekly', 'fortnightly')),
  notes            text,
  total_price      numeric(10,2) not null,
  status           text not null default 'pending' check (status in ('pending','confirmed','in_progress','completed','cancelled')),
  assigned_cleaner uuid references public.profiles(id),
  user_id          uuid references auth.users(id),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table public.bookings enable row level security;

-- Customers can create bookings (no auth required for public booking)
create policy "Anyone can create a booking"
  on public.bookings for insert
  with check (true);

-- Customers can view their own bookings by email
create policy "Customers can view own bookings"
  on public.bookings for select
  using (
    customer_email = (select email from auth.users where id = auth.uid())
    or auth.uid() = user_id
  );

-- Cleaners can view bookings assigned to them
create policy "Cleaners can view assigned bookings"
  on public.bookings for select
  using (assigned_cleaner = auth.uid());

-- Admins can view and update all bookings
create policy "Admins can do everything on bookings"
  on public.bookings for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Cleaners can update status of their assigned jobs
create policy "Cleaners can update assigned bookings"
  on public.bookings for update
  using (assigned_cleaner = auth.uid())
  with check (assigned_cleaner = auth.uid());

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.update_updated_at();

-- ============================================
-- JOB CHECKLIST ITEMS
-- ============================================
create table if not exists public.job_checklist (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references public.bookings(id) on delete cascade,
  item        text not null,
  completed   boolean default false,
  completed_at timestamptz,
  created_at  timestamptz default now()
);

alter table public.job_checklist enable row level security;

create policy "Cleaners and admins can manage checklists"
  on public.job_checklist for all
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
      and (b.assigned_cleaner = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      )
    )
  );

-- ============================================
-- JOB PHOTOS
-- ============================================
create table if not exists public.job_photos (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references public.bookings(id) on delete cascade,
  photo_url   text not null,
  type        text not null check (type in ('before', 'after')),
  uploaded_by uuid references public.profiles(id),
  created_at  timestamptz default now()
);

alter table public.job_photos enable row level security;

create policy "Anyone with booking access can view photos"
  on public.job_photos for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
      and (
        b.assigned_cleaner = auth.uid()
        or b.user_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      )
    )
  );

create policy "Cleaners can upload photos"
  on public.job_photos for insert
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.assigned_cleaner = auth.uid()
    )
  );

-- ============================================
-- CLOCK IN/OUT RECORDS
-- ============================================
create table if not exists public.time_records (
  id           uuid default uuid_generate_v4() primary key,
  booking_id   uuid references public.bookings(id) on delete cascade,
  cleaner_id   uuid references public.profiles(id),
  clocked_in   timestamptz,
  clocked_out  timestamptz,
  duration_mins int generated always as (
    case when clocked_out is not null
    then extract(epoch from (clocked_out - clocked_in))::int / 60
    else null end
  ) stored,
  created_at   timestamptz default now()
);

alter table public.time_records enable row level security;

create policy "Cleaners manage own time records"
  on public.time_records for all
  using (cleaner_id = auth.uid());

create policy "Admins can view all time records"
  on public.time_records for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- REVIEWS
-- ============================================
create table if not exists public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references public.bookings(id) on delete cascade unique,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  customer_name text,
  suburb      text,
  service_type text,
  created_at  timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Anyone can create a review"
  on public.reviews for insert
  with check (true);

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- Admin dashboard: bookings with cleaner name
create or replace view public.bookings_with_cleaner as
  select
    b.*,
    p.full_name as cleaner_name
  from public.bookings b
  left join public.profiles p on p.id = b.assigned_cleaner;

-- Payroll: hours per cleaner this week
create or replace view public.weekly_payroll as
  select
    p.id as cleaner_id,
    p.full_name,
    count(distinct t.booking_id) as jobs_completed,
    coalesce(sum(t.duration_mins), 0) as total_minutes,
    coalesce(sum(t.duration_mins), 0) / 60.0 as total_hours
  from public.profiles p
  left join public.time_records t on t.cleaner_id = p.id
    and t.clocked_in >= date_trunc('week', now())
  where p.role = 'cleaner'
  group by p.id, p.full_name;

-- ============================================
-- STORAGE BUCKET FOR PHOTOS
-- ============================================
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload job photos"
  on storage.objects for insert
  with check (bucket_id = 'job-photos' and auth.role() = 'authenticated');

create policy "Job photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'job-photos');

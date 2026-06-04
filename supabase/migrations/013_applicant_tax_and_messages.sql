-- ============================================
-- Cleaner application tax details + customer messaging
-- - TFN is required by application/API validation for new submissions.
-- - ABN is optional.
-- - Messages are server-mediated so customer/admin access can be guarded in API
--   routes while RLS stays locked down by default.
-- ============================================

alter table public.job_applications
  add column if not exists tfn text,
  add column if not exists abn text;

create index if not exists job_applications_email_idx on public.job_applications(email);

create table if not exists public.conversations (
  id              uuid primary key default uuid_generate_v4(),
  subject         text,
  customer_id     uuid references public.customers(id) on delete cascade,
  booking_id      uuid references public.bookings(id) on delete set null,
  application_id  uuid references public.job_applications(id) on delete set null,
  staff_id        uuid references public.staff(id) on delete set null,
  status          text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.conversations enable row level security;

create index if not exists conversations_customer_idx on public.conversations(customer_id, last_message_at desc);
create index if not exists conversations_booking_idx on public.conversations(booking_id);
create index if not exists conversations_application_idx on public.conversations(application_id);
create index if not exists conversations_staff_idx on public.conversations(staff_id);

create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type     text not null check (sender_type in ('admin', 'customer', 'cleaner', 'system')),
  sender_user_id  uuid references auth.users(id) on delete set null,
  sender_staff_id uuid references public.staff(id) on delete set null,
  body            text not null,
  read_by_customer_at timestamptz,
  read_by_admin_at    timestamptz,
  created_at      timestamptz default now()
);

alter table public.messages enable row level security;

create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at asc);
create index if not exists messages_created_idx on public.messages(created_at desc);

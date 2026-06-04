-- ============================================
-- Newsletter engine: DB-backed blog posts + subscriber list + opt-in.
-- ============================================

-- DB-backed blog posts (AI newsletter drafts + future editorial).
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  category text default 'Newsletter',
  keywords text[] default '{}',
  read_time text default '4 min read',
  sections jsonb not null default '[]'::jsonb,
  source text not null default 'newsletter' check (source in ('editorial','newsletter')),
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);

-- Newsletter / marketing subscribers (customers who opt in + public form).
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed')),
  token uuid not null default gen_random_uuid(),
  source text default 'footer',
  created_at timestamptz default now(),
  unsubscribed_at timestamptz
);

-- Record marketing consent on the customer too.
alter table public.customers add column if not exists marketing_opt_in boolean default false;

-- Locked down to the service-role (the app reads/writes via the admin client).
alter table public.blog_posts enable row level security;
alter table public.newsletter_subscribers enable row level security;

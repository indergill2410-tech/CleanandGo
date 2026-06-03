-- ============================================
-- Ad-hoc invoices
-- Admin can bill a customer any amount; Stripe emails a hosted payment link
-- and the customer can also pay it from their account.
-- ============================================

alter table public.customers add column if not exists stripe_customer_id text;

create table if not exists public.invoices (
  id                 uuid primary key default uuid_generate_v4(),
  customer_id        uuid references public.customers(id),
  amount_cents       int not null,
  description        text,
  status             text not null default 'open' check (status in ('open', 'paid', 'void')),
  stripe_invoice_id  text unique,
  hosted_invoice_url text,
  created_at         timestamptz default now()
);

alter table public.invoices enable row level security;
create index if not exists invoices_customer_idx on public.invoices(customer_id);
create index if not exists invoices_stripe_idx on public.invoices(stripe_invoice_id);

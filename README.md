# Clean&Go 🧹

A full-stack web application for a managed cleaning business — handling customer bookings, staff dispatch, payments, and payroll on autopilot.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 15 (App Router, TypeScript) |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Payments | Stripe (card capture + payment holds) |
| Scheduling | Cal.com API |
| Payroll | Xero Payroll AU API |
| Hosting | Vercel |
| Styling | Tailwind CSS + shadcn/ui |

## Portals

1. **Customer Portal** — instant quote, booking, card payment
2. **Cleaner Portal** — job list, checklist, before/after photo upload
3. **Admin Dashboard** — dispatch, job management, payroll export

## Services

- Weekly / fortnightly recurring cleans
- One-off standard cleans
- End-of-lease cleans

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in your environment variables
npm run dev
```

## Environment Variables

See `.env.example` for all required keys.

## Project Structure

```
/app
  /customer       → Booking flow
  /cleaner        → Staff portal
  /admin          → Operations dashboard
  /api            → API routes (Stripe, Cal.com, Xero)
/components       → Shared UI components
/lib              → Supabase client, Stripe, helpers
/supabase
  /migrations     → Database schema
```

## License

Private — Clean&Go Pty Ltd

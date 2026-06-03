# CleanandGo

Next.js app (Supabase + Resend + Stripe) for the Clean&Go cleaning service (Australia-wide).

## Infrastructure

### Supabase (confirmed correct)
- **Organization:** Cleanandgo (`ozvejtnyccmblbswpvvq`)
- **Project:** `kjbpfthjewfrpgnxtdtk` — "omanahata111@gmail.com's Project"
  - Region: `ap-northeast-2` (Seoul)
  - Postgres 17
- Note: the project is named after omanahata111@gmail.com — this is the **correct** account/project for CleanandGo (verified by the repo owner).

### Hosting
- **Render** (not Vercel). Deploy config in `render.yaml`: a `web` service
  (`npm ci && npm run build` / `npm run start`, health check `/api/health`) and
  a `cron` service that hits `/api/payroll/export` weekly.
- Set all secrets in the Render dashboard (they're `sync: false` in render.yaml).

### Repo
- GitHub: `indergill2410-tech/CleanandGo`
- Schema migrations live in `supabase/migrations/`; seed data in `supabase/seed.sql`.
  These now mirror the deployed schema (customers, staff, bookings, payments,
  job_completions, timesheets, notifications).
- Supabase helpers in `lib/supabase/`:
  - `server.ts` / `client.ts` — anon, cookie-based, for auth/session.
  - `admin.ts` — **service-role**, server-only, for trusted DB writes
    (public booking creation, admin reads/writes, webhooks). Never import client-side.
- `lib/auth.ts` — `requireAdmin()` / `requireStaff()` guard API routes and the
  `/admin` + `/cleaner` server-component layouts. Roles come from the `staff` table.

### Conventions / gotchas
- The booking flow is **quote-based**: customer requests → admin quotes price →
  customer pays. The public booking POST uses the service-role client because
  RLS intentionally locks the tables to anon/authenticated.
- `CRON_SECRET` env var protects `/api/payroll/export` (Bearer token).
- Resend/Stripe clients are lazily constructed (`getResend()`, `getStripe()`) so
  `next build` doesn't crash without secrets.
- Create the first admin by inserting a `staff` row with `role='admin'` linked to
  a Supabase auth user (see comment in `supabase/seed.sql`).

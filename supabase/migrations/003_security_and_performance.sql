-- ============================================
-- Security & performance reconciliation
-- Idempotent: brings an existing project in line with 001/002 and
-- resolves Supabase database-linter advisories.
-- ============================================

-- 1. Covering indexes for foreign keys (advisor: unindexed_foreign_keys)
create index if not exists staff_user_id_idx          on public.staff(user_id);
create index if not exists bookings_customer_id_idx    on public.bookings(customer_id);
create index if not exists bookings_staff_id_idx       on public.bookings(staff_id);
create index if not exists payments_booking_id_idx     on public.payments(booking_id);
create index if not exists job_completions_staff_id_idx on public.job_completions(staff_id);
create index if not exists timesheets_staff_id_idx     on public.timesheets(staff_id);
create index if not exists timesheets_booking_id_idx   on public.timesheets(booking_id);
create index if not exists notifications_booking_id_idx on public.notifications(booking_id);

-- 2. Re-create RLS policies in the optimized form so auth.*() is evaluated
--    once per query, not once per row (advisor: auth_rls_initplan).
drop policy if exists staff_read_own on public.staff;
create policy staff_read_own
  on public.staff for select
  using (user_id = (select auth.uid()));

drop policy if exists staff_own_bookings on public.bookings;
create policy staff_own_bookings
  on public.bookings for select
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())));

drop policy if exists staff_own_completions on public.job_completions;
create policy staff_own_completions
  on public.job_completions for select
  using (staff_id = (select id from public.staff where user_id = (select auth.uid())));

drop policy if exists staff_submit_completions on public.job_completions;
create policy staff_submit_completions
  on public.job_completions for insert
  with check (staff_id = (select id from public.staff where user_id = (select auth.uid())));

-- 3. Tighten notifications: drop the permissive public INSERT policy
--    (advisor: rls_policy_always_true). Inserts now happen only via the
--    service-role key in the API. Re-create read/update optimized.
drop policy if exists "Anyone can insert notifications" on public.notifications;

drop policy if exists "Authenticated users can read notifications" on public.notifications;
create policy "Authenticated users can read notifications"
  on public.notifications for select
  using ((select auth.role()) = 'authenticated');

drop policy if exists "Authenticated users can update notifications" on public.notifications;
create policy "Authenticated users can update notifications"
  on public.notifications for update
  using ((select auth.role()) = 'authenticated');

-- 4. The rls_auto_enable() event-trigger function should not be callable as an
--    RPC by clients (advisors: anon/authenticated_security_definer_function).
--    Event triggers still fire regardless of these grants.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

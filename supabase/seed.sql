-- ============================================
-- Clean&Go — Sample Seed Data (optional, dev only)
-- Run AFTER the migrations in supabase/migrations/.
-- ============================================

-- Sample customers
insert into public.customers (name, email, phone) values
  ('Sarah M.',  'sarah@example.com',  '0400 000 001'),
  ('James T.',  'james@example.com',  '0400 000 002'),
  ('Priya K.',  'priya@example.com',  '0400 000 003')
on conflict (email) do nothing;

-- Sample bookings (pending quote requests)
insert into public.bookings (customer_id, service_type, bedrooms, bathrooms, address, suburb, scheduled_date, scheduled_time, status, price_cents)
select c.id, 'endoflease', 3, 2, '12 Chapel St', 'South Yarra', current_date + 3, '09:00', 'pending', 0
from public.customers c where c.email = 'sarah@example.com'
on conflict do nothing;

-- ============================================
-- Creating the first admin
-- ============================================
-- Admin/cleaner access is granted via the `staff` table, keyed to a Supabase
-- auth user. After the person signs up (Auth > Users, or the /login flow),
-- promote them to admin by linking their auth user id:
--
--   insert into public.staff (user_id, name, email, role, status)
--   values ('<auth-user-uuid>', 'Owner', 'admin@cleanngo.com.au', 'admin', 'active')
--   on conflict (email) do update set role = 'admin', status = 'active';

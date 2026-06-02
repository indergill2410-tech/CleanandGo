-- ============================================
-- Clean&Go — Sample Seed Data (optional)
-- Run AFTER 001_initial_schema.sql
-- ============================================

-- Sample reviews (visible on landing page)
insert into public.reviews (rating, comment, customer_name, suburb, service_type) values
  (5, 'Got my full bond back without a single issue. The team was thorough, professional, and the communication was perfect throughout.', 'Sarah M.', 'South Yarra', 'endoflease'),
  (5, 'We have had the same cleaner for 4 months now and the quality never drops. Worth every cent for the peace of mind.', 'James T.', 'Richmond', 'recurring'),
  (5, 'Booked online at 10pm, confirmed by 8am, cleaned by 11am. This is how a service business should work.', 'Priya K.', 'Fitzroy', 'oneoff'),
  (5, 'Absolutely spotless. Even cleaned areas I forgot to mention. Will never use anyone else.', 'Marcus L.', 'Collingwood', 'oneoff'),
  (5, 'Bond back guaranteed and they delivered. Agent was impressed. Highly recommend for anyone moving out.', 'Emma R.', 'St Kilda', 'endoflease')
on conflict do nothing;

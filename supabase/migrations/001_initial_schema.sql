-- Clean&Go Database Schema
-- Run in Supabase SQL Editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAFF (employees)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  suburb TEXT,
  role TEXT DEFAULT 'cleaner', -- 'cleaner' | 'supervisor' | 'admin'
  status TEXT DEFAULT 'active', -- 'active' | 'inactive'
  xero_employee_id TEXT, -- Xero Payroll employee reference
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  staff_id UUID REFERENCES staff(id),
  service_type TEXT NOT NULL CHECK (service_type IN ('recurring', 'oneoff', 'endoflease')),
  bedrooms INT DEFAULT 2,
  bathrooms INT DEFAULT 1,
  extras JSONB DEFAULT '[]',
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  price_cents INT NOT NULL,
  notes TEXT,
  calcom_booking_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount_cents INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'captured', 'refunded', 'failed')),
  captured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOB COMPLETIONS (checklist + photos)
CREATE TABLE job_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  staff_id UUID REFERENCES staff(id),
  checklist JSONB DEFAULT '{}',
  before_photos TEXT[] DEFAULT '{}',
  after_photos TEXT[] DEFAULT '{}',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIMESHEETS (for Xero payroll export)
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id),
  booking_id UUID REFERENCES bookings(id),
  date DATE NOT NULL,
  hours_worked NUMERIC(4,2) NOT NULL,
  hourly_rate NUMERIC(8,2) DEFAULT 28.00, -- AUD, min wage reference
  xero_synced BOOLEAN DEFAULT FALSE,
  xero_timesheet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

-- Staff can only see their own jobs
CREATE POLICY "staff_own_bookings" ON bookings
  FOR SELECT USING (staff_id = (SELECT id FROM staff WHERE user_id = auth.uid()));

-- Staff can only see their own completions
CREATE POLICY "staff_own_completions" ON job_completions
  FOR SELECT USING (staff_id = (SELECT id FROM staff WHERE user_id = auth.uid()));

-- Staff can update their own completions
CREATE POLICY "staff_submit_completions" ON job_completions
  FOR INSERT WITH CHECK (staff_id = (SELECT id FROM staff WHERE user_id = auth.uid()));

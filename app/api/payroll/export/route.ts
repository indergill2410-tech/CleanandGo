import { NextRequest, NextResponse } from 'next/server'

// Weekly payroll export to Xero AU
// Called via Vercel Cron: every Friday at 5pm AEST
export async function POST(req: NextRequest) {
  // TODO: 1. Fetch completed job timesheets from Supabase for the week
  // TODO: 2. Calculate hours per employee
  // TODO: 3. POST timesheets to Xero Payroll AU API
  // TODO: 4. Trigger Xero pay run
  // Reference: https://developer.xero.com/documentation/api/payrollau/integration-guide

  return NextResponse.json({ success: true, message: 'Payroll export triggered' })
}

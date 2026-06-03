import { createAdminClient } from '@/lib/supabase/admin'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Next occurrence of a weekday name (always in the future, never today).
function nextDateForDay(dayName: string | null): string {
  const now = new Date()
  const target = DAYS.indexOf((dayName || '').toLowerCase())
  if (target < 0) {
    now.setDate(now.getDate() + 1)
    return now.toISOString().slice(0, 10)
  }
  let diff = (target - now.getDay() + 7) % 7
  if (diff === 0) diff = 7
  now.setDate(now.getDate() + diff)
  return now.toISOString().slice(0, 10)
}

/**
 * Create the next upcoming visit (booking) for every active subscription that
 * doesn't already have one scheduled. Designed to be run on a schedule.
 */
export async function generateUpcomingVisits(): Promise<{ created: number }> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('id, customer_id, primary_staff_id, address, suburb, bedrooms, bathrooms, price_cents, preferred_day, preferred_time')
    .eq('status', 'active')

  let created = 0
  for (const sub of subs || []) {
    const { data: upcoming } = await supabase
      .from('bookings')
      .select('id')
      .eq('subscription_id', sub.id)
      .gte('scheduled_date', today)
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .maybeSingle()

    if (upcoming) continue

    const { error } = await supabase.from('bookings').insert({
      customer_id: sub.customer_id,
      subscription_id: sub.id,
      staff_id: sub.primary_staff_id,
      service_type: 'recurring',
      bedrooms: sub.bedrooms,
      bathrooms: sub.bathrooms,
      extras: [],
      address: sub.address,
      suburb: sub.suburb,
      scheduled_date: nextDateForDay(sub.preferred_day),
      scheduled_time: sub.preferred_time || '09:00',
      status: 'confirmed',
      price_cents: sub.price_cents ?? 0,
    })
    if (!error) created++
  }

  return { created }
}

/**
 * When a cleaner is unavailable on a date, reassign that day's visits to each
 * plan's backup cleaner so the customer is never left hanging.
 */
export async function reassignVisitsForUnavailability(
  staffId: string,
  date: string
): Promise<{ reassigned: number; uncovered: number }> {
  const supabase = createAdminClient()

  const { data: visits } = await supabase
    .from('bookings')
    .select('id, subscription_id, customers(name)')
    .eq('staff_id', staffId)
    .eq('scheduled_date', date)
    .in('status', ['pending', 'confirmed'])

  let reassigned = 0
  let uncovered = 0

  for (const visit of visits || []) {
    let backupId: string | null = null
    if (visit.subscription_id) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('backup_staff_id')
        .eq('id', visit.subscription_id)
        .single()
      backupId = sub?.backup_staff_id ?? null
    }

    if (backupId) {
      await supabase
        .from('bookings')
        .update({ staff_id: backupId, original_staff_id: staffId, covered_by_backup: true, updated_at: new Date().toISOString() })
        .eq('id', visit.id)
      // @ts-expect-error embedded relation
      const customerName = visit.customers?.name ?? 'Customer'
      await supabase.from('notifications').insert([{
        type: 'visit_covered',
        title: 'Backup cleaner assigned',
        message: `${customerName}'s visit on ${date} was reassigned to a backup cleaner — clean still on.`,
        booking_id: visit.id,
        read: false,
      }])
      reassigned++
    } else {
      uncovered++
      await supabase.from('notifications').insert([{
        type: 'coverage_gap',
        title: '⚠️ Visit needs coverage',
        message: `A visit on ${date} has no backup cleaner assigned — manual coverage needed.`,
        booking_id: visit.id,
        read: false,
      }])
    }
  }

  return { reassigned, uncovered }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const bookingSchema = z.object({
  serviceType: z.enum(['recurring', 'oneoff', 'endoflease']),
  bedrooms: z.number().min(1).max(10),
  bathrooms: z.number().min(1).max(8),
  extras: z.array(z.string()),
  date: z.string(),
  time: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().min(5),
  suburb: z.string().min(2),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = bookingSchema.parse(body)

    // TODO: 1. Create booking record in Supabase
    // TODO: 2. Create payment intent in Stripe
    // TODO: 3. Block time slot via Cal.com API
    // TODO: 4. Send confirmation email

    return NextResponse.json({ success: true, message: 'Booking received', data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

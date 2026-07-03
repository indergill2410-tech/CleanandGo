import { Resend } from 'resend'

// Lazily instantiate so importing this module (e.g. during `next build`)
// doesn't throw when RESEND_API_KEY isn't present.
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@cleanngo.com.au'
// Admin notifications go to every configured inbox (env, comma-separated) plus
// the owner as an always-on recipient, deduped.
const ADMIN = Array.from(new Set([
  ...(process.env.ADMIN_EMAIL || 'admin@cleanngo.com.au')
    .split(',')
    .map(email => email.trim())
    .filter(Boolean),
  'indergill2410@gmail.com',
  'fizaadrees879@gmail.com',
]))
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cleanngo.com.au'

// ─── Shared styles ───────────────────────────────────────────────
const base = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#EFF7FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">Cleanngo keeps your cleaning simple, reliable and easy to manage.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF7FC;padding:34px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0B3558;border-radius:24px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 24px 60px rgba(11,53,88,0.18);">
        <tr><td style="background:#0B3558;padding:30px 34px 22px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.12);">
          <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:0;">cleanngo</div>
          <div style="font-size:13px;color:#9ED8FF;margin-top:6px;font-weight:700;">Australia-wide cleaning, handled properly</div>
        </td></tr>
        <tr><td style="padding:34px;">${content}</td></tr>
        <tr><td style="padding:0 34px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;">
            <tr>
              <td style="font-size:12px;color:rgba(255,255,255,0.70);line-height:1.5;"><strong style="color:#ffffff;">Cleanngo promise</strong><br>Clear quotes, vetted cleaners, backup cover when life gets messy.</td>
            </tr>
          </table>
          <div style="font-size:12px;color:rgba(255,255,255,0.42);text-align:center;margin-top:22px;line-height:1.6;">cleanngo · Australia-wide · <a href="https://cleanngo.com.au" style="color:rgba(255,255,255,0.72);">cleanngo.com.au</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const h1 = (t: string) => `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">${t}</h1>`
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.72);line-height:1.65;">${t}</p>`
const row = (label: string, value: string) => `
  <tr>
    <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.4);width:120px;">${label}</td>
    <td style="padding:8px 0;font-size:13px;color:#ffffff;font-weight:500;">${value}</td>
  </tr>`
const btn = (href: string, text: string) => `
  <a href="${href}" style="display:inline-block;margin-top:24px;padding:15px 28px;background:#ffffff;color:#0B3558;font-weight:900;font-size:15px;border-radius:999px;text-decoration:none;">${text}</a>`
const table = (rows: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.07);border-radius:12px;padding:16px 20px;margin:20px 0;">
    <tbody>${rows}</tbody>
  </table>`
const infoNote = (title: string, text: string) => `
  <div style="background:rgba(125,211,252,0.10);border:1px solid rgba(125,211,252,0.22);border-radius:16px;padding:18px 20px;margin:20px 0;">
    <div style="font-size:14px;color:#ffffff;font-weight:900;margin-bottom:6px;">${title}</div>
    <div style="font-size:14px;color:rgba(255,255,255,0.72);line-height:1.6;">${text}</div>
  </div>`
const upsell = (title: string, text: string, href: string, cta: string) => `
  <div style="background:#ffffff;border-radius:18px;padding:20px;margin:24px 0 4px;color:#0B3558;">
    <div style="font-size:16px;font-weight:900;margin-bottom:6px;">${title}</div>
    <div style="font-size:14px;line-height:1.6;color:#496B84;">${text}</div>
    <a href="${href}" style="display:inline-block;margin-top:14px;color:#0B3558;font-size:14px;font-weight:900;text-decoration:none;">${cta} →</a>
  </div>`

// ─── 1. Customer: Quote request received ─────────────────────────
export async function sendBookingConfirmationEmail({
  customerName, customerEmail, service, date, time, address, suburb, beds, baths, extras, bookingId
}: {
  customerName: string; customerEmail: string; service: string;
  date: string; time: string; address: string; suburb: string;
  beds: number; baths: number; extras: string[]; bookingId: string
}) {
  const serviceLabel = service === 'endoflease' ? 'End of Lease' : service === 'recurring' ? 'Recurring Clean' : 'One-Off Clean'

  const html = base(`
    ${h1('Quote request received 📋')}
    ${p(`Hi ${customerName}, your clean is now in our queue. We're reviewing the details so we can send a clear, tailored quote instead of a vague price range.`)}
    ${table(
      row('Service', serviceLabel) +
      row('Date', date) +
      row('Time', time) +
      row('Address', `${address}, ${suburb}`) +
      row('Size', `${beds} bed · ${baths} bath`) +
      (extras?.length ? row('Extras', extras.join(', ')) : '')
    )}
    ${infoNote('What happens next', 'We check the home details, extras and timing, then send the price and next step. Most quotes go out within 60 minutes during business hours.')}
    ${p('Want the easiest option? Many customers move from a one-off clean to a weekly or fortnightly reset once they see how much time it gives back.')}
    ${btn(`${APP_URL}/track`, 'Track Your Request →')}
    ${upsell('Make clean-home feeling automatic', 'A recurring plan gives you a regular cleaner, backup coverage, and fewer last-minute chores before guests or inspections.', `${APP_URL}/customer/plan`, 'Explore recurring plans')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Quote request received — cleanngo`,
    html,
  })
}

// ─── 2. Admin: New job alert ──────────────────────────────────────
export async function sendAdminNewBookingEmail({
  customerName, customerEmail, customerPhone, service, date, time,
  address, suburb, beds, baths, extras, notes, bookingId
}: {
  customerName: string; customerEmail: string; customerPhone: string;
  service: string; date: string; time: string; address: string; suburb: string;
  beds: number; baths: number; extras: string[]; notes: string; bookingId: string
}) {
  const serviceLabel = service === 'endoflease' ? 'End of Lease' : service === 'recurring' ? 'Recurring Clean' : 'One-Off Clean'

  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#fbbf24;font-size:13px;font-weight:600;">⏳ New quote request — action required</span>
    </div>
    ${h1(`New job from ${customerName}`)}
    ${p('A customer has submitted a quote request. Log in to the admin dashboard to review and send a price.')}
    ${table(
      row('Service', serviceLabel) +
      row('Date', date) +
      row('Time', time) +
      row('Address', `${address}, ${suburb}`) +
      row('Size', `${beds} bed · ${baths} bath`) +
      (extras?.length ? row('Extras', extras.join(', ')) : '') +
      row('Customer', customerName) +
      row('Email', customerEmail) +
      row('Phone', customerPhone) +
      (notes ? row('Notes', notes) : '')
    )}
    ${btn(`${APP_URL}/admin`, 'Open Admin Dashboard →')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: ADMIN,
    subject: `⏳ New quote request — ${customerName} (${serviceLabel})`,
    html,
  })
}

// ─── 3. Customer: Quote ready ─────────────────────────────────────
export async function sendQuoteReadyEmail({
  customerName, customerEmail, service, date, address, suburb, price, note, bookingId
}: {
  customerName: string; customerEmail: string; service: string;
  date: string; address: string; suburb: string;
  price: number; note?: string; bookingId: string
}) {
  const serviceLabel = service === 'endoflease' ? 'End of Lease' : service === 'recurring' ? 'Recurring Clean' : 'One-Off Clean'

  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(29,126,208,0.2);border:1px solid rgba(29,126,208,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60A5FA;font-size:13px;font-weight:600;">💰 Your quote is ready</span>
    </div>
    ${h1(`Your quote is ready: $${price}`)}
    ${p(`Hi ${customerName}, we priced your ${serviceLabel} carefully so you know exactly what to expect before we arrive.`)}
    ${table(
      row('Service', serviceLabel) +
      row('Date', date) +
      row('Address', `${address}, ${suburb}`) +
      row('Quoted price', `<strong style="font-size:20px;color:#ffffff;">$${price}</strong>`)
    )}
    ${note ? `<div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:16px 20px;margin:16px 0;"><div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:6px;">Note from us</div><div style="font-size:14px;color:rgba(255,255,255,0.8);">${note}</div></div>` : ''}
    ${infoNote('Why book now', 'Once you accept, we can lock the schedule, prepare the cleaner notes, and keep you updated from your Cleanngo account.')}
    ${p('Happy with the price? Confirm the booking and we will take it from quote to handled.')}
    ${btn(`${APP_URL}/track?id=${bookingId}`, 'Accept Quote →')}
    ${upsell('Prefer not to think about cleaning again?', 'Ask us to turn this into a weekly or fortnightly service with the same standard and a guaranteed backup cleaner.', `${APP_URL}/customer/plan`, 'Ask about a recurring plan')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Your cleanngo quote is ready — $${price}`,
    html,
  })
}

// ─── 3b. Admin: New recurring-plan request ───────────────────────
export async function sendAdminNewPlanEmail({
  name, email, phone, propertyType, frequency, address, suburb, state, postcode,
  preferredDay, preferredTime, size, notes, photosCount,
}: {
  name: string; email: string; phone: string; propertyType: string; frequency: string;
  address: string; suburb: string; state?: string; postcode?: string;
  preferredDay?: string; preferredTime?: string; size: string; notes?: string; photosCount?: number
}) {
  const where = [address, suburb, state, postcode].filter(Boolean).join(', ')
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#fbbf24;font-size:13px;font-weight:600;">⏳ New recurring-plan request — action required</span>
    </div>
    ${h1(`New ${frequency} ${propertyType} plan from ${name}`)}
    ${p('A customer is ready for a recurring relationship. Price it quickly, assign a primary cleaner and backup, then send a confident next step.')}
    ${table(
      row('Type', `${propertyType} · ${frequency}`) +
      row('Size', size) +
      row('Address', where) +
      (preferredDay ? row('Preferred', `${preferredDay}${preferredTime ? ' ' + preferredTime : ''}`) : '') +
      row('Customer', name) +
      row('Email', email) +
      row('Phone', phone) +
      (photosCount ? row('Photos', `${photosCount} attached`) : '') +
      (notes ? row('Notes', notes) : '')
    )}
    ${btn(`${APP_URL}/admin/subscriptions`, 'Open Recurring Plans →')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: ADMIN,
    subject: `⏳ New ${frequency} ${propertyType} plan — ${name}`,
    html,
  })
}

// ─── 3c. Admin: New cleaner application ──────────────────────────
export async function sendAdminNewApplicationEmail({
  name, email, phone, suburbs, availability, hasAbn, rightToWork, hasPoliceCheck, hasWwcc,
}: {
  name: string; email: string; phone: string; suburbs?: string; availability?: string;
  hasAbn?: boolean; rightToWork?: boolean; hasPoliceCheck?: boolean; hasWwcc?: boolean
}) {
  const yn = (v?: boolean) => (v ? 'Yes' : 'No')
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(29,126,208,0.2);border:1px solid rgba(29,126,208,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60A5FA;font-size:13px;font-weight:600;">🧹 New cleaner application</span>
    </div>
    ${h1(`${name} applied to join`)}
    ${p('Review the application and approve to onboard them as a cleaner.')}
    ${table(
      row('Name', name) +
      row('Email', email) +
      row('Phone', phone) +
      (suburbs ? row('Areas', suburbs) : '') +
      (availability ? row('Availability', availability) : '') +
      row('ABN', yn(hasAbn)) +
      row('Right to work', yn(rightToWork)) +
      row('Police check', yn(hasPoliceCheck)) +
      row('WWCC', yn(hasWwcc))
    )}
    ${btn(`${APP_URL}/admin/applications`, 'Review Applications →')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: ADMIN,
    subject: `🧹 New cleaner application — ${name}`,
    html,
  })
}

// ─── 4. Staff: Welcome / set your password ───────────────────────
export async function sendStaffInviteEmail({
  name, email, actionLink, role = 'cleaner',
}: {
  name: string; email: string; actionLink: string; role?: string
}) {
  const roleLabel = role === 'admin' ? 'admin' : 'cleaner'
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(29,126,208,0.2);border:1px solid rgba(29,126,208,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60A5FA;font-size:13px;font-weight:600;">🎉 Welcome to the team</span>
    </div>
    ${h1(`Welcome aboard, ${name}!`)}
    ${p(`Your cleanngo ${roleLabel} account is ready. Set your password to log in${role === 'admin' ? '' : ' and start receiving jobs with clear notes, proof uploads and simple scheduling'}.`)}
    ${btn(actionLink, 'Set Your Password →')}
    ${infoNote('A quick standard', role === 'admin' ? 'Use the dashboard to quote quickly, assign confidently and keep every customer conversation in one place.' : 'Great work here is simple: arrive on time, start the job in-app, upload proof, and leave the customer with that freshly reset feeling.')}
    ${p('<span style="font-size:13px;color:rgba(255,255,255,0.48);">This link expires for security. If it does, contact us and we\'ll send a fresh one.</span>')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to cleanngo — set your password',
    html,
  })
}

// ─── 5. Password reset ────────────────────────────────────────────
export async function sendPasswordResetEmail({
  email, actionLink,
}: {
  email: string; actionLink: string
}) {
  const html = base(`
    ${h1('Reset your password')}
    ${p('We received a request to reset your cleanngo password. Choose a new one below and you can get straight back to your bookings, quotes and messages.')}
    ${btn(actionLink, 'Reset Password →')}
    ${p('<span style="font-size:13px;color:rgba(255,255,255,0.48);">If you did not request this, you can safely ignore this email.</span>')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your cleanngo password',
    html,
  })
}

// ─── 6. Customer: Payment receipt ─────────────────────────────────
export async function sendPaymentReceiptEmail({
  customerName, customerEmail, amount, description, date,
}: {
  customerName: string; customerEmail: string; amount: number; description?: string; date?: string
}) {
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(29,126,208,0.2);border:1px solid rgba(29,126,208,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60A5FA;font-size:13px;font-weight:600;">✅ Payment received</span>
    </div>
    ${h1(`Payment received — $${amount}`)}
    ${p(`Hi ${customerName}, thanks. Your payment is confirmed, so the clean can move ahead without admin back-and-forth.`)}
    ${table(
      row('Amount', `<strong style="color:#fff;">$${amount}</strong>`) +
      (description ? row('For', description) : '') +
      (date ? row('Date', date) : '')
    )}
    ${infoNote('You are all set', 'We keep the booking, payment and service notes together so your cleaner has the right context before arriving.')}
    ${btn(`${APP_URL}/account`, 'View Your Account →')}
    ${upsell('Keep the reset going', 'If this clean is something you need often, a recurring plan can save the repeat booking work and keep your home on rhythm.', `${APP_URL}/customer/plan`, 'See recurring options')}
  `)
  return getResend().emails.send({ from: FROM, to: customerEmail, subject: `Payment received — $${amount} · cleanngo`, html })
}

// ─── 6b. Admin: Payment received ──────────────────────────────────
export async function sendAdminPaymentEmail({
  customerName, amount, description,
}: {
  customerName: string; amount: number; description?: string
}) {
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(29,126,208,0.2);border:1px solid rgba(29,126,208,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60A5FA;font-size:13px;font-weight:600;">💳 Payment received</span>
    </div>
    ${h1(`$${amount} from ${customerName}`)}
    ${table(row('Customer', customerName) + row('Amount', `$${amount}`) + (description ? row('For', description) : ''))}
    ${btn(`${APP_URL}/admin/payments`, 'Open Payments →')}
  `)
  return getResend().emails.send({ from: FROM, to: ADMIN, subject: `💳 Payment $${amount} — ${customerName}`, html })
}

// ─── 7. Customer: Booking confirmed / cleaner assigned ────────────
export async function sendBookingConfirmedEmail({
  customerName, customerEmail, service, date, time, address, suburb, cleanerName,
}: {
  customerName: string; customerEmail: string; service: string;
  date: string; time: string; address: string; suburb: string; cleanerName?: string
}) {
  const serviceLabel = service === 'endoflease' ? 'End of Lease' : service === 'recurring' ? 'Recurring Clean' : 'One-Off Clean'
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60a5fa;font-size:13px;font-weight:600;">📅 Your clean is booked</span>
    </div>
    ${h1('You are booked in')}
    ${p(`Hi ${customerName}, your ${serviceLabel} is confirmed${cleanerName ? ` with <strong style="color:#fff;">${cleanerName}</strong>` : ''}. We will keep the details tidy from here so you can get on with your day.`)}
    ${table(
      row('Service', serviceLabel) +
      row('Date', date) +
      row('Time', time) +
      row('Address', `${address}, ${suburb}`) +
      (cleanerName ? row('Cleaner', cleanerName) : '')
    )}
    ${infoNote('Before we arrive', 'Add access notes or message us from your account if anything changes. Small details help us deliver a better clean on the first visit.')}
    ${btn(`${APP_URL}/account`, 'View Your Booking →')}
  `)
  return getResend().emails.send({ from: FROM, to: customerEmail, subject: 'Your cleanngo clean is confirmed', html })
}

// ─── 7b. Cleaner: You've been assigned a job ──────────────────────
export async function sendCleanerAssignedEmail({
  cleanerName, cleanerEmail, service, date, time, address, suburb,
}: {
  cleanerName: string; cleanerEmail: string; service: string;
  date: string; time: string; address: string; suburb: string
}) {
  const serviceLabel = service === 'endoflease' ? 'End of Lease' : service === 'recurring' ? 'Recurring Clean' : 'One-Off Clean'
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(29,126,208,0.2);border:1px solid rgba(29,126,208,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60A5FA;font-size:13px;font-weight:600;">🧽 New job assigned</span>
    </div>
    ${h1('You have a new job')}
    ${p(`Hi ${cleanerName}, you have been assigned a ${serviceLabel}. Open your portal for customer notes, address details and proof upload.`)}
    ${table(
      row('Service', serviceLabel) +
      row('Date', date) +
      row('Time', time) +
      row('Address', `${address}, ${suburb}`)
    )}
    ${infoNote('Service standard', 'Start the job in-app, upload before/after proof, and leave clear notes for admin if anything changes on site.')}
    ${btn(`${APP_URL}/cleaner`, 'Open Your Jobs →')}
  `)
  return getResend().emails.send({ from: FROM, to: cleanerEmail, subject: 'New cleanngo job assigned', html })
}

// ─── 7c. Customer: Job completed ──────────────────────────────────
export async function sendJobCompletedEmail({
  customerName, customerEmail, service, date,
}: {
  customerName: string; customerEmail: string; service: string; date: string
}) {
  const serviceLabel = service === 'endoflease' ? 'End of Lease' : service === 'recurring' ? 'Recurring Clean' : 'One-Off Clean'
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#4ade80;font-size:13px;font-weight:600;">✨ Clean complete</span>
    </div>
    ${h1('Your clean is complete ✨')}
    ${p(`Hi ${customerName}, your ${serviceLabel} on ${date} is complete. We hope the place feels lighter the moment you walk in.`)}
    ${infoNote('Need anything adjusted?', 'Reply or message us from your account if something needs attention. We would rather fix it properly than leave you half happy.')}
    ${btn(`${APP_URL}/account`, 'View Your Account →')}
    ${upsell('Want this feeling on repeat?', 'Turn a great clean into a weekly or fortnightly rhythm with a regular cleaner and backup coverage.', `${APP_URL}/customer/plan`, 'Start a recurring plan')}
  `)
  return getResend().emails.send({ from: FROM, to: customerEmail, subject: 'Your cleanngo clean is complete ✨', html })
}

// ─── 7d. Customer: Missed visit + credit ──────────────────────────
export async function sendMissedVisitCreditEmail({
  customerName, customerEmail, date, creditAmount,
}: {
  customerName: string; customerEmail: string; date: string; creditAmount?: number
}) {
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#fbbf24;font-size:13px;font-weight:600;">🛟 We missed your visit</span>
    </div>
    ${h1('We missed your visit — and we are sorry')}
    ${p(`Hi ${customerName}, we could not make your clean on ${date}. That is on us.${creditAmount ? ` We have added a <strong style="color:#fff;">$${creditAmount}</strong> credit to your account.` : ' We have added an account credit to make it right.'}`)}
    ${infoNote('How we recover', 'Our backup promise means we do not leave the issue sitting with you. We will help reschedule and keep your credit visible in your account.')}
    ${btn(`${APP_URL}/account`, 'View Your Credit →')}
  `)
  return getResend().emails.send({ from: FROM, to: customerEmail, subject: 'About your missed clean — account credit added', html })
}

// ─── 8. Applicant: Application not progressing ────────────────────
export async function sendApplicationDeclinedEmail({
  name, email,
}: {
  name: string; email: string
}) {
  const html = base(`
    ${h1('Thanks for applying to cleanngo')}
    ${p(`Hi ${name}, thank you for your interest in joining the cleanngo team. After reviewing your application, we will not be progressing it at this time. We genuinely appreciate the time you took to apply and wish you all the best.`)}
    ${p('<span style="font-size:13px;color:rgba(255,255,255,0.4);">You\'re welcome to apply again in the future as our needs change.</span>')}
  `)
  return getResend().emails.send({ from: FROM, to: email, subject: 'Your cleanngo application', html })
}

// ─── 9. Newsletter (per-subscriber, with unsubscribe) ─────────────
type NewsletterSection = { heading?: string; paragraphs?: string[]; bullets?: string[] }
export async function sendNewsletterEmail({
  to, token, title, excerpt, sections, slug,
}: {
  to: string; token: string; title: string; excerpt?: string | null
  sections: NewsletterSection[]; slug: string
}) {
  const bodyHtml = (sections || []).map((s) => {
    const heading = s.heading ? `<h2 style="margin:24px 0 10px;font-size:18px;font-weight:700;color:#ffffff;">${s.heading}</h2>` : ''
    const paras = (s.paragraphs || []).map((t) => p(t)).join('')
    const bullets = s.bullets && s.bullets.length
      ? `<ul style="margin:0 0 16px;padding-left:20px;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;">${s.bullets.map((b) => `<li style="margin-bottom:6px;">${b}</li>`).join('')}</ul>`
      : ''
    return heading + paras + bullets
  }).join('')

  const unsub = `${APP_URL}/api/newsletter/unsubscribe?token=${token}`
  const html = base(`
    ${h1(title)}
    ${excerpt ? p(`<em style="color:rgba(255,255,255,0.8);">${excerpt}</em>`) : ''}
    ${bodyHtml}
    ${btn(`${APP_URL}/blog/${slug}`, 'Read it on the blog →')}
    <p style="margin:28px 0 0;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">
      You’re receiving this because you opted in to cleanngo cleaning tips &amp; offers.
      <a href="${unsub}" style="color:rgba(255,255,255,0.5);">Unsubscribe</a> · cleanngo, Australia-wide.
    </p>
  `)

  return getResend().emails.send({ from: FROM, to, subject: title, html })
}

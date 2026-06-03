import { Resend } from 'resend'

// Lazily instantiate so importing this module (e.g. during `next build`)
// doesn't throw when RESEND_API_KEY isn't present.
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@cleanngo.com.au'
const ADMIN = process.env.ADMIN_EMAIL || 'admin@cleanngo.com.au'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cleanandgo.onrender.com'

// ─── Shared styles ───────────────────────────────────────────────
const base = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1C2B3A;border-radius:24px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1C2B3A,#2C4A6E);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Clean&amp;Go</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">cleanngo.com.au</div>
        </td></tr>
        <tr><td style="padding:36px 40px;">${content}</td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
          <div style="font-size:12px;color:rgba(255,255,255,0.3);">Clean&amp;Go · Australia-wide · <a href="https://cleanngo.com.au" style="color:rgba(255,255,255,0.4);">cleanngo.com.au</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const h1 = (t: string) => `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">${t}</h1>`
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;">${t}</p>`
const row = (label: string, value: string) => `
  <tr>
    <td style="padding:8px 0;font-size:13px;color:rgba(255,255,255,0.4);width:120px;">${label}</td>
    <td style="padding:8px 0;font-size:13px;color:#ffffff;font-weight:500;">${value}</td>
  </tr>`
const btn = (href: string, text: string) => `
  <a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#ffffff;color:#2C4A6E;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none;">${text}</a>`
const table = (rows: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.07);border-radius:12px;padding:16px 20px;margin:20px 0;">
    <tbody>${rows}</tbody>
  </table>`

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
    ${p(`Hi ${customerName}, we've got your job details and we're putting together a custom quote for you.`)}
    ${table(
      row('Service', serviceLabel) +
      row('Date', date) +
      row('Time', time) +
      row('Address', `${address}, ${suburb}`) +
      row('Size', `${beds} bed · ${baths} bath`) +
      (extras?.length ? row('Extras', extras.join(', ')) : '')
    )}
    ${p('We usually send quotes within <strong style="color:#fff;">60 minutes</strong> during business hours. You\'ll get another email the moment it\'s ready.')}
    ${btn(`${APP_URL}/track`, 'Track Your Request →')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Quote request received — Clean&Go`,
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
    <div style="display:inline-block;padding:6px 14px;background:rgba(74,183,165,0.2);border:1px solid rgba(74,183,165,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#4ab7a5;font-size:13px;font-weight:600;">💰 Your quote is ready</span>
    </div>
    ${h1(`Your quote: $${price}`)}
    ${p(`Hi ${customerName}, your quote for a ${serviceLabel} is ready.`)}
    ${table(
      row('Service', serviceLabel) +
      row('Date', date) +
      row('Address', `${address}, ${suburb}`) +
      row('Quoted price', `<strong style="font-size:20px;color:#ffffff;">$${price}</strong>`)
    )}
    ${note ? `<div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:16px 20px;margin:16px 0;"><div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:6px;">Note from us</div><div style="font-size:14px;color:rgba(255,255,255,0.8);">${note}</div></div>` : ''}
    ${p('Happy with the price? Hit the button below to confirm your booking.')}
    ${btn(`${APP_URL}/track?id=${bookingId}`, 'Accept Quote →')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Your Clean&Go quote is ready — $${price}`,
    html,
  })
}

// ─── 4. Cleaner: Welcome / set your password ─────────────────────
export async function sendCleanerWelcomeEmail({
  name, email, actionLink,
}: {
  name: string; email: string; actionLink: string
}) {
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(74,183,165,0.2);border:1px solid rgba(74,183,165,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#4ab7a5;font-size:13px;font-weight:600;">🎉 Welcome to the team</span>
    </div>
    ${h1(`Welcome aboard, ${name}!`)}
    ${p('Your application has been approved and your Clean&Go cleaner account is ready. Set your password to log in and start receiving jobs.')}
    ${btn(actionLink, 'Set Your Password →')}
    ${p('<span style="font-size:13px;color:rgba(255,255,255,0.4);">This link expires for security. If it does, contact us and we\'ll send a fresh one.</span>')}
  `)

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to Clean&Go — set your password',
    html,
  })
}

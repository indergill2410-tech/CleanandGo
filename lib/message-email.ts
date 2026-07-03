import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@cleanngo.com.au'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cleanngo.com.au'

const base = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#EFF7FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">Cleanngo sent you a secure service update.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF7FC;padding:34px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0B3558;border-radius:24px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 24px 60px rgba(11,53,88,0.18);">
        <tr><td style="background:#0B3558;padding:30px 34px 22px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.12);">
          <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:0;">cleanngo</div>
          <div style="font-size:13px;color:#9ED8FF;margin-top:6px;font-weight:700;">Your cleaning updates, kept in one place</div>
        </td></tr>
        <tr><td style="padding:34px;">${content}</td></tr>
        <tr><td style="padding:0 34px 30px;">
          <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:18px;font-size:12px;color:rgba(255,255,255,0.70);line-height:1.5;">
            <strong style="color:#ffffff;">Tip:</strong> Reply in your Cleanngo account so access notes, quote questions and booking changes stay attached to the right clean.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const h1 = (t: string) => `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">${t}</h1>`
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.72);line-height:1.65;">${t}</p>`
const btn = (href: string, text: string) => `<a href="${href}" style="display:inline-block;margin-top:24px;padding:15px 28px;background:#ffffff;color:#0B3558;font-weight:900;font-size:15px;border-radius:999px;text-decoration:none;">${text}</a>`

export async function sendCustomerMessageNotificationEmail({
  customerName, customerEmail, conversationId,
}: {
  customerName: string; customerEmail: string; conversationId: string
}) {
  const messagePath = `/account/messages?conversation=${conversationId}`
  const messageUrl = `${APP_URL}${messagePath}`
  const loginUrl = `${APP_URL}/login?tab=client&redirectTo=${encodeURIComponent(messagePath)}`
  const html = base(`
    <div style="display:inline-block;padding:6px 14px;background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.4);border-radius:20px;margin-bottom:20px;">
      <span style="color:#60a5fa;font-size:13px;font-weight:600;">New message from cleanngo</span>
    </div>
    ${h1('You have a new Cleanngo message')}
    ${p(`Hi ${customerName}, your service team sent an update about your booking. Open it securely so every reply stays connected to the right clean.`)}
    ${btn(messageUrl, 'Open Message →')}
    ${p(`<span style="font-size:13px;color:rgba(255,255,255,0.48);">If the button asks you to sign in, use your client account. You can also use this login link: <a href="${loginUrl}" style="color:rgba(255,255,255,0.72);">sign in to view your message</a>.</span>`)}
  `)
  return getResend().emails.send({ from: FROM, to: customerEmail, subject: 'New message from cleanngo', html })
}

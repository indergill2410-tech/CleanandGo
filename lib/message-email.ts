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
<body style="margin:0;padding:0;background:#F5F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1C2B3A;border-radius:24px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1C2B3A,#2C4A6E);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">cleanngo</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">cleanngo.com.au</div>
        </td></tr>
        <tr><td style="padding:36px 40px;">${content}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const h1 = (t: string) => `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">${t}</h1>`
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;">${t}</p>`
const btn = (href: string, text: string) => `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#ffffff;color:#2C4A6E;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none;">${text}</a>`

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
    ${h1('You have a new message')}
    ${p(`Hi ${customerName}, cleanngo sent you a message about your booking. Log in to view and reply securely.`)}
    ${btn(messageUrl, 'Open Message →')}
    ${p(`<span style="font-size:13px;color:rgba(255,255,255,0.4);">If the button asks you to sign in, use your client account. You can also use this login link: <a href="${loginUrl}" style="color:rgba(255,255,255,0.65);">sign in to view your message</a>.</span>`)}
  `)
  return getResend().emails.send({ from: FROM, to: customerEmail, subject: 'New message from cleanngo', html })
}

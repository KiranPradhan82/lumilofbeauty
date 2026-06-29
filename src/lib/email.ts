import { Resend } from 'resend'
import { db } from './db'

async function getSenderEmail(): Promise<string> {
  const setting = await db.siteSetting.findUnique({ where: { key: 'companyEmail' } })
  return setting?.value || 'hello@lumilofbeauty.com'
}

async function getCompanyName(): Promise<string> {
  const setting = await db.siteSetting.findUnique({ where: { key: 'companyName' } })
  return setting?.value || 'Lumil of Beauty'
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendBookingStatusUpdate(props: {
  customerName: string
  customerEmail: string
  date: string
  time: string
  status: string
  serviceName: string | null
}) {
  const resend = getResendClient()
  if (!resend) return

  const from = await getSenderEmail()
  const company = await getCompanyName()

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  const statusColors: Record<string, string> = {
    confirmed: '#16a34a',
    completed: '#2563eb',
    cancelled: '#dc2626',
    pending: '#d97706',
  }

  await resend.emails.send({
    from: `${company} <onboarding@resend.dev>`,
    to: props.customerEmail,
    subject: `Booking ${statusLabels[props.status] || props.status} — ${company}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;color:#1f2937">
        <div style="background:linear-gradient(135deg,#ec4899,#f43f5e);padding:32px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">${company}</h1>
        </div>
        <div style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px;font-size:16px">Hi <strong>${props.customerName}</strong>,</p>
          <p style="margin:0 0 24px;color:#6b7280">Your booking status has been updated:</p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px">Status</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:${statusColors[props.status] || '#1f2937'}">${statusLabels[props.status] || props.status}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Date</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:500">${props.date}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Time</td><td style="padding:8px 0;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:500">${props.time}</td></tr>
            ${props.serviceName ? `<tr><td style="padding:8px 0;color:#6b7280">Service(s)</td><td style="padding:8px 0;text-align:right;font-weight:500">${props.serviceName}</td></tr>` : ''}
          </table>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">Thank you for choosing ${company}.</p>
        </div>
      </div>
    `,
  })
}

export async function sendReceipt(props: {
  customerName: string
  customerEmail: string
  date: string
  time: string
  totalAmount: number
  paymentMethod: string | null
  serviceName: string | null
}) {
  const resend = getResendClient()
  if (!resend) return

  const from = await getSenderEmail()
  const company = await getCompanyName()

  await resend.emails.send({
    from: `${company} <onboarding@resend.dev>`,
    to: props.customerEmail,
    subject: `Payment Receipt — ${company}`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;color:#1f2937">
        <div style="background:linear-gradient(135deg,#ec4899,#f43f5e);padding:32px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">${company}</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Payment Receipt</p>
        </div>
        <div style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 24px;font-size:16px">Hi <strong>${props.customerName}</strong>, here is your receipt.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Date</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:500">${props.date}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Time</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:500">${props.time}</td></tr>
            ${props.serviceName ? `<tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Service(s)</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:500">${props.serviceName}</td></tr>` : ''}
            <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Payment Method</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:500">${props.paymentMethod || 'N/A'}</td></tr>
            <tr><td style="padding:14px 0;font-weight:700;font-size:16px">Total</td><td style="padding:14px 0;text-align:right;font-weight:700;font-size:18px;color:#ec4899">Rs. ${props.totalAmount.toLocaleString()}</td></tr>
          </table>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px">Thank you for your payment!</p>
        </div>
      </div>
    `,
  })
}

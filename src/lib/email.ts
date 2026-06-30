import nodemailer from 'nodemailer'
import { db } from '@/lib/db'

export async function getGmailTransport() {
  const settings = await db.siteSetting.findMany({
    where: { key: { in: ['gmailAddress', 'gmailAppPassword'] } },
  })
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = s.value

  const gmailAddress = map.gmailAddress || process.env.GMAIL_ADDRESS
  const gmailAppPassword = map.gmailAppPassword || process.env.GMAIL_APP_PASSWORD

  if (!gmailAddress || !gmailAppPassword) {
    return { transporter: null, gmailAddress: null, error: 'Gmail email and app password are not configured. Set them in Admin → Settings.' }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailAddress,
      pass: gmailAppPassword,
    },
  })

  return { transporter, gmailAddress, error: null }
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { transporter, gmailAddress, error } = await getGmailTransport()

  if (!transporter || !gmailAddress) {
    throw new Error(error || 'Email not configured')
  }

  // Get company name for sender display
  const companyNameSetting = await db.siteSetting.findUnique({ where: { key: 'companyName' } })
  const companyName = companyNameSetting?.value || 'Lumil of Beauty'

  await transporter.sendMail({
    from: `"${companyName}" <${gmailAddress}>`,
    to,
    subject,
    html,
  })

  return { success: true }
}
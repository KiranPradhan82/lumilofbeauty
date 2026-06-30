import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST() {
  try {
    const { db } = await import('@/lib/db')

    // Get Gmail address from settings
    const gmailSetting = await db.siteSetting.findUnique({ where: { key: 'gmailAddress' } })
    const gmailAddress = gmailSetting?.value || process.env.GMAIL_ADDRESS

    if (!gmailAddress) {
      return NextResponse.json({ success: false, error: 'Gmail address not configured. Set it in Settings first.' }, { status: 503 })
    }

    // Get company name
    const nameSetting = await db.siteSetting.findUnique({ where: { key: 'companyName' } })
    const companyName = nameSetting?.value || 'Lumil of Beauty'

    await sendEmail({
      to: gmailAddress,
      subject: `Test Email — ${companyName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ec4899; font-size: 24px; margin: 0;">${companyName}</h1>
            <p style="color: #9ca3af; font-size: 14px; margin: 8px 0 0;">Email Configuration Test</p>
          </div>
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 36px; margin: 0;">&#10003;</p>
            <p style="color: #166534; font-size: 16px; font-weight: 600; margin: 8px 0 0;">Success! Gmail SMTP is working.</p>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
            Your Gmail account is correctly configured to send emails on behalf of <strong>${companyName}</strong>.
            Verification codes, booking confirmations, and notifications will be sent from <strong>${gmailAddress}</strong>.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: `Test email sent to ${gmailAddress}` })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email. Check your Gmail address and app password.',
    }, { status: 500 })
  }
}
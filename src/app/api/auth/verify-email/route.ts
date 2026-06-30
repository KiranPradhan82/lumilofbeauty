import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    // Find user
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: 'Email is already verified' })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store OTP
    await db.otp.upsert({
      where: { id: `verify_${email}` },
      update: { code: otp, expiresAt, verified: false, purpose: 'email_verification' },
      create: {
        id: `verify_${email}`,
        identifier: email,
        code: otp,
        purpose: 'email_verification',
        expiresAt,
        verified: false,
      },
    })

    // Get company name for email
    const companyNameSetting = await db.siteSetting.findUnique({ where: { key: 'companyName' } })
    const companyName = companyNameSetting?.value || 'Lumil of Beauty'

    // Send verification email via Gmail
    await sendEmail({
      to: email,
      subject: `Verify your email — ${companyName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ec4899; font-size: 24px; margin: 0;">${companyName}</h1>
          </div>
          <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Verify Your Email</h2>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Welcome${user.firstName ? `, ${user.firstName}` : ''}! Please use the following code to verify your email address. This code expires in 15 minutes.
          </p>
          <div style="background: #fdf2f8; border: 2px solid #fbcfe8; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; color: #be185d; letter-spacing: 8px; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send verification email',
    }, { status: 500 })
  }
}
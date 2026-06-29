import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomInt } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { action, identifier, purpose, code } = await request.json()

    if (action === 'send') {
      if (!identifier || !purpose) {
        return NextResponse.json({ success: false, error: 'Missing identifier or purpose' }, { status: 400 })
      }

      await db.otp.deleteMany({ where: { identifier, purpose, verified: false } })

      const otpCode = String(randomInt(100000, 999999))
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      await db.otp.create({
        data: { identifier, code: otpCode, purpose, expiresAt },
      })

      if (identifier.includes('@')) {
        try {
          const { getCompanyName } = await import('@/lib/email')
          const company = await getCompanyName()
          const { Resend } = await import('resend')
          const apiKey = process.env.RESEND_API_KEY
          if (apiKey) {
            const resend = new Resend(apiKey)
            resend.emails.send({
              from: `${company} <onboarding@resend.dev>`,
              to: identifier,
              subject: `Your OTP Code - ${company}`,
              html: `<div style="max-width:400px;margin:0 auto;font-family:system-ui;padding:32px;text-align:center">
                <h2 style="color:#ec4899;margin:0 0 8px">${company}</h2>
                <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Use this code to verify your identity</p>
                <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1f2937">${otpCode}</div>
                <p style="color:#9ca3af;font-size:12px;margin:16px 0 0">This code expires in 10 minutes.</p>
              </div>`,
            }).catch(() => {})
          }
        } catch {} 
      }

      console.log(`[OTP] ${purpose} for ${identifier}: ${otpCode}`)
      return NextResponse.json({ success: true, message: 'OTP sent' })
    }

    if (action === 'verify') {
      if (!identifier || !purpose || !code) {
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
      }

      const otp = await db.otp.findFirst({
        where: { identifier, purpose, code, verified: false, expiresAt: { gt: new Date() } },
      })

      if (!otp) {
        return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 })
      }

      await db.otp.update({ where: { id: otp.id }, data: { verified: true } })
      return NextResponse.json({ success: true, message: 'OTP verified' })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

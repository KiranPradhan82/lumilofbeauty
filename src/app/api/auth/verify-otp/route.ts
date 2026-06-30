import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and code are required' }, { status: 400 })
    }

    // Find OTP
    const otp = await db.otp.findUnique({ where: { id: `verify_${email}` } })
    if (!otp) {
      return NextResponse.json({ success: false, error: 'No verification code found. Please request a new one.' }, { status: 404 })
    }

    if (otp.verified) {
      return NextResponse.json({ success: false, error: 'This code has already been used' }, { status: 400 })
    }

    if (new Date() > otp.expiresAt) {
      return NextResponse.json({ success: false, error: 'This code has expired. Please request a new one.' }, { status: 400 })
    }

    if (otp.code !== code) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 })
    }

    // Mark OTP as verified
    await db.otp.update({
      where: { id: `verify_${email}` },
      data: { verified: true },
    })

    // Mark user email as verified
    await db.user.update({
      where: { email },
      data: { emailVerified: true },
    })

    return NextResponse.json({ success: true, message: 'Email verified successfully' })
  } catch (error: any) {
    console.error('Verify email error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 })
  }
}
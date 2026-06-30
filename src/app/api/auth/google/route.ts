import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ success: false, error: 'Google token is required' }, { status: 400 })
    }

    // Get Google Client ID from settings
    const clientIdSetting = await db.siteSetting.findUnique({ where: { key: 'googleClientId' } })
    const googleClientId = clientIdSetting?.value || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!googleClientId) {
      return NextResponse.json({
        success: false,
        error: 'Google Sign-In is not configured. Please set the Google Client ID in admin settings.',
      }, { status: 503 })
    }

    // Verify the Google ID token
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    )
    if (!verifyRes.ok) {
      return NextResponse.json({ success: false, error: 'Invalid Google token. Please try again.' }, { status: 401 })
    }

    const googleUser = await verifyRes.json()

    // Verify the audience matches our client ID
    if (googleUser.aud !== googleClientId) {
      return NextResponse.json({ success: false, error: 'Token audience mismatch. Check your Google Client ID configuration.' }, { status: 401 })
    }

    const email = googleUser.email
    const firstName = googleUser.given_name || email.split('@')[0]
    const lastName = googleUser.family_name || ''
    const picture = googleUser.picture || null

    // Upsert user
    const user = await db.user.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        emailVerified: true,
      },
      create: {
        email,
        firstName,
        lastName,
        passwordHash: 'google_oauth_' + googleUser.sub,
        phone: null,
        role: 'customer',
        emailVerified: true,
      },
    })

    const { passwordHash, ...safeUser } = user

    return NextResponse.json({
      success: true,
      data: {
        ...safeUser,
        isNewUser: !passwordHash?.startsWith('google_oauth_') ? false : (user as any)._count === undefined,
        picture,
      },
    })
  } catch (error: any) {
    console.error('Google auth error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Google sign-in failed' }, { status: 500 })
  }
}
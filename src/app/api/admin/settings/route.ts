import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEFAULTS: Record<string, string> = {
  companyName: 'Lumil of Beauty',
  companyEmail: 'hello@lumilofbeauty.com',
  companyPhone: '+977-9801234567',
  companyAddress: 'Ilam & Jhapa Districts, Eastern Nepal',
  logoUrl: '',
}

// Keys that contain secrets and should be masked in GET responses to non-admin contexts
const SECRET_KEYS = ['gmailAppPassword', 'googleClientSecret', 'resendApiKey']

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()
    const map: Record<string, string> = { ...DEFAULTS }
    for (const s of settings) {
      // Mask secret values — show last 4 chars only
      if (SECRET_KEYS.includes(s.key) && s.value.length > 8) {
        map[s.key] = '••••••••' + s.value.slice(-4)
      } else {
        map[s.key] = s.value
      }
    }
    return NextResponse.json({ success: true, data: map })
  } catch (error: any) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: Record<string, string> = await request.json()
    for (const [key, value] of Object.entries(body)) {
      // If the value looks masked (starts with bullets), skip updating it
      if (value.startsWith('••••')) continue

      await db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
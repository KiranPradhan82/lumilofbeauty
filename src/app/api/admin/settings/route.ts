import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEFAULTS: Record<string, string> = {
  companyName: 'Lumil of Beauty',
  companyEmail: 'hello@lumilofbeauty.com',
  companyPhone: '+977-9801234567',
  companyAddress: 'Jhamsikhel, Lalitpur, Kathmandu, Nepal',
  logoUrl: '',
}

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()
    const map: Record<string, string> = { ...DEFAULTS }
    for (const s of settings) map[s.key] = s.value
    return NextResponse.json({ success: true, data: map })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: Record<string, string> = await request.json()
    for (const [key, value] of Object.entries(body)) {
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
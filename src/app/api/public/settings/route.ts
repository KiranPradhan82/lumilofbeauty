import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Returns only non-sensitive public settings (Google Client ID is needed for login)
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['googleClientId', 'companyName'] } },
    })
    const data: Record<string, string> = {}
    for (const s of settings) data[s.key] = s.value
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: true, data: {} })
  }
}
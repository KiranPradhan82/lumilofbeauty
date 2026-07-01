import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Returns non-sensitive public settings needed by the frontend
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: [
        'googleClientId',
        'companyName',
        'parlourLat',
        'parlourLng',
        'deliveryRadiusKm',
      ] } },
    })
    const data: Record<string, string> = {}
    for (const s of settings) data[s.key] = s.value
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: true, data: {} })
  }
}
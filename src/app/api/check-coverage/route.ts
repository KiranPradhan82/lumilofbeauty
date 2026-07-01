import { NextRequest, NextResponse } from 'next/server'

// Haversine distance in km between two lat/lng points
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json()

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ success: false, error: 'Valid lat/lng required' }, { status: 400 })
    }

    const { db } = await import('@/lib/db')
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['parlourLat', 'parlourLng', 'deliveryRadiusKm'] } },
    })
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value

    const parlourLat = parseFloat(map.parlourLat)
    const parlourLng = parseFloat(map.parlourLng)
    const radius = parseFloat(map.deliveryRadiusKm) || 50

    if (isNaN(parlourLat) || isNaN(parlourLng)) {
      return NextResponse.json({ success: false, error: 'Service area not configured by admin' }, { status: 503 })
    }

    const distance = haversineDistance(lat, lng, parlourLat, parlourLng)
    const covered = distance <= radius

    return NextResponse.json({
      success: true,
      data: {
        covered,
        distance: Math.round(distance * 10) / 10,
        radius,
        parlourLat,
        parlourLng,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Coverage check failed' }, { status: 500 })
  }
}
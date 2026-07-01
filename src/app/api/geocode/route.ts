import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q) {
      return NextResponse.json({ success: false, error: 'Address query (q) is required' }, { status: 400 })
    }

    // Use Nominatim for free geocoding
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=np`,
      {
        headers: { 'User-Agent': 'LumilOfBeauty/1.0' },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Geocoding service unavailable' }, { status: 503 })
    }

    const data = await res.json()

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Address not found. Try a more specific address.' }, { status: 404 })
    }

    const result = data[0]
    return NextResponse.json({
      success: true,
      data: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      },
    })
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json({ success: false, error: 'Geocoding timed out. Try again.' }, { status: 504 })
    }
    return NextResponse.json({ success: false, error: 'Geocoding failed' }, { status: 500 })
  }
}
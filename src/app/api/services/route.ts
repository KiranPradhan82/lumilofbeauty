import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = { isActive: true }
    if (category && category !== 'all') {
      where.category = { slug: category }
    }

    const services = await db.service.findMany({
      where,
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 })
  }
}

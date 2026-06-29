import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const services = await db.service.findMany({
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const service = await db.service.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description || '',
        price: body.price,
        duration: body.duration,
        categoryId: body.categoryId,
        featured: body.featured || false,
        isActive: body.isActive !== false,
        sortOrder: body.sortOrder || 0,
      },
    })
    return NextResponse.json({ success: true, data: service }, { status: 201 })
  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create service' }, { status: 500 })
  }
}

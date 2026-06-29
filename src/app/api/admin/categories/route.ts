import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.serviceCategory.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const category = await db.serviceCategory.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        icon: body.icon || null,
        sortOrder: body.sortOrder || 0,
      },
    })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}

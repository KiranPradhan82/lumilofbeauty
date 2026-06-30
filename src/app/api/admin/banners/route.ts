import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      include: { service: { select: { id: true, name: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: banners })
  } catch (error) {
    console.error('Admin banners fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, subtitle, imageUrl, videoUrl, serviceId, linkUrl, sortOrder, isActive } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const banner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        serviceId: serviceId || null,
        linkUrl: linkUrl || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
      include: { service: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: banner }, { status: 201 })
  } catch (error) {
    console.error('Banner creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create banner' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, subtitle, imageUrl, videoUrl, serviceId, linkUrl, sortOrder, isActive } = body

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(serviceId !== undefined && { serviceId: serviceId || null }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { service: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ success: true, data: banner })
  } catch (error) {
    console.error('Banner update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.banner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Banner delete error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete banner' }, { status: 500 })
  }
}
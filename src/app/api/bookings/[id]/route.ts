import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const booking = await db.booking.update({
      where: { id },
      data: { status: body.status },
      include: {
        services: { include: { service: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    })
    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.bookingService.deleteMany({ where: { bookingId: id } })
    await db.booking.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 })
  }
}
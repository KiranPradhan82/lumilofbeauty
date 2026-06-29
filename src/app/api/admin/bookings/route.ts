import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        services: { include: { service: { select: { id: true, name: true, price: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 })

    const booking = await db.booking.update({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        services: { include: { service: true } },
      },
      data: updates,
    })

    // Fire-and-forget email notification on status change
    if (updates.status && booking.user?.email) {
      import('@/lib/email').then(({ sendBookingStatusUpdate }) =>
        sendBookingStatusUpdate({
          customerName: `${booking.user.firstName} ${booking.user.lastName}`,
          customerEmail: booking.user.email,
          date: booking.bookingDate,
          time: booking.bookingTime,
          status: booking.status,
          serviceName: booking.services.map(bs => bs.service.name).join(', ') || null,
        }).catch(() => {})
      )
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where: any = {}
    if (userId) {
      where.userId = userId
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        services: { include: { service: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, bookingDate, bookingTime, serviceIds, notes, paymentMethod } = body

    if (!userId || !bookingDate || !bookingTime || !serviceIds?.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const services = await db.service.findMany({
      where: { id: { in: serviceIds } },
    })

    const totalAmount = services.reduce((sum, s) => sum + s.price, 0)

    const booking = await db.booking.create({
      data: {
        userId,
        bookingDate,
        bookingTime,
        totalAmount,
        paymentMethod: paymentMethod || null,
        paymentStatus: 'paid',
        status: 'confirmed',
        notes: notes || null,
        services: {
          create: services.map((s) => ({ serviceId: s.id, price: s.price })),
        },
      },
      include: {
        services: { include: { service: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, data: booking }, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 })
  }
}

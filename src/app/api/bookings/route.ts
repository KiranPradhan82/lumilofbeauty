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
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } },
        services: { include: { service: true } },
        reviews: { include: { service: { select: { name: true } } } },
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
    const {
      userId,
      guestName,
      guestPhone,
      guestEmail,
      bookingDate,
      bookingTime,
      serviceIds,
      notes,
      address,
      latitude,
      longitude,
    } = body

    if (!bookingDate || !bookingTime) {
      return NextResponse.json({ success: false, error: 'Date and time are required' }, { status: 400 })
    }

    // Resolve or create user
    let finalUserId = userId
    let isGuest = false

    if (!finalUserId) {
      // Guest booking — require name and phone at minimum
      if (!guestName || !guestPhone) {
        return NextResponse.json({ success: false, error: 'Name and phone are required to book' }, { status: 400 })
      }

      // Check if a guest user already exists for this phone
      const existingGuest = await db.user.findFirst({
        where: { phone: guestPhone, role: 'guest' },
      })

      if (existingGuest) {
        finalUserId = existingGuest.id
        // Update their info if email or name changed
        await db.user.update({
          where: { id: existingGuest.id },
          data: {
            firstName: guestName.split(' ')[0] || guestName,
            lastName: guestName.split(' ').slice(1).join(' ') || '',
            email: guestEmail || existingGuest.email,
          },
        })
      } else {
        // Create a new guest user
        const nameParts = (guestName || 'Guest').split(' ')
        const guest = await db.user.create({
          data: {
            email: guestEmail || `guest_${Date.now()}@lumilofbeauty.com`,
            passwordHash: 'guest_booking',
            firstName: nameParts[0] || 'Guest',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: guestPhone,
            role: 'guest',
            emailVerified: true,
          },
        })
        finalUserId = guest.id
      }
      isGuest = true
    }

    // Calculate total from selected services
    let totalAmount = 0
    let serviceData: { serviceId: string; price: number }[] = []

    if (serviceIds?.length) {
      const services = await db.service.findMany({
        where: { id: { in: serviceIds } },
      })
      totalAmount = services.reduce((sum, s) => sum + s.price, 0)
      serviceData = services.map((s) => ({ serviceId: s.id, price: s.price }))
    }

    const booking = await db.booking.create({
      data: {
        userId: finalUserId,
        bookingDate,
        bookingTime,
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        notes: notes || null,
        address: address || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        services: {
          create: serviceData,
        },
      },
      include: {
        services: { include: { service: true } },
        user: { select: { firstName: true, lastName: true, email: true, phone: true, role: true } },
      },
    })

    return NextResponse.json({ success: true, data: { ...booking, isGuest } }, { status: 201 })
  } catch (error: any) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to create booking' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reviews?mode=pending&userId=xxx — customer's pending reviews
// GET /api/reviews — public: all reviews for testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')
    const userId = searchParams.get('userId')

    if (mode === 'pending' && userId) {
      // Find completed bookings that don't have reviews yet for this user
      const completedBookings = await db.booking.findMany({
        where: {
          userId,
          status: 'completed',
          reviews: { none: {} },
        },
        include: {
          services: { include: { service: { select: { id: true, name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      })

      return NextResponse.json({ success: true, data: completedBookings })
    }

    // Public: get all reviews for testimonials (only reviews with comments)
    const reviews = await db.review.findMany({
      where: { comment: { not: null } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        service: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: reviews })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews — customer submits a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, bookingId, serviceId, rating, comment, photos } = body

    if (!userId || !bookingId || !serviceId || !rating) {
      return NextResponse.json({ success: false, error: 'User ID, Booking ID, Service ID, and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Verify the booking belongs to this user and is completed
    const booking = await db.booking.findFirst({
      where: { id: bookingId, userId, status: 'completed' },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found, not completed, or does not belong to you' }, { status: 404 })
    }

    // Check if review already exists for this booking+service
    const existing = await db.review.findFirst({
      where: { bookingId, serviceId, userId },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already reviewed this service for this booking' }, { status: 409 })
    }

    // Verify the service is part of this booking
    const bookingService = await db.bookingService.findFirst({
      where: { bookingId, serviceId },
    })

    if (!bookingService) {
      return NextResponse.json({ success: false, error: 'This service is not part of this booking' }, { status: 400 })
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId,
        bookingId,
        serviceId,
        rating,
        comment: comment || null,
        photos: photos ? JSON.stringify(photos) : '[]',
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        service: { select: { name: true } },
      },
    })

    return NextResponse.json({ success: true, data: review })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit review' }, { status: 500 })
  }
}
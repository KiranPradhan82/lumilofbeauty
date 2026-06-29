import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendBookingStatusUpdate } from '@/lib/email'

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      include: { service: true },
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
    const { customerName, customerPhone, customerEmail, serviceId, date, time, notes, totalAmount } = body

    const booking = await db.booking.create({
      data: {
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        serviceId: serviceId || null,
        date: new Date(date),
        time,
        notes: notes || null,
        totalAmount: totalAmount ? parseFloat(totalAmount) : null,
      },
    })
    return NextResponse.json({ success: true, data: booking })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 })

    const booking = await db.booking.update({
      where: { id },
      include: { service: true },
      data: {
        ...updates,
        date: updates.date ? new Date(updates.date) : undefined,
        totalAmount: updates.totalAmount ? parseFloat(updates.totalAmount) : undefined,
      },
    })

    // Send status update email (fire-and-forget)
    if (updates.status && booking.customerEmail) {
      sendBookingStatusUpdate({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        serviceName: booking.service?.name || null,
      }).catch(() => {})
    }

    // Send receipt when payment is completed
    if (updates.paymentStatus === 'paid' && booking.customerEmail && booking.totalAmount) {
      const { sendReceipt } = await import('@/lib/email')
      sendReceipt({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        date: booking.date,
        time: booking.time,
        totalAmount: booking.totalAmount,
        paymentMethod: booking.paymentMethod || null,
        serviceName: booking.service?.name || null,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

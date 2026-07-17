import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'Email, password, firstName, lastName are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if any admin already exists
    const existingAdmin = await db.user.findFirst({ where: { role: 'admin' } })
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: 'An admin already exists. Delete the existing admin first.' }, { status: 409 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email,
        passwordHash: 'hashed_' + password,
        firstName,
        lastName,
        phone: phone || null,
        role: 'admin',
        emailVerified: true,
      },
    })

    const { passwordHash, ...safeUser } = user
    return NextResponse.json({ success: true, data: safeUser }, { status: 201 })
  } catch (error: any) {
    console.error('Admin creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create admin: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const admins = await db.user.findMany({ where: { role: 'admin' } })
    if (admins.length === 0) {
      return NextResponse.json({ success: false, error: 'No admin users found' }, { status: 404 })
    }

    for (const admin of admins) {
      const bookings = await db.booking.findMany({ where: { userId: admin.id }, select: { id: true } })
      if (bookings.length > 0) {
        await db.bookingService.deleteMany({ where: { bookingId: { in: bookings.map(b => b.id) } } })
        await db.booking.deleteMany({ where: { userId: admin.id } })
      }
      await db.review.deleteMany({ where: { userId: admin.id } })
      await db.user.delete({ where: { id: admin.id } })
    }

    return NextResponse.json({ success: true, message: `Deleted ${admins.length} admin user(s)` })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete admin: ' + (error.message || 'Unknown error') }, { status: 500 })
  }
}
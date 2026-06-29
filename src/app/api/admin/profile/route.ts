import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashSync, compareSync } from 'bcryptjs'

export async function GET() {
  try {
    let admin = await db.user.findFirst({ where: { role: 'admin' }, select: { id: true, email: true, firstName: true, lastName: true, phone: true } })
    if (!admin) {
      const hashed = hashSync('lumil2026', 10)
      admin = await db.user.create({
        data: { email: 'admin@lumilofbeauty.com', passwordHash: hashed, firstName: 'Admin', lastName: 'Lumil', role: 'admin', emailVerified: true },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      })
    }
    return NextResponse.json({ success: true, data: admin })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { field, value, currentPassword, otpVerified } = body

    const admin = await db.user.findFirst({ where: { role: 'admin' } })
    if (!admin) return NextResponse.json({ success: false, error: 'No admin account' }, { status: 404 })

    if (field === 'email') {
      if (!otpVerified) return NextResponse.json({ success: false, error: 'OTP verification required' }, { status: 400 })
      const updated = await db.user.update({
        where: { id: admin.id }, data: { email: value, emailVerified: true },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      })
      return NextResponse.json({ success: true, data: updated })
    }

    if (field === 'password') {
      if (!currentPassword || !otpVerified) return NextResponse.json({ success: false, error: 'Current password and OTP required' }, { status: 400 })
      if (!compareSync(currentPassword, admin.passwordHash)) return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
      const newHash = hashSync(value, 10)
      await db.user.update({ where: { id: admin.id }, data: { passwordHash: newHash } })
      return NextResponse.json({ success: true, message: 'Password updated' })
    }

    if (field === 'name') {
      const [first, ...rest] = (value || '').split(' ')
      const updated = await db.user.update({
        where: { id: admin.id }, data: { firstName: first, lastName: rest.join(' ') || '' },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      })
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ success: false, error: 'Invalid field' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

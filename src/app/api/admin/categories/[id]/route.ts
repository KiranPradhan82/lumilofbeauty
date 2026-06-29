import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const category = await db.serviceCategory.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, data: category })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const svcCount = await db.service.count({ where: { categoryId: id } })
    if (svcCount > 0) {
      return NextResponse.json({ success: false, error: `Cannot delete: ${svcCount} services are linked to this category.` }, { status: 400 })
    }
    await db.serviceCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
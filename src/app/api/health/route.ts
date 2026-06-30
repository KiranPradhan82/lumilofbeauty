import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const rawUrl = process.env.DATABASE_URL
    const results: Record<string, string> = {
      nodeEnv: process.env.NODE_ENV || 'not set',
      databaseUrlPrefix: rawUrl ? rawUrl.substring(0, 30) + (rawUrl.length > 30 ? '...' : '') : '(empty/undefined)',
      databaseUrlIsUndefined: String(rawUrl === undefined || rawUrl === 'undefined' || rawUrl?.trim() === ''),
    }

    // Try a simple query
    try {
      const count = await db.siteSetting.count()
      results.dbConnection = 'OK'
      results.siteSettingsCount = String(count)
    } catch (dbError: any) {
      results.dbConnection = 'FAILED'
      results.dbError = dbError.message || String(dbError)
    }

    // Check if tables exist
    try {
      await db.user.count()
      results.tablesExist = 'YES'
    } catch {
      results.tablesExist = 'NO — tables may need to be created with prisma db push'
    }

    return NextResponse.json({ success: true, data: results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
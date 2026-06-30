import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const rawUrl = process.env.DATABASE_URL
const databaseUrl = (rawUrl && rawUrl !== 'undefined' && rawUrl.trim() !== '')
  ? rawUrl.trim()
  : 'file:./db/custom.db'

function createPrismaClient(): PrismaClient {
  // If using Turso (libsql://), use the libsql adapter
  if (databaseUrl.startsWith('libsql://')) {
    if (!process.env.DATABASE_AUTH_TOKEN) {
      throw new Error(
        'DATABASE_AUTH_TOKEN is required when using Turso (libsql://). ' +
        'Set it in your deployment environment variables. ' +
        'Get it from your Turso dashboard → your database → Authentication.'
      )
    }
    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter, log: ['query'] })
  }

  // Standard local SQLite — explicitly pass the URL so Prisma doesn't
  // read the raw (possibly "undefined") env var itself
  return new PrismaClient({
    log: ['query'],
    datasources: {
      db: { url: databaseUrl },
    },
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
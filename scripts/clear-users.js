const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

const url = process.env.DATABASE_URL || 'file:./db/custom.db';

function createPrismaClient() {
  if (url.startsWith('libsql://')) {
    const adapter = new PrismaLibSQL({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient({ datasources: { db: { url } } });
}

async function main() {
  const db = createPrismaClient();

  // List all users first
  const users = await db.user.findMany();
  console.log(`Found ${users.length} user(s):`);
  users.forEach(u => console.log(`  - ${u.email} (${u.role})`));

  // Delete all related records
  await db.bookingService.deleteMany({});
  await db.booking.deleteMany({});
  await db.review.deleteMany({});
  await db.otp.deleteMany({});
  await db.user.deleteMany({});

  console.log('All users and related data deleted.');
}

main().catch(console.error).finally(() => process.exit(0));

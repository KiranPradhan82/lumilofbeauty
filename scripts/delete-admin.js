const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

const url = process.env.DATABASE_URL || 'file:./db/custom.db';

function createPrismaClient() {
  if (url.startsWith('libsql://')) {
    const adapter = new PrismaLibSQL({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient({ datasources: { db: { url } } });
}

async function main() {
  const db = createPrismaClient();

  const admins = await db.user.findMany({ where: { role: 'admin' } });
  if (admins.length === 0) {
    console.log('No admin users found.');
    return;
  }

  for (const admin of admins) {
    // Delete related bookings first
    const bookingServices = await db.bookingService.findMany({
      where: { booking: { userId: admin.id } },
      select: { id: true },
    });
    if (bookingServices.length > 0) {
      await db.bookingService.deleteMany({
        where: { bookingId: { in: bookingServices.map(b => b.bookingId) } },
      });
    }
    await db.booking.deleteMany({ where: { userId: admin.id } });
    await db.review.deleteMany({ where: { userId: admin.id } });
    await db.user.delete({ where: { id: admin.id } });
    console.log('Deleted admin:', admin.email);
  }

  console.log('Done. All admin users removed. Register a new one at /register or /login.');
}

main().catch(console.error).finally(() => process.exit(0));

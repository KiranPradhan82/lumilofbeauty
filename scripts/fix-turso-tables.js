const { createClient } = require('@libsql/client');

const FIX_SQL = `
DROP TABLE IF EXISTS "Review";
DROP TABLE IF EXISTS "BookingService";
DROP TABLE IF EXISTS "Booking";

CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookingDate" TEXT NOT NULL,
    "bookingTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalAmount" REAL NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Booking_userId_idx" ON "Booking"("userId");

CREATE TABLE "BookingService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "BookingService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookingService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "BookingService_bookingId_serviceId_key" ON "BookingService"("bookingId", "serviceId");

CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
`;

async function main() {
  const turso = createClient({
    url: 'libsql://lumilofbeautydb-kiran2057.aws-eu-west-1.turso.io',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const statements = FIX_SQL.split(';').map(s => s.trim()).filter(s => s.length > 0);

  for (const sql of statements) {
    try {
      await turso.execute(sql);
      const firstLine = sql.split('\n')[0].substring(0, 70);
      console.log('OK:', firstLine);
    } catch (e) {
      const firstLine = sql.split('\n')[0].substring(0, 70);
      console.log('ERR:', firstLine, '->', e.message.substring(0, 100));
    }
  }

  // Verify
  const tables = await turso.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  console.log('\nAll tables:', tables.rows.map(r => r.name).join(', '));
  
  // Test a query
  const count = await turso.execute("SELECT COUNT(*) as c FROM SiteSetting");
  console.log('SiteSetting rows:', count.rows[0].c);
}

main().catch(e => console.error('Fatal:', e));
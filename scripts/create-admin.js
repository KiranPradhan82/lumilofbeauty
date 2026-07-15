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
  return new PrismaClient({
    datasources: { db: { url } },
  });
}

async function main() {
  const db = createPrismaClient();

  const email = 'admin@lumilofbeauty.com';
  const password = 'admin123';

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', email);
    console.log('Role:', existing.role);
    return;
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash: 'hashed_' + password,
      firstName: 'Lumil',
      lastName: 'Admin',
      phone: '+977-9801234567',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('Admin user created successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
}

main().catch(console.error).finally(() => process.exit(0));

// Test script - run with: DATABASE_AUTH_TOKEN=xxx node scripts/test-turso-connection.js
process.env.DATABASE_URL = 'libsql://lumilofbeautydb-kiran2057.aws-eu-west-1.turso.io';

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 40) + '...');
  console.log('DATABASE_AUTH_TOKEN set:', !!process.env.DATABASE_AUTH_TOKEN);

  const libsql = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSQL(libsql);
  const db = new PrismaClient({ adapter, log: ['query'] });

  const count = await db.siteSetting.count();
  console.log('Connection OK! Settings count:', count);

  await db.siteSetting.upsert({
    where: { key: 'companyName' },
    update: { value: 'Lumil of Beauty' },
    create: { key: 'companyName', value: 'Lumil of Beauty' },
  });
  console.log('Write test: OK');

  const all = await db.siteSetting.findMany();
  console.log('Settings:', all.map(s => s.key + '=' + s.value));

  await db.$disconnect();
  console.log('All tests passed!');
}

main().catch(e => console.error('FAIL:', e.message));
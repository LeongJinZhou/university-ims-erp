const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const result = await prisma.$queryRawUnsafe('SELECT 1 as val');
  console.log('Result:', result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

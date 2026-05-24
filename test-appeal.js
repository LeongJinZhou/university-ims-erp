const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const http = require('http');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const student = await prisma.student.findFirst();
  const semester = await prisma.semester.findFirst();
  if (!student || !semester) {
    console.error('No student or semester found in DB.');
    return;
  }

  const postData = JSON.stringify({
    studentId: student.id,
    appealType: 'CREDIT_OVERLOAD',
    semesterId: semester.id,
    reason: 'Need to overload to graduate on time',
    supportingDocuments: [],
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/notifications/appeal',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      try {
        console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
      } catch (e) {
        console.log('Raw Response:', data);
      }
      prisma.$disconnect();
      pool.end();
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    prisma.$disconnect();
    pool.end();
  });

  req.write(postData);
  req.end();
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding faculties and departments...');

  // Faculty of Occupational Safety & Health (FOSH)
  const fosh = await prisma.faculty.create({
    data: { name: 'Faculty of Occupational Safety & Health', code: 'FOSH' },
  });

  // Faculty of Business & Management (FOBM)
  const fobm = await prisma.faculty.create({
    data: { name: 'Faculty of Business & Management', code: 'FOBM' },
  });

  // Faculty of Education (FOE)
  const foe = await prisma.faculty.create({
    data: { name: 'Faculty of Education', code: 'FOE' },
  });

  // Faculty of Information & Communication Technology (FICT)
  const fict = await prisma.faculty.create({
    data: { name: 'Faculty of Information & Communication Technology', code: 'FICT' },
  });

  // Faculty of Arts & Social Sciences (FASS)
  const fass = await prisma.faculty.create({
    data: { name: 'Faculty of Arts & Social Sciences', code: 'FASS' },
  });

  // Faculty of Science (FOS)
  const fos = await prisma.faculty.create({
    data: { name: 'Faculty of Science', code: 'FOS' },
  });

  console.log('Created 6 faculties');

  // Sample programmes per faculty
  const programmes = [
    { name: 'Bachelor of Occupational Safety & Health', code: 'BOSH', faculty: fosh, credits: 120, maxSem: 6 },
    { name: 'Bachelor of Business Administration', code: 'BBA', faculty: fobm, credits: 120, maxSem: 6 },
    { name: 'Bachelor of Education', code: 'BED', faculty: foe, credits: 120, maxSem: 6 },
    { name: 'Bachelor of Computer Science', code: 'BCS', faculty: fict, credits: 123, maxSem: 6 },
    { name: 'Bachelor of Information Technology', code: 'BIT', faculty: fict, credits: 121, maxSem: 6 },
    { name: 'Bachelor of Psychology', code: 'BPSY', faculty: fass, credits: 120, maxSem: 6 },
    { name: 'Bachelor of Biology', code: 'BBIO', faculty: fos, credits: 122, maxSem: 6 },
  ];

  for (const prog of programmes) {
    await prisma.programme.create({
      data: {
        name: prog.name,
        code: prog.code,
        facultyId: prog.faculty.id,
        calendarType: 'STANDARD',
        totalCredits: prog.credits,
        maxDurationSemesters: prog.maxSem,
      },
    });
  }

  console.log('Created 7 sample programmes');

  // Create sample courses for BCS
  const bcs = await prisma.programme.findUnique({ where: { code: 'BCS' } });
  if (bcs) {
    const courses = [
      { code: 'COMP101', name: 'Introduction to Programming', creditHours: 3 },
      { code: 'COMP102', name: 'Data Structures', creditHours: 3 },
      { code: 'COMP201', name: 'Database Systems', creditHours: 3 },
      { code: 'COMP202', name: 'Object Oriented Programming', creditHours: 3 },
      { code: 'MATH101', name: 'Calculus I', creditHours: 3 },
      { code: 'MATH102', name: 'Statistics', creditHours: 3 },
      { code: 'ENGL101', name: 'Academic Writing', creditHours: 2 },
    ];
    for (const course of courses) {
      await prisma.course.create({
        data: { ...course, programmeId: bcs.id, courseType: 'THEORY' },
      });
    }

    // Create programme version with semester plans
    const version = await prisma.programmeVersion.create({
      data: { programmeId: bcs.id, version: '2025-v1', effectiveFrom: new Date('2025-11-01') },
    });

    // Semester 1 plan
    const s1Plan = await prisma.mqaSemesterPlan.create({
      data: { programmeVersionId: version.id, semesterNumber: 1, totalCredits: 18 },
    });
    const s1Courses = await prisma.course.findMany({ where: { programmeId: bcs.id }, take: 7 });
    for (const course of s1Courses) {
      await prisma.mqaPlanCourse.create({
        data: { semesterPlanId: s1Plan.id, courseId: course.id, isElective: false },
      });
    }

    console.log('Created BCS programme version with Semester 1 plan');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding faculties and departments...');

  const fosh = await prisma.faculty.upsert({
    where: { code: 'FOSH' },
    update: { name: 'Faculty of Occupational Safety & Health' },
    create: { name: 'Faculty of Occupational Safety & Health', code: 'FOSH' },
  });

  const fobm = await prisma.faculty.upsert({
    where: { code: 'FOBM' },
    update: { name: 'Faculty of Business & Management' },
    create: { name: 'Faculty of Business & Management', code: 'FOBM' },
  });

  const foe = await prisma.faculty.upsert({
    where: { code: 'FOE' },
    update: { name: 'Faculty of Education' },
    create: { name: 'Faculty of Education', code: 'FOE' },
  });

  const fict = await prisma.faculty.upsert({
    where: { code: 'FICT' },
    update: { name: 'Faculty of Information & Communication Technology' },
    create: { name: 'Faculty of Information & Communication Technology', code: 'FICT' },
  });

  const fass = await prisma.faculty.upsert({
    where: { code: 'FASS' },
    update: { name: 'Faculty of Arts & Social Sciences' },
    create: { name: 'Faculty of Arts & Social Sciences', code: 'FASS' },
  });

  const fos = await prisma.faculty.upsert({
    where: { code: 'FOS' },
    update: { name: 'Faculty of Science' },
    create: { name: 'Faculty of Science', code: 'FOS' },
  });

  console.log('Created 6 faculties');

  // Create departments first (faculties can reference them later if needed)
  const departments = [
    { name: 'Department of Computer Science', code: 'DCS' },
    { name: 'Department of Information Technology', code: 'DIT' },
    { name: 'Department of Business Administration', code: 'DBA' },
    { name: 'Department of Accounting', code: 'DACCT' },
    { name: 'Department of Education', code: 'EDU' },
    { name: 'Department of Psychology', code: 'PSY' },
    { name: 'Department of Biology', code: 'BIO' },
    { name: 'Department of Chemistry', code: 'CHEM' },
    { name: 'Department of Mathematics', code: 'MATH' },
    { name: 'Department of Occupational Health', code: 'DOH' },
  ];

  for (const dept of departments) {
    await prisma.department.create({ data: dept });
  }
  console.log('Created 10 departments');

  const programmes = [
    { name: 'Bachelor of Occupational Safety & Health', code: 'BOSH', faculty: fosh, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Occupational Therapy', code: 'BOT', faculty: fosh, credits: 121, maxSem: 6, dept: null },
    { name: 'Bachelor of Business Administration', code: 'BBA', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Accounting', code: 'BAcc', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Finance', code: 'BFin', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Marketing', code: 'BMkt', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Human Resource Management', code: 'BHR', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Education', code: 'BED', faculty: foe, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Early Childhood Education', code: 'BECE', faculty: foe, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Teaching English as Second Language', code: 'BTESL', faculty: foe, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Computer Science', code: 'BCS', faculty: fict, credits: 123, maxSem: 6, dept: 'DCS' },
    { name: 'Bachelor of Information Technology', code: 'BIT', faculty: fict, credits: 121, maxSem: 6, dept: 'DIT' },
    { name: 'Bachelor of Software Engineering', code: 'BSE', faculty: fict, credits: 122, maxSem: 6, dept: 'DCS' },
    { name: 'Bachelor of Data Science', code: 'BDS', faculty: fict, credits: 122, maxSem: 6, dept: 'DCS' },
    { name: 'Bachelor of Cyber Security', code: 'BCSY', faculty: fict, credits: 121, maxSem: 6, dept: 'DIT' },
    { name: 'Bachelor of Network Engineering', code: 'BNE', faculty: fict, credits: 121, maxSem: 6, dept: 'DIT' },
    { name: 'Bachelor of Artificial Intelligence', code: 'BAI', faculty: fict, credits: 123, maxSem: 6, dept: 'DCS' },
    { name: 'Bachelor of Game Development', code: 'BGD', faculty: fict, credits: 120, maxSem: 6, dept: 'DIT' },
    { name: 'Bachelor of Information Systems', code: 'BIS', faculty: fict, credits: 120, maxSem: 6, dept: 'DCS' },
    { name: 'Bachelor of Psychology', code: 'BPSY', faculty: fass, credits: 120, maxSem: 6, dept: 'PSY' },
    { name: 'Bachelor of Sociology', code: 'BSOC', faculty: fass, credits: 120, maxSem: 6, dept: 'PSY' },
    { name: 'Bachelor of Communication Studies', code: 'BCS', faculty: fass, credits: 120, maxSem: 6, dept: 'PSY' },
    { name: 'Bachelor of International Relations', code: 'BIR', faculty: fass, credits: 120, maxSem: 6, dept: 'PSY' },
    { name: 'Bachelor of English Literature', code: 'BEL', faculty: fass, credits: 120, maxSem: 6, dept: 'PSY' },
    { name: 'Bachelor of Mass Communication', code: 'BMC', faculty: fass, credits: 120, maxSem: 6, dept: 'PSY' },
    { name: 'Bachelor of Biology', code: 'BBIO', faculty: fos, credits: 122, maxSem: 6, dept: 'BIO' },
    { name: 'Bachelor of Biotechnology', code: 'BBT', faculty: fos, credits: 122, maxSem: 6, dept: 'BIO' },
    { name: 'Bachelor of Chemistry', code: 'BCHEM', faculty: fos, credits: 121, maxSem: 6, dept: 'CHEM' },
    { name: 'Bachelor of Pharmaceutical Chemistry', code: 'BPC', faculty: fos, credits: 122, maxSem: 6, dept: 'CHEM' },
    { name: 'Bachelor of Mathematics', code: 'BMATH', faculty: fos, credits: 120, maxSem: 6, dept: 'MATH' },
    { name: 'Bachelor of Applied Mathematics', code: 'BAM', faculty: fos, credits: 121, maxSem: 6, dept: 'MATH' },
    { name: 'Bachelor of Statistics', code: 'BSTAT', faculty: fos, credits: 120, maxSem: 6, dept: 'MATH' },
    { name: 'Bachelor of Physics', code: 'BPHY', faculty: fos, credits: 121, maxSem: 6, dept: 'CHEM' },
    { name: 'Bachelor of Environmental Science', code: 'BENV', faculty: fos, credits: 120, maxSem: 6, dept: 'BIO' },
    { name: 'Bachelor of Food Science', code: 'BFS', faculty: fos, credits: 120, maxSem: 6, dept: 'BIO' },
    { name: 'Bachelor of Biomedical Science', code: 'BBMS', faculty: fos, credits: 122, maxSem: 6, dept: 'BIO' },
    { name: 'Bachelor of Medical Laboratory Science', code: 'BMLS', faculty: fos, credits: 121, maxSem: 6, dept: 'CHEM' },
    { name: 'Bachelor of Nursing', code: 'BNURS', faculty: fosh, credits: 123, maxSem: 6, dept: null },
    { name: 'Bachelor of Biomedical Engineering', code: 'BBE', faculty: fict, credits: 123, maxSem: 6, dept: 'DCS' },
    { name: 'Bachelor of Industrial Design', code: 'BID', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Tourism Management', code: 'BTM', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Hospitality Management', code: 'BHM', faculty: fobm, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Sports Science', code: 'BSS', faculty: fos, credits: 120, maxSem: 6, dept: 'BIO' },
    { name: 'Bachelor of Nutrition', code: 'BNUT', faculty: fos, credits: 120, maxSem: 6, dept: 'BIO' },
    { name: 'Bachelor of Public Health', code: 'BPH', faculty: fosh, credits: 120, maxSem: 6, dept: null },
    { name: 'Bachelor of Chinese Medicine', code: 'BCM', faculty: fosh, credits: 123, maxSem: 6, dept: null },
  ];

  for (const prog of programmes) {
    const deptCode = prog.dept;
    let deptId = null;
    if (deptCode) {
      const dept = await prisma.department.findUnique({ where: { code: deptCode } });
      deptId = dept?.id;
    }
    await prisma.programme.create({
      data: {
        name: prog.name,
        code: prog.code,
        facultyId: prog.faculty.id,
        departmentId: deptId,
        calendarType: 'STANDARD',
        totalCredits: prog.credits,
        maxDurationSemesters: prog.maxSem,
      },
    });
  }

  console.log(`Created ${programmes.length} programmes across 6 faculties`);

  const bcs = await prisma.programme.findUnique({ where: { code: 'BCS' } });
  if (bcs) {
    const courses = [
      { code: 'COMP101', name: 'Introduction to Programming', creditHours: 3 },
      { code: 'COMP102', name: 'Data Structures', creditHours: 3 },
      { code: 'COMP201', name: 'Database Systems', creditHours: 3 },
      { code: 'COMP202', name: 'Object Oriented Programming', creditHours: 3 },
      { code: 'COMP203', name: 'Web Development', creditHours: 3 },
      { code: 'COMP301', name: 'Software Engineering', creditHours: 3 },
      { code: 'COMP302', name: 'Mobile App Development', creditHours: 3 },
      { code: 'MATH101', name: 'Calculus I', creditHours: 3 },
      { code: 'MATH102', name: 'Statistics', creditHours: 3 },
      { code: 'ENGL101', name: 'Academic Writing', creditHours: 2 },
      { code: 'CSC201', name: 'Algorithm Analysis', creditHours: 3 },
      { code: 'CSC301', name: 'Operating Systems', creditHours: 3 },
      { code: 'CSC302', name: 'Computer Networks', creditHours: 3 },
      { code: 'CSC401', name: 'Machine Learning', creditHours: 3 },
      { code: 'CSC402', name: 'Capstone Project', creditHours: 4 },
    ];
    for (const course of courses) {
      await prisma.course.create({
        data: { ...course, programmeId: bcs.id, courseType: 'THEORY' },
      });
    }

    const version = await prisma.programmeVersion.create({
      data: { programmeId: bcs.id, version: '2025-v1', effectiveFrom: new Date('2025-11-01') },
    });

    const semesters = [
      { num: 1, credits: 18, courseCount: 6 },
      { num: 2, credits: 19, courseCount: 6 },
      { num: 3, credits: 17, courseCount: 6 },
      { num: 4, credits: 18, courseCount: 6 },
      { num: 5, credits: 19, courseCount: 6 },
      { num: 6, credits: 16, courseCount: 5 },
    ];

    for (const sem of semesters) {
      const plan = await prisma.mqaSemesterPlan.create({
        data: { programmeVersionId: version.id, semesterNumber: sem.num, totalCredits: sem.credits },
      });
      const allCourses = await prisma.course.findMany({ where: { programmeId: bcs.id } });
      for (let i = 0; i < sem.courseCount; i++) {
        if (allCourses[i]) {
          await prisma.mqaPlanCourse.create({
            data: { semesterPlanId: plan.id, courseId: allCourses[i].id, isElective: false },
          });
        }
      }
    }

    console.log('Created BCS programme version with 6 semester plans');
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
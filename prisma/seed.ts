import { PrismaClient, UserRole, CalendarType, SemesterType, AppealStatus, AppealType, GradeStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Cleaning existing database...');
  await prisma.fee.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.appeal.deleteMany({});
  await prisma.dropRequest.deleteMany({});
  await prisma.enrolment.deleteMany({});
  await prisma.examResult.deleteMany({});
  await prisma.plannedCourse.deleteMany({});
  await prisma.semesterPlan.deleteMany({});
  await prisma.academicPlan.deleteMany({});
  await prisma.student.deleteMany({});
  
  await prisma.timetableSlot.deleteMany({});
  await prisma.timetable.deleteMany({});
  await prisma.maintenanceBlock.deleteMany({});
  await prisma.roomBooking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.venue.deleteMany({});
  
  await prisma.courseOffering.deleteMany({});
  await prisma.semester.deleteMany({});
  await prisma.prerequisite.deleteMany({});
  await prisma.courseEquivalency.deleteMany({});
  await prisma.mqaPlanCourse.deleteMany({});
  await prisma.mqaSemesterPlan.deleteMany({});
  await prisma.programmeVersion.deleteMany({});
  
  await prisma.course.deleteMany({});
  await prisma.programme.deleteMany({});
  
  await prisma.lecturerAvailability.deleteMany({});
  await prisma.lecturer.deleteMany({});
  
  await prisma.department.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🌱 Starting DB Seeding...');

  // 1. Create Users
  console.log('Creating users for all roles...');
  const usersData = [
    { email: 'admin@university.edu.my', name: 'System Admin', role: UserRole.ADMIN },
    { email: 'hop.fict@university.edu.my', name: 'Dr. Head of ICT', role: UserRole.HEAD_OF_PROGRAMME },
    { email: 'pc.bcs@university.edu.my', name: 'Mr. PC Computer Science', role: UserRole.PROGRAMME_COORDINATOR },
    { email: 'lecturer1@university.edu.my', name: 'Prof. Alice Johnson', role: UserRole.LECTURER },
    { email: 'lecturer2@university.edu.my', name: 'Dr. Bob Smith', role: UserRole.LECTURER },
    { email: 'student1@university.edu.my', name: 'John Doe', role: UserRole.STUDENT },
    { email: 'exam@university.edu.my', name: 'Exam Division Officer', role: UserRole.EXAM_DIVISION },
    { email: 'finance@university.edu.my', name: 'Finance officer', role: UserRole.FINANCE },
    { email: 'hr@university.edu.my', name: 'HR Manager', role: UserRole.HR },
    { email: 'registry@university.edu.my', name: 'Registry Officer', role: UserRole.REGISTRY },
  ];

  const users: Record<string, any> = {};
  for (const u of usersData) {
    users[u.role] = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        password: 'hashedpassword123', // Dummy password
      },
    });
  }

  // 2. Create Faculties
  console.log('Creating 6 Faculties...');
  const faculties = {
    FOSH: await prisma.faculty.create({ data: { name: 'Faculty of Occupational Safety & Health', code: 'FOSH' } }),
    FOE: await prisma.faculty.create({ data: { name: 'Faculty of Education', code: 'FOE' } }),
    FOBC: await prisma.faculty.create({ data: { name: 'Faculty of Business & Communication', code: 'FOBC' } }),
    FOM: await prisma.faculty.create({ data: { name: 'Faculty of Medicine', code: 'FOM' } }),
    FOP: await prisma.faculty.create({ data: { name: 'Faculty of Pharmacy', code: 'FOP' } }),
    FOESS: await prisma.faculty.create({ data: { name: 'Faculty of Engineering, Science & Technology', code: 'FOESS' } }),
  };

  // 3. Create 50+ Programmes (including MBBS/Pharmacy on non-standard)
  console.log('Creating 50+ Programmes...');
  const seededProgrammes: any[] = [];
  
  // Standard Calendar Programmes
  for (let i = 1; i <= 8; i++) {
    seededProgrammes.push(await prisma.programme.create({
      data: { name: `BOSH Specialisation Program ${i}`, code: `BOSH-SP${i}`, facultyId: faculties.FOSH.id, calendarType: CalendarType.STANDARD, totalCredits: 120, maxDurationSemesters: 6 }
    }));
    seededProgrammes.push(await prisma.programme.create({
      data: { name: `Education Focus Program ${i}`, code: `BED-FP${i}`, facultyId: faculties.FOE.id, calendarType: CalendarType.STANDARD, totalCredits: 120, maxDurationSemesters: 6 }
    }));
    seededProgrammes.push(await prisma.programme.create({
      data: { name: `Business Management Program ${i}`, code: `BBA-MP${i}`, facultyId: faculties.FOBC.id, calendarType: CalendarType.STANDARD, totalCredits: 120, maxDurationSemesters: 6 }
    }));
    seededProgrammes.push(await prisma.programme.create({
      data: { name: `Engineering Elective Program ${i}`, code: `BENG-EP${i}`, facultyId: faculties.FOESS.id, calendarType: CalendarType.STANDARD, totalCredits: 130, maxDurationSemesters: 8 }
    }));
  }

  // Add BCS and BIT explicitly
  const bcsProg = await prisma.programme.create({
    data: { name: 'Bachelor of Computer Science', code: 'BCS', facultyId: faculties.FOESS.id, calendarType: CalendarType.STANDARD, totalCredits: 123, maxDurationSemesters: 6 }
  });
  seededProgrammes.push(bcsProg);

  const bitProg = await prisma.programme.create({
    data: { name: 'Bachelor of Information Technology', code: 'BIT', facultyId: faculties.FOESS.id, calendarType: CalendarType.STANDARD, totalCredits: 121, maxDurationSemesters: 6 }
  });
  seededProgrammes.push(bitProg);

  // Non-Standard Calendar Programmes (MBBS and Pharmacy)
  const mbbsProg = await prisma.programme.create({
    data: { name: 'Bachelor of Medicine, Bachelor of Surgery', code: 'MBBS', facultyId: faculties.FOM.id, calendarType: CalendarType.NON_STANDARD, totalCredits: 200, maxDurationSemesters: 10 }
  });
  seededProgrammes.push(mbbsProg);

  const pharmacyProg = await prisma.programme.create({
    data: { name: 'Bachelor of Pharmacy', code: 'BPHARM', facultyId: faculties.FOP.id, calendarType: CalendarType.NON_STANDARD, totalCredits: 140, maxDurationSemesters: 8 }
  });
  seededProgrammes.push(pharmacyProg);

  // Fill up to 50+ total programmes
  for (let i = 1; i <= 10; i++) {
    seededProgrammes.push(await prisma.programme.create({
      data: { name: `Science Research Program ${i}`, code: `BSC-RP${i}`, facultyId: faculties.FOESS.id, calendarType: CalendarType.STANDARD, totalCredits: 120, maxDurationSemesters: 6 }
    }));
  }
  console.log(`Seeded ${seededProgrammes.length} programmes total.`);

  // 4. Seed Semesters
  console.log('Creating semesters...');
  const sem1 = await prisma.semester.create({
    data: { label: '2025-S1', year: 2025, semesterNum: 1, semesterType: SemesterType.LONG, startDate: new Date('2025-11-01'), endDate: new Date('2026-04-15'), isActive: false }
  });
  const sem2 = await prisma.semester.create({
    data: { label: '2026-S1', year: 2026, semesterNum: 2, semesterType: SemesterType.LONG, startDate: new Date('2026-04-16'), endDate: new Date('2026-07-15'), isActive: true }
  });
  const sem3 = await prisma.semester.create({
    data: { label: '2026-S2', year: 2026, semesterNum: 3, semesterType: SemesterType.SHORT, startDate: new Date('2026-07-16'), endDate: new Date('2026-10-31'), isActive: false }
  });

  // 5. Seed Courses & Prerequisites
  console.log('Creating courses...');
  const comp101 = await prisma.course.create({
    data: { code: 'COMP101', name: 'Intro to Programming', creditHours: 3, courseType: 'THEORY', programmeId: bcsProg.id }
  });
  const comp102 = await prisma.course.create({
    data: { code: 'COMP102', name: 'Data Structures', creditHours: 3, courseType: 'THEORY', programmeId: bcsProg.id }
  });
  const comp201 = await prisma.course.create({
    data: { code: 'COMP201', name: 'Advanced Algorithms', creditHours: 4, courseType: 'THEORY', programmeId: bcsProg.id }
  });
  const bit102 = await prisma.course.create({
    data: { code: 'BIT102', name: 'Information Data Structures', creditHours: 3, courseType: 'THEORY', programmeId: bitProg.id }
  });

  // Prerequisite link: COMP102 requires COMP101
  await prisma.prerequisite.create({
    data: { courseId: comp102.id, prerequisiteCourseId: comp101.id, isMandatory: true }
  });
  // COMP201 requires COMP102
  await prisma.prerequisite.create({
    data: { courseId: comp201.id, prerequisiteCourseId: comp102.id, isMandatory: true }
  });

  // Course Equivalency (BCS COMP102 is equivalent to BIT BIT102 for merging purposes)
  await prisma.courseEquivalency.create({
    data: { courseAId: comp102.id, courseBId: bit102.id, isDeliveryMerge: true }
  });

  // 6. Seed Lecturers & Availability
  console.log('Creating lecturers...');
  const lecturer1 = await prisma.lecturer.create({
    data: { userId: users[UserRole.LECTURER].id, staffId: 'L-1001', facultyId: faculties.FOESS.id, contractType: 'FULL_TIME', maxTeachingLoad: 12 }
  });

  await prisma.lecturerAvailability.create({
    data: { lecturerId: lecturer1.id, semesterId: sem2.id, availableDays: [1, 2, 3, 4], preferredStartTime: '09:00', preferredEndTime: '17:00', maxConsecutiveHours: 3 }
  });

  // 7. Seed Course Offerings
  console.log('Creating course offerings...');
  const offering1 = await prisma.courseOffering.create({
    data: { courseId: comp101.id, semesterId: sem2.id, lecturerId: lecturer1.id, maxCapacity: 40, currentEnrolment: 10, isConfirmed: true }
  });
  const offering2 = await prisma.courseOffering.create({
    data: { courseId: comp102.id, semesterId: sem2.id, lecturerId: lecturer1.id, maxCapacity: 30, currentEnrolment: 0, isConfirmed: true }
  });

  // Seed Sections
  const sec1 = await prisma.section.create({
    data: { courseOfferingId: offering1.id, sectionCode: 'L1', combinedHeadcount: 10 }
  });
  const sec2 = await prisma.section.create({
    data: { courseOfferingId: offering2.id, sectionCode: 'L1', combinedHeadcount: 0 }
  });

  // 8. Seed Venues
  console.log('Creating venues & rooms...');
  const blockA = await prisma.venue.create({
    data: { name: 'Block A Main Campus', building: 'Block A', floor: 1 }
  });
  const room101 = await prisma.room.create({
    data: { name: 'DK101 Lecture Hall', code: 'DK101', capacity: 50, venueId: blockA.id }
  });

  const tt = await prisma.timetable.create({
    data: { semesterId: sem2.id, approvalState: 'DRAFT', solverScore: 0.95 }
  });

  // Timetable slots
  await prisma.timetableSlot.create({
    data: {
      timetableId: tt.id,
      courseOfferingId: offering1.id,
      sectionId: sec1.id,
      venueId: room101.id,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
    }
  });

  // 9. Seed Student & Academic Records
  console.log('Creating student profiles...');
  const student = await prisma.student.create({
    data: {
      userId: users[UserRole.STUDENT].id,
      studentId: 'QIU20250001',
      programmeId: bcsProg.id,
      programmeVersionId: (await prisma.programmeVersion.create({
        data: { programmeId: bcsProg.id, version: 'BCS-2025-v1', effectiveFrom: new Date('2025-11-01') }
      })).id,
      intakePeriod: 'OCTOBER',
      intakeYear: 2025,
      intakeAnchor: '202510',
      currentSemester: 2,
      cumulativeGpa: 3.4,
      totalCreditsEarned: 18,
    },
  });

  // Create academic plan
  const plan = await prisma.academicPlan.create({
    data: { studentId: student.id, originalGraduation: '2028-S2', projectedGraduation: '2028-S2' }
  });

  const semPlan1 = await prisma.semesterPlan.create({
    data: { academicPlanId: plan.id, semesterNumber: 1, calendarSemester: '2025-S1', totalCredits: 18 }
  });
  const semPlan2 = await prisma.semesterPlan.create({
    data: { academicPlanId: plan.id, semesterNumber: 2, calendarSemester: '2026-S1', totalCredits: 15 }
  });

  // Planned courses
  await prisma.plannedCourse.create({
    data: { semesterPlanId: semPlan1.id, courseId: comp101.id, courseCode: comp101.code, creditHours: comp101.creditHours, gradeStatus: 'PASS' }
  });
  await prisma.plannedCourse.create({
    data: { semesterPlanId: semPlan2.id, courseId: comp102.id, courseCode: comp102.code, creditHours: comp102.creditHours }
  });

  // Exam result (pass result for sem 1)
  await prisma.examResult.create({
    data: { studentId: student.id, courseOfferingId: offering1.id, courseId: comp101.id, grade: 'B+', gradePoint: 3.3, gradeStatus: GradeStatus.PASS, releasedBy: users[UserRole.EXAM_DIVISION].id }
  });

  // 10. Seed Fee Structure
  console.log('Creating fees and invoice configurations...');
  await prisma.feeStructure.create({
    data: { programmeId: bcsProg.id, feeType: 'TUITION', amount: 350.0, academicYear: 2025, currency: 'MYR' }
  });
  await prisma.feeStructure.create({
    data: { programmeId: bcsProg.id, feeType: 'RETAKE', amount: 500.0, academicYear: 2025, currency: 'MYR' }
  });
  await prisma.feeStructure.create({
    data: { programmeId: bcsProg.id, feeType: 'OVERLOAD', amount: 1000.0, academicYear: 2025, currency: 'MYR' }
  });

  console.log('✅ Seeding complete! Database is fully set up with comprehensive mock data.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

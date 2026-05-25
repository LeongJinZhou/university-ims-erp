export interface Student {
  id: string
  studentId: string
  currentSemester: number
  totalCreditsEarned: number
  cumulativeGpa: number
  planStatus: string
  projectedGraduation?: string
  academicPlan?: AcademicPlan
  programme?: Programme
  examResults?: ExamResult[]
  retakeBacklog?: RetakeBacklog[]
  enrolments?: Enrolment[]
  atRiskFlags?: AtRiskFlag[]
}

export interface AcademicPlan {
  id: string
  studentId: string
  planStatus: string
  originalGraduation: string
  projectedGraduation: string
  hasExtension: boolean
  semesters: SemesterPlan[]
}

export interface SemesterPlan {
  id: string
  semesterNumber: number
  calendarSemester: string
  totalCredits: number
  isExtension: boolean
  plannedCourses: PlannedCourse[]
}

export interface PlannedCourse {
  id: string
  courseId: string
  courseCode: string
  creditHours: number
  isRetake: boolean
  isDeferred: boolean
  semesterPlanId: string
}

export interface Programme {
  id: string
  name: string
  code: string
  totalCredits: number
  maxDurationSemesters: number
}

export interface ExamResult {
  id: string
  courseId: string
  grade: string
  gradePoint: number
  gradeStatus: 'PASS' | 'FAIL' | 'INCOMPLETE' | 'WITHDRAWN'
  marks?: number
  releasedAt: string
}

export interface Enrolment {
  id: string
  courseOffering: {
    course: {
      creditHours: number
    }
  }
}

export interface RetakeBacklog {
  id: string
  courseId: string
  courseCode: string
  creditHours: number
  failedSemester: string
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'EXEMPTED'
  scheduledSemester?: string
}

export interface AtRiskFlag {
  type: 'LOW_CREDITS' | 'HIGH_DROP_RATE' | 'GPA_DECLINE' | 'EXTENSION_RISK' | 'EXCEEDS_MAX_CREDITS'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  message: string
}

export interface GraduationCompleteness {
  studentId: string
  programme: string
  totalRequiredCredits: number
  earnedCredits: number
  remainingCredits: number
  failedCoursesCount: number
  retakeScheduledCount: number
  missingCoursesCount: number
  isGraduationReady: boolean
  checklist: {
    allRequiredCoursesCompleted: boolean
    noPendingRetakes: boolean
    creditsSatisfied: boolean
    gpaMet: boolean
    noExtensionRequired: boolean
  }
}
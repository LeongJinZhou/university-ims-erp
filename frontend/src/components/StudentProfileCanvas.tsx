import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { GraduationCap, BookOpen, Award, AlertTriangle } from 'lucide-react'
import type { Student, SemesterPlan, PlannedCourse, AtRiskFlag } from '../lib/types'

interface StudentProfileCanvasProps {
  student?: Student
  isLoading?: boolean
  onRefresh?: () => void
}

export function StudentProfileCanvas({ student, isLoading = false, onRefresh }: StudentProfileCanvasProps) {
  if (isLoading) {
    return <StudentProfileSkeleton />
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No student data available</p>
        </CardContent>
      </Card>
    )
  }

  const completedCredits = student.totalCreditsEarned || 0
  const requiredCredits = 120
  const progressPercent = Math.min((completedCredits / requiredCredits) * 100, 100)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Student ID</p>
              <p className="text-lg font-semibold">{student.studentId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Programme</p>
              <p className="text-lg font-semibold">{student.programme?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
              <p className="text-lg font-semibold">Semester {student.currentSemester}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cumulative GPA</p>
              <p className="text-lg font-semibold">{student.cumulativeGpa?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress to Graduation</span>
              <span className="text-sm text-muted-foreground">
                {completedCredits} / {requiredCredits} credits
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <StudyPlanView student={student} />

      {student.atRiskFlags && student.atRiskFlags.length > 0 && (
        <AtRiskAlerts flags={student.atRiskFlags} />
      )}
    </div>
  )
}

function StudyPlanView({ student }: { student: Student }) {
  if (!student.academicPlan) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Academic Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {student.academicPlan.semesters.map((semester) => (
            <SemesterPlanView key={semester.id} semester={semester} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SemesterPlanView({ semester }: { semester: SemesterPlan }) {
  const creditLimit = semester.totalCredits > 20 ? 20 : semester.calendarSemester.includes('S3') ? 10 : 20

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">
          Semester {semester.semesterNumber} - {semester.calendarSemester}
          {semester.isExtension && <Badge variant="secondary" className="ml-2">Extension</Badge>}
        </h4>
        <span className="text-sm text-muted-foreground">
          {semester.totalCredits} / {creditLimit} credits
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {semester.plannedCourses.map((course) => (
          <div key={course.id} className="flex items-center gap-2 text-sm">
            {course.isRetake && <Badge variant="outline" className="text-xs">Retake</Badge>}
            {course.isDeferred && <Badge variant="outline" className="text-xs">Deferred</Badge>}
            <span className="font-mono">{course.courseCode}</span>
            <span className="text-muted-foreground">{course.creditHours} cr</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AtRiskAlerts({ flags }: { flags: AtRiskFlag[] }) {
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          At-Risk Flags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {flags.map((flag, i) => (
            <div key={i} className="flex items-center gap-2">
              <Badge
                variant={flag.severity === 'HIGH' ? 'destructive' : flag.severity === 'MEDIUM' ? 'default' : 'secondary'}
              >
                {flag.severity}
              </Badge>
              <span className="text-sm">{flag.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StudentProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>
  )
}
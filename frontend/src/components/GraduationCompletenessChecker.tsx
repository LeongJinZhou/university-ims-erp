import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { CheckCircle2, XCircle, AlertCircle, GraduationCap } from 'lucide-react'
import type { GraduationCompleteness } from '../lib/types'

interface GraduationCompletenessCheckerProps {
  data?: GraduationCompleteness
  isLoading?: boolean
}

export function GraduationCompletenessChecker({ data, isLoading = false }: GraduationCompletenessCheckerProps) {
  if (isLoading) {
    return <GraduationCheckerSkeleton />
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No graduation data available</p>
        </CardContent>
      </Card>
    )
  }

  const checklistItems = [
    { key: 'allRequiredCoursesCompleted', label: 'All required courses completed', critical: true },
    { key: 'noPendingRetakes', label: 'No pending retakes', critical: true },
    { key: 'creditsSatisfied', label: 'Credit requirements met', critical: true },
    { key: 'gpaMet', label: 'Minimum GPA achieved (2.0)', critical: true },
    { key: 'noExtensionRequired', label: 'No extension semester required', critical: false },
  ] as const

  const passedCount = checklistItems.filter((item) => data.checklist[item.key]).length
  const progress = (passedCount / checklistItems.length) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Graduation Completeness Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="text-center">
              <Badge
                variant={data.isGraduationReady ? 'default' : 'destructive'}
                className="text-sm px-4 py-1"
              >
                {data.isGraduationReady ? 'Ready for Graduation' : 'Not Yet Eligible'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Credit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold">{data.earnedCredits}</p>
              <p className="text-sm text-muted-foreground">Credits Earned</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold">{data.remainingCredits}</p>
              <p className="text-sm text-muted-foreground">Credits Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Graduation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklistItems.map((item) => {
              const passed = data.checklist[item.key]
              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    passed ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  {passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.critical && !passed && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {(data.failedCoursesCount > 0 || data.retakeScheduledCount > 0 || data.missingCoursesCount > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {data.failedCoursesCount > 0 && (
                <p>
                  <span className="font-medium">{data.failedCoursesCount}</span> course(s) failed
                </p>
              )}
              {data.retakeScheduledCount > 0 && (
                <p>
                  <span className="font-medium">{data.retakeScheduledCount}</span> course(s) scheduled for retake
                </p>
              )}
              {data.missingCoursesCount > 0 && (
                <p>
                  <span className="font-medium">{data.missingCoursesCount}</span> required course(s) not yet taken
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GraduationCheckerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
          <div className="h-16 w-full bg-slate-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}
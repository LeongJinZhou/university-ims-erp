import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { enrolmentApi } from '../../lib/api'

const enrolmentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  courseId: z.string().min(1, 'Course is required'),
  semesterId: z.string().min(1, 'Semester is required'),
})

type EnrolmentForm = z.infer<typeof enrolmentSchema>

type Enrolment = {
  id: string
  student: string
  course: string
  semester: string
  status: string
}

export function EnrolmentDashboard() {
  const { data: enrolments, isLoading, error } = useQuery({
    queryKey: ['enrolments'],
    queryFn: async () => {
      const { data } = await enrolmentApi.getAll()
      return data
    },
  })

  const { handleSubmit, reset, setValue } = useForm<EnrolmentForm>({
    resolver: zodResolver(enrolmentSchema),
  })

  const onSubmit = (data: EnrolmentForm) => {
    console.log('Creating enrolment:', data)
    reset()
  }

  if (isLoading) return <EnrolmentSkeleton />
  if (error) return <div className="p-6 text-red-600">Error loading enrolments</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Enrolment & Registration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Student course registration with credit validation</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Register Student</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add student to course for semester</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('studentId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Student" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="U2025001">U2025001</SelectItem>
                    <SelectItem value="U2025002">U2025002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('courseId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Course" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS101">CS101</SelectItem>
                    <SelectItem value="CS201">CS201</SelectItem>
                    <SelectItem value="MATH101">MATH101</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('semesterId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Semester" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S1-2025">Semester 1 2025</SelectItem>
                    <SelectItem value="S2-2025">Semester 2 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Enrol Student</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Enrolment List</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {enrolments?.length || 0} enrolments</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold">Course</TableHead>
                <TableHead className="font-semibold">Semester</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolments?.map((e: Enrolment) => (
                <TableRow key={e.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{e.student}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{e.course}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{e.semester}</TableCell>
                  <TableCell><Badge variant={e.status === 'ENROLLED' ? 'default' : 'secondary'} className="text-xs">{e.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function EnrolmentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
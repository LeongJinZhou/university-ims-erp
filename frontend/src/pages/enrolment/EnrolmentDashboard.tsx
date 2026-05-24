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

const enrolmentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  courseId: z.string().min(1, 'Course is required'),
  semesterId: z.string().min(1, 'Semester is required'),
})

type EnrolmentForm = z.infer<typeof enrolmentSchema>

const mockEnrolments = [
  { id: '1', student: 'U2025001', course: 'CS101', semester: 'S1-2025', status: 'ENROLLED' },
  { id: '2', student: 'U2025001', course: 'MATH101', semester: 'S1-2025', status: 'ENROLLED' },
  { id: '3', student: 'U2025002', course: 'CS101', semester: 'S1-2025', status: 'PENDING' },
]

export function EnrolmentDashboard() {
  const { data: enrolments, isLoading, error } = useQuery({
    queryKey: ['enrolments'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockEnrolments
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
  if (error) return <div>Error loading enrolments</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enrolment & Registration</h1>
        <p className="text-muted-foreground">Student course registration with credit validation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register Student</CardTitle>
          <CardDescription>Add student to course for semester</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Select onValueChange={(v) => setValue('studentId', v)}>
                <SelectTrigger><SelectValue placeholder="Student" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="U2025001">U2025001</SelectItem>
                  <SelectItem value="U2025002">U2025002</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={(v) => setValue('courseId', v)}>
                <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS101">CS101</SelectItem>
                  <SelectItem value="CS201">CS201</SelectItem>
                  <SelectItem value="MATH101">MATH101</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={(v) => setValue('semesterId', v)}>
                <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S1-2025">Semester 1 2025</SelectItem>
                  <SelectItem value="S2-2025">Semester 2 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Enrol Student</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrolment List</CardTitle>
          <CardDescription>Total: {enrolments?.length || 0} enrolments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolments?.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.student}</TableCell>
                  <TableCell>{e.course}</TableCell>
                  <TableCell>{e.semester}</TableCell>
                  <TableCell><Badge variant={e.status === 'ENROLLED' ? 'default' : 'secondary'}>{e.status}</Badge></TableCell>
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
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
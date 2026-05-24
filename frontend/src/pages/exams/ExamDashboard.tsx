import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const examSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  date: z.string(),
  duration: z.number().min(1),
  venueId: z.string().min(1, 'Venue is required'),
})

type ExamForm = z.infer<typeof examSchema>

const mockExams = [
  { id: '1', course: 'CS101', date: '2025-01-15', duration: 180, venue: 'LT101', status: 'SCHEDULED' },
  { id: '2', course: 'CS201', date: '2025-01-16', duration: 180, venue: 'LT102', status: 'SCHEDULED' },
  { id: '3', course: 'MATH101', date: '2025-01-17', duration: 120, venue: 'LT101', status: 'COMPLETED' },
]

export function ExamDashboard() {
  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockExams
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
  })

  const onSubmit = (data: ExamForm) => {
    console.log('Creating exam:', data)
    reset()
  }

  if (isLoading) return <ExamSkeleton />
  if (error) return <div>Error loading exams</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exam & Results</h1>
        <p className="text-muted-foreground">Exam scheduling and grade management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Exam</CardTitle>
          <CardDescription>Create new exam slot</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Input type="date" {...register('date')} />
            </div>
            <div>
              <Input type="number" placeholder="Duration (min)" {...register('duration', { valueAsNumber: true })} />
            </div>
            <div>
              <Select onValueChange={(v) => setValue('venueId', v)}>
                <SelectTrigger><SelectValue placeholder="Venue" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LT101">LT101</SelectItem>
                  <SelectItem value="LT102">LT102</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Schedule Exam</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exam Schedule</CardTitle>
          <CardDescription>Total: {exams?.length || 0} exams</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams?.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{e.course}</TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.duration} min</TableCell>
                  <TableCell>{e.venue}</TableCell>
                  <TableCell><Badge variant={e.status === 'COMPLETED' ? 'secondary' : 'default'}>{e.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ExamSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
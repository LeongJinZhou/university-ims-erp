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
import { examApi } from '../../lib/api'

const examSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  date: z.string(),
  duration: z.number().min(1),
  venueId: z.string().min(1, 'Venue is required'),
})

type ExamForm = z.infer<typeof examSchema>

type Exam = {
  id: string
  course: string
  date: string
  duration: number
  venue: string
  status: string
}

export function ExamDashboard() {
  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data } = await examApi.getAll()
      return data
    },
  })

  const { register, handleSubmit, reset, setValue } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
  })

  const onSubmit = (data: ExamForm) => {
    console.log('Creating exam:', data)
    reset()
  }

  if (isLoading) return <ExamSkeleton />
  if (error) return <div className="p-6 text-red-600">Error loading exams</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Exam & Results</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Exam scheduling and grade management</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Schedule Exam</CardTitle>
          <CardDescription className="text-sm text-slate-500">Create new exam slot</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Input type="date" className="h-10" {...register('date')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Duration (min)" className="h-10" {...register('duration', { valueAsNumber: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('venueId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Venue" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LT101">LT101</SelectItem>
                    <SelectItem value="LT102">LT102</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Schedule Exam</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Exam Schedule</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {exams?.length || 0} exams</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Course</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Venue</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams?.map((e: Exam) => (
                <TableRow key={e.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="text-slate-900 dark:text-slate-100">{e.course}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{e.date}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{e.duration} min</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{e.venue}</TableCell>
                  <TableCell><Badge variant={e.status === 'COMPLETED' ? 'secondary' : 'default'} className="text-xs">{e.status}</Badge></TableCell>
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
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
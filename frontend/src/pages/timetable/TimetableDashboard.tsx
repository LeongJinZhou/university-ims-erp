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
import { courseApi } from '../../lib/api'

const slotSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  venueId: z.string().min(1, 'Venue is required'),
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  lecturerId: z.string(),
})

type SlotForm = z.infer<typeof slotSchema>

type Slot = {
  id: string
  course: string
  venue: string
  day: string
  start: string
  end: string
  lecturer: string
}

const timetableApi = {
  getAll: () => request('/timetable/slots'),
  create: (data: any) => post('/timetable/slots', data),
}

export function TimetableDashboard() {
  const { data: slots, isLoading, error } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const { data } = await timetableApi.getAll()
      return data?.map((s: any) => ({
        id: s.id,
        course: s.courseOffering?.course?.code || '',
        venue: s.venue?.code || '',
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][s.dayOfWeek] || '',
        start: s.startTime || '',
        end: s.endTime || '',
        lecturer: s.courseOffering?.lecturer?.user?.name || '',
      })) || []
    },
  })

  const { register, handleSubmit, reset, setValue } = useForm<SlotForm>({
    resolver: zodResolver(slotSchema),
  })

  const onSubmit = (data: SlotForm) => {
    console.log('Creating slot:', data)
    reset()
  }

  if (isLoading) return <TimetableSkeleton />
  if (error) return <div className="p-6 text-red-600">Error loading timetable</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Timetable Generator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Interactive timetable grid with conflict detection</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Create Timeslot</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add course to timetable with venue and lecturer</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                <Select onValueChange={(v) => setValue('venueId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Venue" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAB101">LAB101</SelectItem>
                    <SelectItem value="LAB201">LAB201</SelectItem>
                    <SelectItem value="LT101">LT101</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('dayOfWeek', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Day" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MON">Monday</SelectItem>
                    <SelectItem value="TUE">Tuesday</SelectItem>
                    <SelectItem value="WED">Wednesday</SelectItem>
                    <SelectItem value="THU">Thursday</SelectItem>
                    <SelectItem value="FRI">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="time" className="h-10" {...register('startTime')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="time" className="h-10" {...register('endTime')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('lecturerId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Lecturer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRSMITH">Dr. Smith</SelectItem>
                    <SelectItem value="DRJONES">Dr. Jones</SelectItem>
                    <SelectItem value="DRLEE">Dr. Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Add Timeslot</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Timetable Grid</CardTitle>
          <CardDescription className="text-sm text-slate-500">Drag-and-drop scheduling interface</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="font-semibold">Day</TableHead>
                  <TableHead className="font-semibold">Course</TableHead>
                  <TableHead className="font-semibold">Venue</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold">Lecturer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots?.map((s: Slot) => (
                  <TableRow key={s.id} className="border-slate-200 dark:border-slate-800">
                    <TableCell><Badge variant="outline" className="text-xs">{s.day}</Badge></TableCell>
                    <TableCell className="text-slate-900 dark:text-slate-100">{s.course}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{s.venue}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{s.start} - {s.end}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{s.lecturer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TimetableSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
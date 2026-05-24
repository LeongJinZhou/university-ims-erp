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

const slotSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  venueId: z.string().min(1, 'Venue is required'),
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  lecturerId: z.string(),
})

type SlotForm = z.infer<typeof slotSchema>

const mockSlots = [
  { id: '1', course: 'CS101', venue: 'LAB101', day: 'MON', start: '08:00', end: '10:00', lecturer: 'Dr. Smith' },
  { id: '2', course: 'CS201', venue: 'LAB201', day: 'TUE', start: '10:00', end: '12:00', lecturer: 'Dr. Jones' },
  { id: '3', course: 'MATH101', venue: 'LT101', day: 'WED', start: '14:00', end: '16:00', lecturer: 'Dr. Lee' },
]

export function TimetableDashboard() {
  const { data: slots, isLoading, error } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockSlots
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<SlotForm>({
    resolver: zodResolver(slotSchema),
  })

  const onSubmit = (data: SlotForm) => {
    console.log('Creating slot:', data)
    reset()
  }

  if (isLoading) return <TimetableSkeleton />
  if (error) return <div>Error loading timetable</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timetable Generator</h1>
        <p className="text-muted-foreground">Interactive timetable grid with conflict detection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Timeslot</CardTitle>
          <CardDescription>Add course to timetable with venue and lecturer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
              <Select onValueChange={(v) => setValue('venueId', v)}>
                <SelectTrigger><SelectValue placeholder="Venue" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAB101">LAB101</SelectItem>
                  <SelectItem value="LAB201">LAB201</SelectItem>
                  <SelectItem value="LT101">LT101</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={(v) => setValue('dayOfWeek', v)}>
                <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MON">Monday</SelectItem>
                  <SelectItem value="TUE">Tuesday</SelectItem>
                  <SelectItem value="WED">Wednesday</SelectItem>
                  <SelectItem value="THU">Thursday</SelectItem>
                  <SelectItem value="FRI">Friday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input type="time" {...register('startTime')} />
            </div>
            <div>
              <Input type="time" {...register('endTime')} />
            </div>
            <div>
              <Select onValueChange={(v) => setValue('lecturerId', v)}>
                <SelectTrigger><SelectValue placeholder="Lecturer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRSMITH">Dr. Smith</SelectItem>
                  <SelectItem value="DRJONES">Dr. Jones</SelectItem>
                  <SelectItem value="DRLEE">Dr. Lee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-3 lg:col-span-6">Add Timeslot</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Grid</CardTitle>
          <CardDescription>Drag-and-drop scheduling interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Lecturer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots?.map(s => (
                  <TableRow key={s.id}>
                    <TableCell><Badge variant="outline">{s.day}</Badge></TableCell>
                    <TableCell>{s.course}</TableCell>
                    <TableCell>{s.venue}</TableCell>
                    <TableCell>{s.start} - {s.end}</TableCell>
                    <TableCell>{s.lecturer}</TableCell>
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
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
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
import { studentApi } from '../../lib/api'

const studentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Name is required'),
  programmeId: z.string().min(1, 'Programme is required'),
  intakePeriod: z.string(),
  intakeYear: z.number(),
})

type StudentForm = z.infer<typeof studentSchema>

type Student = {
  id: string
  studentId: string
  name: string
  programme: string
  credits: number
  gpa: number
  status: string
  semester: number
}

export function StudentDashboard() {
  const { data: students, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await studentApi.getAll()
      return data
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  })

  const onSubmit = (data: StudentForm) => {
    console.log('Creating student:', data)
    reset()
  }

  if (isLoading) return <StudentSkeleton />
  if (error) return <div>Error loading students</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Academic Profiles</h1>
        <p className="text-muted-foreground">Early at-risk detection based on GPA and credit patterns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register New Student</CardTitle>
          <CardDescription>Add student to academic tracking system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input placeholder="Student ID" {...register('studentId')} />
              {errors.studentId && <p className="text-sm text-red-500">{errors.studentId.message}</p>}
            </div>
            <div>
              <Input placeholder="Full Name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Input placeholder="Programme ID" {...register('programmeId')} />
              {errors.programmeId && <p className="text-sm text-red-500">{errors.programmeId.message}</p>}
            </div>
            <div>
              <Select onValueChange={(v) => setValue('intakePeriod', v)}>
                <SelectTrigger><SelectValue placeholder="Intake Period" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="APRIL">April</SelectItem>
                  <SelectItem value="JULY">July</SelectItem>
                  <SelectItem value="OCTOBER">October</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input type="number" placeholder="Intake Year" {...register('intakeYear', { valueAsNumber: true })} />
              {errors.intakeYear && <p className="text-sm text-red-500">{errors.intakeYear.message}</p>}
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Register Student</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Total: {students?.length || 0} students • At-risk: {students?.filter(s => s.status !== 'ON_TRACK').length || 0}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Semester</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.studentId}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.programme}</TableCell>
                  <TableCell>{s.credits}</TableCell>
                  <TableCell>{s.gpa.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={s.status === 'ON_TRACK' ? 'default' : 'destructive'}>{s.status.replace('_', ' ')}</Badge></TableCell>
                  <TableCell>{s.semester}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
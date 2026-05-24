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
  if (error) return <div className="p-6 text-red-600">Error loading students</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Student Academic Profiles</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Early at-risk detection based on GPA and credit patterns</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Register New Student</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add student to academic tracking system</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Student ID" className="h-10" {...register('studentId')} />
                {errors.studentId && <p className="text-xs text-red-600">{errors.studentId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Full Name" className="h-10" {...register('name')} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Programme ID" className="h-10" {...register('programmeId')} />
                {errors.programmeId && <p className="text-xs text-red-600">{errors.programmeId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('intakePeriod', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Intake Period" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APRIL">April</SelectItem>
                    <SelectItem value="JULY">July</SelectItem>
                    <SelectItem value="OCTOBER">October</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Intake Year" className="h-10" {...register('intakeYear', { valueAsNumber: true })} />
                {errors.intakeYear && <p className="text-xs text-red-600">{errors.intakeYear.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Register Student</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Student List</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {students?.length || 0} students • At-risk: {students?.filter((s: Student) => s.status !== 'ON_TRACK').length || 0}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Student ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Programme</TableHead>
                <TableHead className="font-semibold">Credits</TableHead>
                <TableHead className="font-semibold">GPA</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Semester</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((s: Student) => (
                <TableRow key={s.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{s.studentId}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{s.name}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{s.programme}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{s.credits}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{s.gpa.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'ON_TRACK' ? 'default' : 'destructive'} className="text-xs">
                      {s.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{s.semester}</TableCell>
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
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
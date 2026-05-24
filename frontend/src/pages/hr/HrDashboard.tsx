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

const lecturerSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  name: z.string().min(1, 'Name is required'),
  departmentId: z.string().min(1, 'Department is required'),
  position: z.string(),
})

type LecturerForm = z.infer<typeof lecturerSchema>

const mockLecturers = [
  { id: '1', staffId: 'STF001', name: 'Dr. Smith', department: 'FOE', position: 'Senior Lecturer', status: 'ACTIVE' },
  { id: '2', staffId: 'STF002', name: 'Dr. Jones', department: 'FOE', position: 'Lecturer', status: 'ACTIVE' },
  { id: '3', staffId: 'STF003', name: 'Dr. Lee', department: 'FOE', position: 'Associate Professor', status: 'ON_LEAVE' },
]

export function HrDashboard() {
  const { data: lecturers, isLoading, error } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockLecturers
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<LecturerForm>({
    resolver: zodResolver(lecturerSchema),
  })

  const onSubmit = (data: LecturerForm) => {
    console.log('Creating lecturer:', data)
    reset()
  }

  if (isLoading) return <HrSkeleton />
  if (error) return <div>Error loading lecturers</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HR & Lecturer Management</h1>
        <p className="text-muted-foreground">Staff profiles and workload allocation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register Lecturer</CardTitle>
          <CardDescription>Add new academic staff</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input placeholder="Staff ID" {...register('staffId')} />
              {errors.staffId && <p className="text-sm text-red-500">{errors.staffId.message}</p>}
            </div>
            <div>
              <Input placeholder="Full Name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Select onValueChange={(v) => setValue('departmentId', v)}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOE">Faculty of Engineering</SelectItem>
                  <SelectItem value="FOBM">Faculty of Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={(v) => setValue('position', v)}>
                <SelectTrigger><SelectValue placeholder="Position" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LECTURER">Lecturer</SelectItem>
                  <SelectItem value="SENIOR_LECTURER">Senior Lecturer</SelectItem>
                  <SelectItem value="ASSOC_PROFESSOR">Associate Professor</SelectItem>
                  <SelectItem value="PROFESSOR">Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Add Lecturer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lecturer Directory</CardTitle>
          <CardDescription>Total: {lecturers?.length || 0} staff</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers?.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.staffId}</TableCell>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>{l.department}</TableCell>
                  <TableCell>{l.position}</TableCell>
                  <TableCell><Badge variant={l.status === 'ACTIVE' ? 'default' : 'secondary'}>{l.status.replace('_', ' ')}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function HrSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
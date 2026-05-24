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
import { hrApi } from '../../lib/api'

const lecturerSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  name: z.string().min(1, 'Name is required'),
  departmentId: z.string().min(1, 'Department is required'),
  position: z.string(),
})

type LecturerForm = z.infer<typeof lecturerSchema>

type Lecturer = {
  id: string
  staffId: string
  name: string
  department: string
  position: string
  status: string
}

export function HrDashboard() {
  const { data: lecturers, isLoading, error } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      const { data } = await hrApi.getAll()
      return data
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
  if (error) return <div className="p-6 text-red-600">Error loading lecturers</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">HR & Lecturer Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Staff profiles and workload allocation</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Register Lecturer</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add new academic staff</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Staff ID" className="h-10" {...register('staffId')} />
                {errors.staffId && <p className="text-xs text-red-600">{errors.staffId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Full Name" className="h-10" {...register('name')} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('departmentId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOE">Faculty of Engineering</SelectItem>
                    <SelectItem value="FOBM">Faculty of Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('position', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Position" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LECTURER">Lecturer</SelectItem>
                    <SelectItem value="SENIOR_LECTURER">Senior Lecturer</SelectItem>
                    <SelectItem value="ASSOC_PROFESSOR">Associate Professor</SelectItem>
                    <SelectItem value="PROFESSOR">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Add Lecturer</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Lecturer Directory</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {lecturers?.length || 0} staff</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Staff ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Position</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers?.map((l: Lecturer) => (
                <TableRow key={l.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{l.staffId}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{l.name}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{l.department}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{l.position}</TableCell>
                  <TableCell><Badge variant={l.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">{l.status.replace('_', ' ')}</Badge></TableCell>
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
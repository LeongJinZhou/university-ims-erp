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
import { financeApi } from '../../lib/api'

const feeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  amount: z.number().min(0),
  semesterId: z.string().min(1, 'Semester is required'),
  status: z.string(),
})

type FeeForm = z.infer<typeof feeSchema>

type Fee = {
  id: string
  student: string
  amount: number
  semester: string
  status: string
  dueDate: string
}

export function FinanceDashboard() {
  const { data: fees, isLoading, error } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data } = await financeApi.getAll()
      return data
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FeeForm>({
    resolver: zodResolver(feeSchema),
  })

  const onSubmit = (data: FeeForm) => {
    console.log('Creating fee record:', data)
    reset()
  }

  if (isLoading) return <FinanceSkeleton />
  if (error) return <div>Error loading fees</div>

  const totalDue = fees?.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + f.amount, 0) || 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance & Fees</h1>
        <p className="text-muted-foreground">Tuition billing and payment tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${fees?.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0) || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">${totalDue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{fees?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Fee Record</CardTitle>
          <CardDescription>Add tuition fee for student</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input placeholder="Student ID" {...register('studentId')} />
              {errors.studentId && <p className="text-sm text-red-500">{errors.studentId.message}</p>}
            </div>
            <div>
              <Input type="number" placeholder="Amount" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
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
            <div>
              <Select onValueChange={(v) => setValue('status', v)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Create Record</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>Total: {fees?.length || 0} records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees?.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.student}</TableCell>
                  <TableCell>${f.amount}</TableCell>
                  <TableCell>{f.semester}</TableCell>
                  <TableCell>{f.dueDate}</TableCell>
                  <TableCell><Badge variant={f.status === 'PAID' ? 'default' : 'destructive'}>{f.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function FinanceSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
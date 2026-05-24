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
  if (error) return <div className="p-6 text-red-600">Error loading fees</div>

  const totalDue = fees?.filter((f: Fee) => f.status !== 'PAID').reduce((sum: number, f: Fee) => sum + f.amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Finance & Fees</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tuition billing and payment tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${fees?.filter((f: Fee) => f.status === 'PAID').reduce((sum: number, f: Fee) => sum + f.amount, 0) || 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">${totalDue}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fees?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Create Fee Record</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add tuition fee for student</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Student ID" className="h-10" {...register('studentId')} />
                {errors.studentId && <p className="text-xs text-red-600">{errors.studentId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Amount" className="h-10" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('semesterId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Semester" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S1-2025">Semester 1 2025</SelectItem>
                    <SelectItem value="S2-2025">Semester 2 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('status', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Create Record</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Fee Records</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {fees?.length || 0} records</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Semester</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees?.map((f: Fee) => (
                <TableRow key={f.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{f.student}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">${f.amount}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{f.semester}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{f.dueDate}</TableCell>
                  <TableCell><Badge variant={f.status === 'PAID' ? 'default' : 'destructive'} className="text-xs">{f.status}</Badge></TableCell>
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
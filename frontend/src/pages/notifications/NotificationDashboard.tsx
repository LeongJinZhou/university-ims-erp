import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { notificationApi } from '../../lib/api'

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.string(),
  targetType: z.string(),
})

type NotificationForm = z.infer<typeof notificationSchema>

type Notification = {
  id: string
  title: string
  message: string
  type: string
  target: string
  date: string
}

export function NotificationDashboard() {
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await notificationApi.getAll()
      return data
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
  })

  const onSubmit = (data: NotificationForm) => {
    console.log('Sending notification:', data)
    reset()
  }

  if (isLoading) return <NotificationSkeleton />
  if (error) return <div className="p-6 text-red-600">Error loading notifications</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifications & Appeals</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Announcement management and student appeals</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Send Notification</CardTitle>
          <CardDescription className="text-sm text-slate-500">Broadcast announcement to users</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Input placeholder="Title" className="h-10" {...register('title')} />
                {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-3">
                <Select onValueChange={(v) => setValue('type', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ALERT">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Textarea placeholder="Message" className="min-h-24" {...register('message')} />
              {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5 max-w-xs">
              <Select onValueChange={(v) => setValue('targetType', v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Target" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                  <SelectItem value="LECTURERS">Lecturers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-fit px-6">Send Notification</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Notification History</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {notifications?.length || 0} notifications</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Target</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications?.map((n: Notification) => (
                <TableRow key={n.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{n.title}</TableCell>
                  <TableCell><Badge variant={n.type === 'ALERT' ? 'destructive' : 'secondary'} className="text-xs">{n.type}</Badge></TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{n.target}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{n.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
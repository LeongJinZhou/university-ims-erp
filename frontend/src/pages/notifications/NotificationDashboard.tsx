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

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.string(),
  targetType: z.string(),
})

type NotificationForm = z.infer<typeof notificationSchema>

const mockNotifications = [
  { id: '1', title: 'Exam Schedule Released', message: 'Final exams start Jan 15', type: 'INFO', target: 'ALL', date: '2025-01-01' },
  { id: '2', title: 'Payment Reminder', message: 'Outstanding fees due', type: 'WARNING', target: 'STUDENTS', date: '2025-01-02' },
  { id: '3', title: 'Campus Closure', message: 'Friday maintenance', type: 'ALERT', target: 'ALL', date: '2025-01-03' },
]

export function NotificationDashboard() {
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockNotifications
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
  if (error) return <div>Error loading notifications</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications & Appeals</h1>
        <p className="text-muted-foreground">Announcement management and student appeals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
          <CardDescription>Broadcast announcement to users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input placeholder="Title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
            <div className="lg:col-span-3">
              <Select onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="ALERT">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-4">
              <Textarea placeholder="Message" {...register('message')} rows={3} />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>
            <div>
              <Select onValueChange={(v) => setValue('targetType', v)}>
                <SelectTrigger><SelectValue placeholder="Target" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                  <SelectItem value="LECTURERS">Lecturers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="lg:col-span-5">Send Notification</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Total: {notifications?.length || 0} notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications?.map(n => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell><Badge variant={n.type === 'ALERT' ? 'destructive' : 'secondary'}>{n.type}</Badge></TableCell>
                  <TableCell>{n.target}</TableCell>
                  <TableCell>{n.date}</TableCell>
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
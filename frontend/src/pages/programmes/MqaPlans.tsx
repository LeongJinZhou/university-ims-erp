import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '../../components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'

const mockSemesterPlans = [
  { id: '1', semester: 1, credits: 18, courses: 6, status: 'ACTIVE' },
  { id: '2', semester: 2, credits: 19, courses: 6, status: 'ACTIVE' },
  { id: '3', semester: 3, credits: 17, courses: 6, status: 'ACTIVE' },
  { id: '4', semester: 4, credits: 18, courses: 6, status: 'ACTIVE' },
  { id: '5', semester: 5, credits: 19, courses: 6, status: 'ACTIVE' },
  { id: '6', semester: 6, credits: 16, courses: 5, status: 'ACTIVE' },
]

export function MqaPlans() {
  const { id } = useParams<{ id: string }>()

  const { data: plans, isLoading } = useQuery({
    queryKey: ['mqa-plans', id],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockSemesterPlans
    },
  })

  if (isLoading) return <MqaSkeleton />

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">MQA Semester Plans</h1>
        <p className="text-muted-foreground">Curriculum mapping for each semester</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semester Plan Overview</CardTitle>
          <CardDescription>6-semester structure (Nov→Apr, Apr→Jul, Jul→Nov)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans?.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.semester}</TableCell>
                  <TableCell>{p.semester === 1 || p.semester === 2 ? 'Long (20 cr max)' : 'Short (10 cr max)'}</TableCell>
                  <TableCell>{p.credits}</TableCell>
                  <TableCell>{p.courses}</TableCell>
                  <TableCell><Badge>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MqaSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
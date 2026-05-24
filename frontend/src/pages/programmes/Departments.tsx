import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '../../components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

const mockDepartments = [
  { id: '1', name: 'Department of Computer Science', code: 'DCS', faculty: 'FICT' },
  { id: '2', name: 'Department of Information Technology', code: 'DIT', faculty: 'FICT' },
  { id: '3', name: 'Department of Business Administration', code: 'DBA', faculty: 'FOBM' },
  { id: '4', name: 'Department of Accounting', code: 'DACCT', faculty: 'FOBM' },
]

export function Departments() {
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockDepartments
    },
  })

  if (isLoading) return <DepartmentsSkeleton />

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-muted-foreground">Manage academic departments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
          <CardDescription>Total: {departments?.length || 0} departments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Faculty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments?.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.code}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.faculty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function DepartmentsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
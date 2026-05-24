import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Link } from 'react-router-dom'

const programmeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  facultyId: z.string().min(1, 'Faculty is required'),
  totalCredits: z.number().min(1, 'Credits must be positive'),
  maxDurationSemesters: z.number().min(1, 'Duration must be positive'),
})

type ProgrammeForm = z.infer<typeof programmeSchema>

const mockProgrammes = [
  { id: '1', name: 'Bachelor of Computer Science', code: 'BCS', faculty: 'FICT', credits: 123, maxSem: 6 },
  { id: '2', name: 'Bachelor of Business Administration', code: 'BBA', faculty: 'FOBM', credits: 120, maxSem: 6 },
  { id: '3', name: 'Bachelor of Accounting', code: 'BAcc', faculty: 'FOBM', credits: 120, maxSem: 6 },
]

export function ProgrammeDashboard() {
  const { data: programmes, isLoading, error } = useQuery({
    queryKey: ['programmes'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockProgrammes
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgrammeForm>({
    resolver: zodResolver(programmeSchema),
  })

  const onSubmit = (data: ProgrammeForm) => {
    console.log('Creating programme:', data)
    reset()
  }

  if (isLoading) return <ProgrammeSkeleton />
  if (error) return <div>Error loading programmes</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Programmes & MQA Repository</h1>
        <p className="text-muted-foreground">Manage academic programmes and curriculum plans</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Programme</CardTitle>
          <CardDescription>Add a new academic programme to the repository</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input placeholder="Programme Name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Input placeholder="Code (e.g., BCS)" {...register('code')} />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div>
              <Input placeholder="Faculty ID" {...register('facultyId')} />
              {errors.facultyId && <p className="text-sm text-red-500">{errors.facultyId.message}</p>}
            </div>
            <div>
              <Input type="number" placeholder="Total Credits" {...register('totalCredits', { valueAsNumber: true })} />
              {errors.totalCredits && <p className="text-sm text-red-500">{errors.totalCredits.message}</p>}
            </div>
            <div>
              <Input type="number" placeholder="Max Duration (semesters)" {...register('maxDurationSemesters', { valueAsNumber: true })} />
              {errors.maxDurationSemesters && <p className="text-sm text-red-500">{errors.maxDurationSemesters.message}</p>}
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Create Programme</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Programme List</CardTitle>
          <CardDescription>Total: {programmes?.length || 0} programmes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Max Duration</TableHead>
                <TableHead>MQA Plans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programmes?.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.faculty}</TableCell>
                  <TableCell>{p.credits}</TableCell>
                  <TableCell>{p.maxSem}</TableCell>
                  <TableCell>
                    <Link to={`/programmes/mqa/${p.id}`} className="text-primary hover:underline">
                      View Plans
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ProgrammeSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
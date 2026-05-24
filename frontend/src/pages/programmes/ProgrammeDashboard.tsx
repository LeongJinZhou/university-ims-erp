import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '../../components/ui/skeleton'
import { programmeApi } from '../../lib/api'
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

type Programme = { id: string; name: string; code: string; faculty: string; credits: number; maxSem: number }

export function ProgrammeDashboard() {
  const { data: programmes, isLoading, error } = useQuery({
    queryKey: ['programmes'],
    queryFn: async () => {
      const { data } = await programmeApi.getAll()
      return data
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
  if (error) return <div className="p-6 text-red-600">Error loading programmes</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Programmes & MQA Repository</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage academic programmes and curriculum plans</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Create New Programme</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add a new academic programme to the repository</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Programme Name" className="h-10" {...register('name')} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Code (e.g., BCS)" className="h-10" {...register('code')} />
                {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Faculty ID" className="h-10" {...register('facultyId')} />
                {errors.facultyId && <p className="text-xs text-red-600">{errors.facultyId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Total Credits" className="h-10" {...register('totalCredits', { valueAsNumber: true })} />
                {errors.totalCredits && <p className="text-xs text-red-600">{errors.totalCredits.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Max Duration (semesters)" className="h-10" {...register('maxDurationSemesters', { valueAsNumber: true })} />
                {errors.maxDurationSemesters && <p className="text-xs text-red-600">{errors.maxDurationSemesters.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Create Programme</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Programme List</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {programmes?.length || 0} programmes</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Faculty</TableHead>
                <TableHead className="font-semibold">Credits</TableHead>
                <TableHead className="font-semibold">Max Duration</TableHead>
                <TableHead className="font-semibold">MQA Plans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programmes?.map((p: Programme) => (
                <TableRow key={p.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{p.code}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{p.name}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{p.faculty}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{p.credits}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{p.maxSem}</TableCell>
                  <TableCell>
                    <Link to={`/programmes/mqa/${p.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
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
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
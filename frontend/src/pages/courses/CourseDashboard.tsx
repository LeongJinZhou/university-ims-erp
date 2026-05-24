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
import { courseApi } from '../../lib/api'

const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(1, 'Course name is required'),
  credits: z.number().min(1).max(6),
  programmeId: z.string().min(1, 'Programme is required'),
})

type CourseForm = z.infer<typeof courseSchema>

type Course = {
  id: string
  code: string
  name: string
  credits: number
  programme: string
  prerequisites: string[]
  equivalents: string[]
}

export function CourseDashboard() {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await courseApi.getAll()
      return data
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
  })

  const onSubmit = (data: CourseForm) => {
    console.log('Creating course:', data)
    reset()
  }

  if (isLoading) return <CourseSkeleton />
  if (error) return <div>Error loading courses</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course & Prerequisite Engine</h1>
        <p className="text-muted-foreground">Course catalog with prerequisite graph visualization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register New Course</CardTitle>
          <CardDescription>Add course to catalog with credit hours</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input placeholder="Course Code" {...register('code')} />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div>
              <Input placeholder="Course Name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Input type="number" placeholder="Credits" {...register('credits', { valueAsNumber: true })} />
              {errors.credits && <p className="text-sm text-red-500">{errors.credits.message}</p>}
            </div>
            <div>
              <Select onValueChange={(v) => setValue('programmeId', v)}>
                <SelectTrigger><SelectValue placeholder="Programme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCS">BCS</SelectItem>
                  <SelectItem value="BBA">BBA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Add Course</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
          <CardDescription>Total: {courses?.length || 0} courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Prerequisites</TableHead>
                <TableHead>Equivalents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell><Badge variant="outline">{c.credits} cr</Badge></TableCell>
                  <TableCell>{c.prerequisites.length ? c.prerequisites.join(', ') : '-'}</TableCell>
                  <TableCell>{c.equivalents.length ? c.equivalents.join(', ') : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisite Graph</CardTitle>
          <CardDescription>MANDATORY = solid line, COREQUISITE = dashed line</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 h-64 overflow-auto">
            <pre className="text-sm">{JSON.stringify(mockPrerequisites, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CourseSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-80" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
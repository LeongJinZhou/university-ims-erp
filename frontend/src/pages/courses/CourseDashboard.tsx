import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { courseApi } from '../../lib/api'

const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(1, 'Course name is required'),
  credits: z.number().min(1).max(6),
  programmeId: z.string().min(1, 'Programme is required'),
})

type CourseForm = z.infer<typeof courseSchema>

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
  if (error) return <div className="p-6 text-red-600">Error loading courses</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Course & Prerequisite Engine</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Course catalog with prerequisite graph visualization</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Register New Course</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add course to catalog with credit hours</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Course Code" className="h-10" {...register('code')} />
                {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Course Name" className="h-10" {...register('name')} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Credits" className="h-10" {...register('credits', { valueAsNumber: true })} />
                {errors.credits && <p className="text-xs text-red-600">{errors.credits.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('programmeId', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Programme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCS">BCS</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Add Course</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function CourseSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-80" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
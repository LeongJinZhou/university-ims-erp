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
import { venueApi } from '../../lib/api'

const venueSchema = z.object({
  code: z.string().min(1, 'Venue code is required'),
  name: z.string().min(1, 'Venue name is required'),
  type: z.string(),
  capacity: z.number().min(1),
})

type VenueForm = z.infer<typeof venueSchema>

type Venue = {
  id: string
  code: string
  name: string
  type: string
  capacity: number
  equipment: string
}

export function VenueDashboard() {
  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data } = await venueApi.getAll()
      return data
    },
  })

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<VenueForm>({
    resolver: zodResolver(venueSchema),
  })

  const onSubmit = (data: VenueForm) => {
    console.log('Creating venue:', data)
    reset()
  }

  if (isLoading) return <VenueSkeleton />
  if (error) return <div className="p-6 text-red-600">Error loading venues</div>

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Venue & Resource Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage venues, equipment, and capacity assignments</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Register Venue</CardTitle>
          <CardDescription className="text-sm text-slate-500">Add new venue with capacity and equipment</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Venue Code" className="h-10" {...register('code')} />
                {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Venue Name" className="h-10" {...register('name')} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('type', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAB">Lab</SelectItem>
                    <SelectItem value="LT">Lecture Theatre</SelectItem>
                    <SelectItem value="TUT">Tutorial Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Capacity" className="h-10" {...register('capacity', { valueAsNumber: true })} />
                {errors.capacity && <p className="text-xs text-red-600">{errors.capacity.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-fit px-6">Add Venue</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Venue Catalog</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {venues?.length || 0} venues</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Capacity</TableHead>
                <TableHead className="font-semibold">Equipment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues?.map((v: Venue) => (
                <TableRow key={v.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{v.code}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{v.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{v.type}</Badge></TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{v.capacity}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{v.equipment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function VenueSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
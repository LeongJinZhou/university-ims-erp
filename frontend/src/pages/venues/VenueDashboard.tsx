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

const venueSchema = z.object({
  code: z.string().min(1, 'Venue code is required'),
  name: z.string().min(1, 'Venue name is required'),
  type: z.string(),
  capacity: z.number().min(1),
})

type VenueForm = z.infer<typeof venueSchema>

const mockVenues = [
  { id: '1', code: 'LAB101', name: 'Programming Lab 1', type: 'LAB', capacity: 30, equipment: 'PC, Projector' },
  { id: '2', code: 'LAB201', name: 'Programming Lab 2', type: 'LAB', capacity: 30, equipment: 'PC, Projector' },
  { id: '3', code: 'LT101', name: 'Lecture Theatre 1', type: 'LT', capacity: 100, equipment: 'Projector, Sound' },
  { id: '4', code: 'LT102', name: 'Lecture Theatre 2', type: 'LT', capacity: 80, equipment: 'Projector' },
]

export function VenueDashboard() {
  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return mockVenues
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
  if (error) return <div>Error loading venues</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Venue & Resource Manager</h1>
        <p className="text-muted-foreground">Manage venues, equipment, and capacity assignments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register Venue</CardTitle>
          <CardDescription>Add new venue with capacity and equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input placeholder="Venue Code" {...register('code')} />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div>
              <Input placeholder="Venue Name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Select onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAB">Lab</SelectItem>
                  <SelectItem value="LT">Lecture Theatre</SelectItem>
                  <SelectItem value="TUT">Tutorial Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input type="number" placeholder="Capacity" {...register('capacity', { valueAsNumber: true })} />
              {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-5">Add Venue</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Venue Catalog</CardTitle>
          <CardDescription>Total: {venues?.length || 0} venues</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Equipment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues?.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.code}</TableCell>
                  <TableCell>{v.name}</TableCell>
                  <TableCell><Badge variant="outline">{v.type}</Badge></TableCell>
                  <TableCell>{v.capacity}</TableCell>
                  <TableCell>{v.equipment}</TableCell>
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
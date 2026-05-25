import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { hrApi } from '../../lib/api';

const profileSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  staffId: z.string().min(1, 'Staff ID is required'),
  departmentId: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  employmentType: z.string().optional(),
  salary: z.number().optional(),
  bankAccount: z.string().optional(),
  emergencyContact: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

type StaffProfile = {
  id: string;
  staffId: string;
  user: {
    name: string;
    email: string;
  };
  department?: {
    name: string;
    code: string;
  };
  position: string;
  employmentType: string;
  salary?: number;
  qualifications: string[];
  joinDate: string;
};

export function StaffProfileRegistry() {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['staff-profiles'],
    queryFn: async () => {
      const { data } = await hrApi.getStaffProfiles();
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProfileForm) => hrApi.createStaffProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profiles'] });
    },
  });

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = (data: ProfileForm) => {
    createMutation.mutate(data);
    reset();
  };

  if (isLoading) return <RegistrySkeleton />;
  if (error) return <div className="p-6 text-red-600">Error loading staff profiles</div>;

  const fullTimeCount = profiles?.filter((p: StaffProfile) => p.employmentType === 'FULL_TIME').length || 0;
  const partTimeCount = profiles?.filter((p: StaffProfile) => p.employmentType === 'PART_TIME').length || 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Staff Profile Registry</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">HR staff administration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profiles?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Full-Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fullTimeCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Part-Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{partTimeCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Add Staff Profile</CardTitle>
          <CardDescription className="text-sm text-slate-500">Register new staff member</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <Input placeholder="User ID" className="h-10" {...register('userId')} />
                {errors.userId && <p className="text-xs text-red-600">{errors.userId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Staff ID" className="h-10" {...register('staffId')} />
                {errors.staffId && <p className="text-xs text-red-600">{errors.staffId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Position" className="h-10" {...register('position')} />
                {errors.position && <p className="text-xs text-red-600">{errors.position.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Select onValueChange={(v) => setValue('employmentType', v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Employment Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                    <SelectItem value="PART_TIME">Part-Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Input type="number" placeholder="Salary" className="h-10" {...register('salary', { valueAsNumber: true })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Input placeholder="Bank Account" className="h-10" {...register('bankAccount')} />
              </div>
            </div>
            <Button type="submit" className="w-fit px-6" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Staff Profiles</CardTitle>
          <CardDescription className="text-sm text-slate-500">Total: {profiles?.length || 0} records</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Staff ID</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Position</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Salary</TableHead>
                <TableHead className="font-semibold">Qualifications</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile: StaffProfile) => (
                <TableRow key={profile.id} className="border-slate-200 dark:border-slate-800">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{profile.user.name}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{profile.staffId}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {profile.department?.name || '-'}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{profile.position}</TableCell>
                  <TableCell>
                    <Badge variant={profile.employmentType === 'FULL_TIME' ? 'default' : 'outline'} className="text-xs">
                      {profile.employmentType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {profile.salary ? `MYR ${profile.salary.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {profile.qualifications?.join(', ') || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RegistrySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
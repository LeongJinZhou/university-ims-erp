import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { studentApi } from '../lib/api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function DashboardView() {
  const { data: students, isLoading } = useQuery({
    queryKey: ['dashboard-students'],
    queryFn: async () => {
      const { data } = await studentApi.getAll()
      return data
    },
  })

  if (isLoading) return <DashboardSkeleton />

  const gpaDistribution = [
    { range: '4.0-3.5', count: 0 },
    { range: '3.5-3.0', count: 0 },
    { range: '3.0-2.5', count: 0 },
    { range: '2.5-2.0', count: 0 },
    { range: '2.0-1.0', count: 0 },
  ]

  const statusDistribution = [
    { name: 'On Track', value: students?.filter((s: any) => s.status === 'ON_TRACK').length || 0 },
    { name: 'Delayed', value: students?.filter((s: any) => s.status === 'DELAYED').length || 0 },
    { name: 'Extension', value: students?.filter((s: any) => s.status === 'EXTENSION_REQUIRED').length || 0 },
  ]

  const semesterTrend = [
    { semester: '2024-S3', enrolments: 850, avgGpa: 3.2 },
    { semester: '2025-S1', enrolments: 920, avgGpa: 3.1 },
    { semester: '2025-S2', enrolments: 890, avgGpa: 3.3 },
    { semester: '2026-S1', enrolments: 950, avgGpa: 3.2 },
  ]

  const programmeDistribution = [
    { name: 'BCS', value: students?.filter((s: any) => s.programme === 'BCS').length || 0 },
    { name: 'BIT', value: students?.filter((s: any) => s.programme === 'BIT').length || 0 },
    { name: 'BSE', value: students?.filter((s: any) => s.programme === 'BSE').length || 0 },
    { name: 'Other', value: students?.filter((s: any) => !['BCS', 'BIT', 'BSE'].includes(s.programme)).length || 0 },
  ]

  const totalStudents = students?.length || 0
  const avgGpa = students?.reduce((sum: number, s: any) => sum + (s.gpa || 0), 0) / totalStudents || 0
  const atRiskCount = students?.filter((s: any) => s.status !== 'ON_TRACK').length || 0

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics Command Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time institutional metrics and performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">+12% from last semester</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Average GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{avgGpa.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">System-wide average</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atRiskCount}</div>
            <p className="text-xs text-slate-500 mt-1">Requires intervention</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(((totalStudents - atRiskCount) / totalStudents) * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">On-track students</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Semester Performance Trend</CardTitle>
            <CardDescription>Enrolment and GPA trends across semesters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={semesterTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semester" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" domain={[0, 4]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="enrolments" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Enrolments" />
                <Line yAxisId="right" type="monotone" dataKey="avgGpa" stroke="#10b981" strokeWidth={2} name="Avg GPA" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Student Status Distribution</CardTitle>
            <CardDescription>Current academic standing breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Programme Distribution</CardTitle>
            <CardDescription>Students across academic programmes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programmeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">GPA Distribution</CardTitle>
            <CardDescription>Grade point distribution bands</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gpaDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  )
}
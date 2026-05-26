import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { venueApi } from '../lib/api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export function TimetableView() {
  const [selectedSemester, setSelectedSemester] = useState('2025-S1')

  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data } = await venueApi.getAll()
      return data
    },
  })

  const renderGrid = () => {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-6 gap-px bg-slate-200 dark:bg-slate-800">
          <div className="bg-slate-100 dark:bg-slate-900 p-2 font-semibold text-sm">Time</div>
          {DAYS.map(day => (
            <div key={day} className="bg-slate-100 dark:bg-slate-900 p-2 font-semibold text-sm text-center">{day}</div>
          ))}
          {TIME_SLOTS.map(time => (
            <div key={`time-${time}`} className="contents">
              <div className="bg-white dark:bg-slate-950 p-2 text-xs font-medium">{time}</div>
              {DAYS.map((_, i) => (
                <div key={`slot-${time}-${i}`} className="bg-white dark:bg-slate-950 p-1 min-h-12 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400">—</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Administrator Timetable</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage venues and view generated timetable grid</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-S1">2025 Semester 1</SelectItem>
            <SelectItem value="2025-S2">2025 Semester 2</SelectItem>
            <SelectItem value="2025-S3">2025 Semester 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Timetable Grid</CardTitle>
              <CardDescription>Interactive drag-and-drop scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              {renderGrid()}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Venues</CardTitle>
              <CardDescription>{venuesLoading ? 'Loading...' : `${venues?.length || 0} venues`}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {venuesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {venues?.data?.map((venue: any) => (
                    <div key={venue.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{venue.code}</p>
                          <p className="text-sm text-slate-500">{venue.name}</p>
                        </div>
                        <Badge variant="outline">{venue.capacity}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
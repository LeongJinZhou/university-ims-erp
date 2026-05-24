import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  Settings,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: GraduationCap, label: 'Programmes', href: '/programmes' },
  { icon: Users, label: 'Students', href: '/students' },
  { icon: BookOpen, label: 'Courses', href: '/courses' },
  { icon: Calendar, label: 'Timetable', href: '/timetable' },
  { icon: CreditCard, label: 'Venues', href: '/venues' },
  { icon: CreditCard, label: 'Exams', href: '/exams' },
  { icon: CreditCard, label: 'Enrolment', href: '/enrolment' },
  { icon: CreditCard, label: 'HR', href: '/hr' },
  { icon: CreditCard, label: 'Finance', href: '/finance' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <GraduationCap className="h-6 w-6 mr-2 text-blue-400" />
          <span className="font-semibold text-lg">University ERP</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="ml-64 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
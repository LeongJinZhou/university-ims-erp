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

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <GraduationCap className="h-6 w-6 mr-2" />
        <span className="font-semibold">University IMS ERP</span>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
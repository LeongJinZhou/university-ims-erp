import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ProgrammeDashboard } from './pages/programmes/ProgrammeDashboard'
import { MqaPlans } from './pages/programmes/MqaPlans'
import { Departments } from './pages/programmes/Departments'
import { StudentDashboard } from './pages/students/StudentDashboard'
import { CourseDashboard } from './pages/courses/CourseDashboard'
import { TimetableDashboard } from './pages/timetable/TimetableDashboard'
import { VenueDashboard } from './pages/venues/VenueDashboard'
import { ExamDashboard } from './pages/exams/ExamDashboard'
import { EnrolmentDashboard } from './pages/enrolment/EnrolmentDashboard'
import { HrDashboard } from './pages/hr/HrDashboard'
import { FinanceDashboard } from './pages/finance/FinanceDashboard'
import { NotificationDashboard } from './pages/notifications/NotificationDashboard'

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/programmes" replace />} />
            <Route path="/programmes" element={<ProgrammeDashboard />} />
            <Route path="/programmes/mqa/:id" element={<MqaPlans />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/students" element={<StudentDashboard />} />
            <Route path="/courses" element={<CourseDashboard />} />
            <Route path="/timetable" element={<TimetableDashboard />} />
            <Route path="/venues" element={<VenueDashboard />} />
            <Route path="/exams" element={<ExamDashboard />} />
            <Route path="/enrolment" element={<EnrolmentDashboard />} />
            <Route path="/hr" element={<HrDashboard />} />
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/notifications" element={<NotificationDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
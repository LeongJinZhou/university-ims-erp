import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ProgrammeDashboard } from './pages/programmes/ProgrammeDashboard'
import { MqaPlans } from './pages/programmes/MqaPlans'
import { Departments } from './pages/programmes/Departments'

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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './providers/AuthProvider'
import Logo from './widgets/Logo'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import ProfileScreen from './screens/ProfileScreen'
import TestScreen from './screens/TestScreen'
import TrainingScreen from './screens/TrainingScreen'
import { skills } from './utils/dayTracker'

// Same routes as MaterialApp.routes in ai_spikeng_mobile/lib/main.dart
export default function App() {
  const { loading, isLoggedIn } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <Logo />
        <span className="spinner spinner-lg" />
        <p>Loading AI-SPIKENG...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/test" element={<TestScreen />} />
      {skills.map((skill) => (
        <Route key={skill} path={`/${skill}`} element={<TrainingScreen key={skill} skill={skill} />} />
      ))}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

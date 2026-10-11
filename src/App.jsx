import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './components/Auth/LoginPage'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import ProfilePage from './components/Profile/ProfilePage'
import TestPage from './pages/TestPage'
import VocabularyPage from './pages/VocabularyPage'
import SpeakingPage from './pages/SpeakingPage'
import GrammarPage from './pages/GrammarPage'
import ListeningPage from './pages/ListeningPage'
import ConversationPage from './pages/ConversationPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-logo">AI</div>
        <div className="spinner spinner-lg" />
        <p>Loading AI-SPIKENG...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/test" element={
        <ProtectedRoute>
          <Layout><TestPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/vocabulary" element={
        <ProtectedRoute>
          <Layout><VocabularyPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/speaking" element={
        <ProtectedRoute>
          <Layout><SpeakingPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/grammar" element={
        <ProtectedRoute>
          <Layout><GrammarPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/listening" element={
        <ProtectedRoute>
          <Layout><ListeningPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/conversation" element={
        <ProtectedRoute>
          <Layout><ConversationPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

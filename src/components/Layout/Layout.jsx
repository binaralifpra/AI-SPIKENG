import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  LayoutDashboard, BookOpen, Mic, PenTool, Headphones,
  MessageCircle, ClipboardCheck, LogOut, Sun, Moon, Menu, X,
  UserCircle
} from 'lucide-react'
import { getSkillLevel } from '../../utils/cefrLevels'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/test', label: 'CEFR Test', icon: ClipboardCheck },
  { path: '/profile', label: 'Profile', icon: UserCircle }
]

const SKILL_ITEMS = [
  { path: '/vocabulary', label: 'Vocabulary', icon: BookOpen, color: 'var(--color-vocabulary)' },
  { path: '/speaking', label: 'Speaking', icon: Mic, color: 'var(--color-speaking)' },
  { path: '/grammar', label: 'Grammar', icon: PenTool, color: 'var(--color-grammar)' },
  { path: '/listening', label: 'Listening', icon: Headphones, color: 'var(--color-listening)' },
  { path: '/conversation', label: 'Conversation', icon: MessageCircle, color: 'var(--color-conversation)' }
]

export default function Layout({ children }) {
  const { user, userData, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userName = userData?.profile?.name || user?.displayName || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const langLabel = userData?.settings?.language === 'english' ? '🇬🇧 EN' : '🇮🇩🇬🇧 Hybrid'

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="app-sidebar-header">
          <div className="app-sidebar-logo">AI</div>
          <div className="app-sidebar-brand">
            <h2>AI-SPIKENG</h2>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          <div className="app-sidebar-section">
            <div className="app-sidebar-section-title">Training</div>
            {SKILL_ITEMS.map(item => {
              const level = getSkillLevel(userData, item.label)
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-dot" style={{ background: item.color }} />
                  {item.label}
                  {level && (
                    <span className={`nav-badge badge badge-${level.toLowerCase()}`}>
                      {level}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>

        <div className="app-sidebar-footer">
          <div className="sidebar-user-card" onClick={() => { navigate('/profile'); setSidebarOpen(false) }}>
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{userName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{langLabel}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm sidebar-logout-btn" onClick={handleLogout} title="Logout" id="logout-btn">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <div className="app-topbar">
          <div className="app-topbar-left">
            <button
              className="btn btn-icon btn-ghost mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <div className="app-topbar-right">
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <div className="theme-toggle-thumb">
                {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
              </div>
            </button>
          </div>
        </div>

        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  )
}

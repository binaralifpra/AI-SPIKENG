import { NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, FilePenLine, Headphones, LayoutDashboard, LogOut, MessageCircle, Mic, User } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { getCefrColor, alpha } from '../config/theme'
import { getInitials, getSkillLevel } from '../models/userData'
import { skills, skillLabels } from '../utils/dayTracker'
import Logo from './Logo'

export const skillIcons = {
  vocabulary: BookOpen,
  speaking: Mic,
  grammar: FilePenLine,
  listening: Headphones,
  conversation: MessageCircle,
}

function NavItem({ to, icon: Icon, label, trailing, onNavigate }) {
  return (
    <NavLink to={to} replace className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onNavigate}>
      <Icon size={20} />
      <span className="nav-label">{label}</span>
      {trailing}
    </NavLink>
  )
}

export function CefrBadge({ level, small = false }) {
  const color = getCefrColor(level)
  return (
    <span className={`cefr-badge${small ? ' small' : ''}`} style={{ color, background: alpha(color, 0.15) }}>
      {level}
    </span>
  )
}

export default function AppDrawer({ open, onClose }) {
  const { user, userData, logout } = useAuth()
  const navigate = useNavigate()
  const userName = userData?.profile?.name || user?.displayName || 'User'
  const initials = getInitials(userName) || 'U'
  const langLabel = userData?.settings?.language === 'english' ? '🇬🇧 EN' : '🇮🇩🇬🇧 Hybrid'

  return (
    <>
      <div className={`drawer-scrim${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`drawer${open ? ' open' : ''}`} aria-label="Navigasi">
        <div className="drawer-header">
          <Logo size={44} radius={14} fontSize={16} />
          <span className="drawer-brand">AI-SPIKENG</span>
        </div>
        <div className="divider" />

        <nav className="drawer-nav">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onNavigate={onClose} />
          <NavItem to="/test" icon={ClipboardList} label="CEFR Test" onNavigate={onClose} />
          <NavItem to="/profile" icon={User} label="Profile" onNavigate={onClose} />

          <div className="drawer-section">TRAINING</div>
          {skills.map((skill) => (
            <NavItem
              key={skill}
              to={`/${skill}`}
              icon={skillIcons[skill]}
              label={skillLabels[skill]}
              trailing={<CefrBadge level={getSkillLevel(userData, skill)} small />}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="divider" />
        <button className="drawer-user" onClick={() => { onClose(); navigate('/profile') }}>
          <span className="avatar">{initials}</span>
          <span className="drawer-user-text">
            <span className="drawer-user-name">{userName}</span>
            <span className="drawer-user-lang">{langLabel}</span>
          </span>
        </button>
        <button className="nav-item" onClick={async () => { onClose(); await logout() }}>
          <LogOut size={20} />
          <span className="nav-label">Logout</span>
        </button>
      </aside>
    </>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Menu } from 'lucide-react'
import AppDrawer from './AppDrawer'

/**
 * Scaffold + AppBar equivalent.
 * Phone width: Dashboard has the hamburger/drawer, other screens a back arrow (like the app).
 * Desktop width: the drawer stays open as a sidebar on every screen.
 */
export default function AppShell({ title, actions, showBack = false, chat = false, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/dashboard', { replace: true })
  }

  return (
    <div className="shell">
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="shell-main">
        <header className="appbar">
          {showBack ? (
            <button className="icon-btn appbar-lead back-btn" onClick={goBack} aria-label="Kembali">
              <ArrowLeft size={22} />
            </button>
          ) : (
            <button className="icon-btn appbar-lead menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Buka menu">
              <Menu size={22} />
            </button>
          )}
          <div className="appbar-title">{title}</div>
          <div className="appbar-actions">{actions}</div>
        </header>
        <main className={chat ? 'chat-main' : 'page'}>{children}</main>
      </div>
    </div>
  )
}

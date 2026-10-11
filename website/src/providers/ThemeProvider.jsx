// Mirrors ai_spikeng_mobile/lib/providers/theme_provider.dart (dark by default, persisted)
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'isDarkMode'

function loadIsDark() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(loadIsDark)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0F1117' : '#F8FAFC')
    try { localStorage.setItem(STORAGE_KEY, String(isDark)) } catch { /* storage unavailable */ }
  }, [isDark])

  const toggleTheme = () => setIsDark((d) => !d)

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

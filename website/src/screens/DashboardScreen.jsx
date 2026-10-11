import { useNavigate } from 'react-router-dom'
import { Lock, Moon, Sun } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { useTheme } from '../providers/ThemeProvider'
import { alpha, getSkillColor } from '../config/theme'
import { getSkillLevel } from '../models/userData'
import { skills, skillLabels } from '../utils/dayTracker'
import AppShell from '../widgets/AppShell'
import { CefrBadge, skillIcons } from '../widgets/AppDrawer'
import TrainingCalendarWidget from '../widgets/TrainingCalendarWidget'

function SkillCard({ skill, userData, locked }) {
  const navigate = useNavigate()
  const Icon = skillIcons[skill]
  const color = getSkillColor(skill)
  const level = getSkillLevel(userData, skill)
  const currentDay = userData?.dayProgress?.[skill]?.currentDay ?? 1
  const percent = Math.round((currentDay / 30) * 100)

  return (
    <button
      className={`card skill-card${locked ? ' locked' : ''}`}
      disabled={locked}
      onClick={() => navigate(`/${skill}`)}
      title={locked ? 'Selesaikan tes CEFR untuk membuka latihan' : undefined}
    >
      <div className="skill-card-top">
        <span className="skill-icon" style={{ color, background: alpha(color, 0.15) }}><Icon size={20} /></span>
        {locked ? <Lock size={16} className="muted" /> : <CefrBadge level={level} />}
      </div>
      <div className="skill-card-bottom">
        <div className="skill-name">{skillLabels[skill]}</div>
        <div className="skill-day">Day {currentDay}/30</div>
        <div className="progress" style={{ background: alpha(color, 0.1) }}>
          <div className="progress-bar" style={{ width: `${percent}%`, background: color }} />
        </div>
      </div>
    </button>
  )
}

export default function DashboardScreen() {
  const { userData } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const testCompleted = userData?.testCompleted ?? false
  const userName = userData?.profile?.name || 'User'

  return (
    <AppShell
      title="Dashboard"
      actions={
        <button className="icon-btn" onClick={toggleTheme} aria-label="Ganti tema">
          {isDark ? <Moon size={22} /> : <Sun size={22} />}
        </button>
      }
    >
      <section className="hero-card">
        <h2>Selamat Datang, {userName}! 👋</h2>
        <p>{testCompleted ? 'Lanjutkan latihan bahasa Inggrismu!' : 'Mulai dengan tes CEFR untuk mengukur kemampuanmu.'}</p>
        {!testCompleted && (
          <button className="btn-white" onClick={() => navigate('/test')}>Mulai Tes CEFR</button>
        )}
      </section>

      <h3 className="section-title">Training</h3>
      <div className="skill-grid">
        {skills.map((skill) => (
          <SkillCard key={skill} skill={skill} userData={userData} locked={!testCompleted} />
        ))}
      </div>

      <h3 className="section-title">Kalender Latihan</h3>
      <div className="card card-pad">
        <TrainingCalendarWidget calendarData={userData?.calendar ?? {}} />
      </div>
    </AppShell>
  )
}

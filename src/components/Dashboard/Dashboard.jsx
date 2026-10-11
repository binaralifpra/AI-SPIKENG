import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, Mic, PenTool, Headphones, MessageCircle, ClipboardCheck, TrendingUp, Lock, Zap, Target, Award } from 'lucide-react'
import TrainingCalendar from '../Calendar/TrainingCalendar'
import { getCefrBadgeClass, CEFR_LABELS, getSkillLevel } from '../../utils/cefrLevels'
import { SKILLS, getSkillLabel, getSkillColor } from '../../utils/dayTracker'

const SKILL_ICONS = {
  vocabulary: BookOpen,
  speaking: Mic,
  grammar: PenTool,
  listening: Headphones,
  conversation: MessageCircle
}

const SKILL_DESCRIPTIONS = {
  vocabulary: 'Build your word power with themed vocabulary sessions',
  speaking: 'Practice pronunciation and fluency with AI feedback',
  grammar: 'Master grammar patterns through conversation',
  listening: 'Improve comprehension with listening exercises',
  conversation: 'Practice real dialogues and role-play scenarios'
}

export default function Dashboard() {
  const { user, userData } = useAuth()
  const navigate = useNavigate()

  const userName = userData?.profile?.name || user?.displayName || 'User'
  const testCompleted = userData?.testCompleted || false

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const totalSessions = SKILLS.reduce((sum, s) => sum + (userData?.dayProgress?.[s]?.currentDay || 0), 0)
  const activeDays = Object.keys(userData?.calendar || {}).length

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-image-wrapper">
          <img src="/hero-banner.png" alt="" className="hero-image" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            AI-Powered Learning
          </div>
          <h1>{getGreeting()}, {userName}! 👋</h1>
          <p>
            {testCompleted
              ? 'Continue your English learning journey. Choose a skill to practice today.'
              : 'Start with the CEFR assessment to discover your English level and unlock all training modules.'}
          </p>
          {!testCompleted && (
            <button className="btn btn-primary btn-lg hero-cta" onClick={() => navigate('/test')} id="hero-start-test">
              <ClipboardCheck size={18} />
              Start CEFR Assessment
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {testCompleted && (
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-card-icon" style={{ background: 'rgba(108, 99, 255, 0.1)', color: 'var(--accent-primary)' }}>
              <Award size={22} />
            </div>
            <div>
              <div className="stat-card-value gradient-text">
                {userData?.cefrLevels?.overall || 'A1'}
              </div>
              <div className="stat-card-label">Overall CEFR</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
              <Target size={22} />
            </div>
            <div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {totalSessions}
              </div>
              <div className="stat-card-label">Total Sessions</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon" style={{ background: 'rgba(240, 192, 64, 0.1)', color: 'var(--color-vocabulary)' }}>
              <Zap size={22} />
            </div>
            <div>
              <div className="stat-card-value" style={{ color: 'var(--color-vocabulary)' }}>
                {activeDays}
              </div>
              <div className="stat-card-label">Active Days</div>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 217, 255, 0.1)', color: 'var(--accent-secondary)' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="stat-card-value" style={{ color: 'var(--accent-secondary)' }}>
                {Math.round((totalSessions / 150) * 100)}%
              </div>
              <div className="stat-card-label">Completion</div>
            </div>
          </div>
        </div>
      )}

      {/* CTA for non-tested users */}
      {!testCompleted && (
        <div className="test-cta card">
          <div className="test-cta-icon">
            <ClipboardCheck size={32} />
          </div>
          <div className="test-cta-content">
            <h3>Take the CEFR Assessment Test</h3>
            <p>Discover your English level across Speaking, Grammar, Vocabulary, Reading, and Writing. The test adapts to your ability.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/test')} id="start-test-btn">
            Start Test
          </button>
        </div>
      )}

      {/* Training Modules */}
      <div className="section-header">
        <h3>Training Modules</h3>
        <p>{testCompleted ? 'Choose a skill to practice today' : 'Complete the CEFR test to unlock modules'}</p>
      </div>

      <div className="skills-grid">
        {SKILLS.map(skill => {
          const Icon = SKILL_ICONS[skill]
          const level = getSkillLevel(userData, skill)
          const dayProgress = userData?.dayProgress?.[skill] || { currentDay: 1 }
          const isLocked = !testCompleted
          const percent = Math.round((dayProgress.currentDay / 30) * 100)

          return (
            <div
              key={skill}
              className={`skill-card card card-clickable ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && navigate(`/${skill}`)}
              id={`skill-card-${skill}`}
            >
              {isLocked && (
                <div className="skill-card-lock">
                  <Lock size={14} />
                </div>
              )}

              <div className="skill-card-header">
                <div className="skill-card-icon" style={{
                  background: `${getSkillColor(skill)}15`,
                  color: getSkillColor(skill)
                }}>
                  <Icon size={22} />
                </div>
                <span className={getCefrBadgeClass(level)}>{level}</span>
              </div>

              <div className="skill-card-title">{getSkillLabel(skill)}</div>
              <div className="skill-card-desc">{SKILL_DESCRIPTIONS[skill]}</div>
              <div className="skill-card-day">Day {dayProgress.currentDay} of 30</div>

              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${percent}%`,
                    background: getSkillColor(skill)
                  }}
                />
              </div>

              <div className="skill-card-footer">
                <span>{CEFR_LABELS[level]}</span>
                <span>{percent}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Calendar */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <TrainingCalendar calendar={userData?.calendar || {}} />
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { skillPrompts, getTopicForDay } from '../config/prompts'
import { alpha, getSkillColor } from '../config/theme'
import { getSkillLevel } from '../models/userData'
import { calculateNewDayProgress, getTodayString, skillLabels } from '../utils/dayTracker'
import { useChatSession } from '../hooks/useChatSession'
import AppShell from '../widgets/AppShell'
import ChatView from '../widgets/ChatView'
import Snackbar from '../widgets/Snackbar'

// One screen for all five skills, same as TrainingScreen(skill: ...) in the app
export default function TrainingScreen({ skill }) {
  const { userData, updateUserData } = useAuth()
  const [error, setError] = useState('')
  const [session0, setSession0] = useState(null) // { day, level } captured when the session starts

  const session = useChatSession({ onError: (e) => setError(`Error: ${e.message}`) })

  const started = useRef(false)
  useEffect(() => {
    if (started.current || !userData) return
    started.current = true

    const level = getSkillLevel(userData, skill)
    const currentDay = userData.dayProgress?.[skill]?.currentDay ?? 1
    setSession0({ day: currentDay, level })

    session.start(skillPrompts[skill]({
      userName: userData.profile?.name || 'User',
      gender: userData.profile?.gender || 'male',
      level,
      day: currentDay,
      language: userData.settings?.language || 'hybrid',
    }))

    // Update day progress + calendar (same as _updateProgress in the app)
    const newProgress = calculateNewDayProgress(userData.dayProgress?.[skill] ?? {})
    const today = getTodayString()
    const calendar = userData.calendar ?? {}
    const dayActivities = [...(calendar[today]?.activities ?? [])]
    if (!dayActivities.includes(skill)) dayActivities.push(skill)

    updateUserData({
      dayProgress: { ...userData.dayProgress, [skill]: newProgress },
      calendar: { ...calendar, [today]: { activities: dayActivities } },
    }).catch((e) => setError(`Error: ${e.message}`))
  }, [userData, skill, session, updateUserData])

  const dismissError = useCallback(() => setError(''), [])
  const color = getSkillColor(skill)

  const title = (
    <span className="title-row">
      <span>{skillLabels[skill] ?? 'Training'}</span>
      {session0 && (
        <span className="day-badge" style={{ color, background: alpha(color, 0.15) }}
          title={getTopicForDay(skill, session0.day)}>
          Day {session0.day}
        </span>
      )}
    </span>
  )

  return (
    <AppShell title={title} showBack chat>
      {userData ? (
        <ChatView session={session} />
      ) : (
        <div className="empty-state">Data akun belum tersedia. Lengkapi profil terlebih dahulu.</div>
      )}
      <Snackbar message={error} onDismiss={dismissError} />
    </AppShell>
  )
}

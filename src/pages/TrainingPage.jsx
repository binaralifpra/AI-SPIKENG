import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../hooks/useChat'
import ChatWindow from '../components/Chat/ChatWindow'
import { getTopicForDay } from '../config/prompts'
import { calculateNewDayProgress, getTodayString } from '../utils/dayTracker'
import { getSkillLevel } from '../utils/cefrLevels'

export default function TrainingPage({ skillType, title, subtitle }) {
  const { userData, updateUserData } = useAuth()

  const level = getSkillLevel(userData, skillType)
  const dayProgress = userData?.dayProgress?.[skillType] || { currentDay: 1, lastPlayedDate: null }
  const currentDay = dayProgress.currentDay || 1
  const userName = userData?.profile?.name || 'User'
  const gender = userData?.profile?.gender || 'male'
  const language = userData?.settings?.language || 'hybrid'

  const topic = getTopicForDay(skillType, currentDay)

  const { messages, isLoading, streamingContent, sendMessage, startSession } = useChat(
    skillType,
    { userName, gender, level, day: currentDay, language }
  )

  // Track calendar & day progress on mount
  useEffect(() => {
    async function trackProgress() {
      if (!userData) return

      const today = getTodayString()
      const newDayProgress = calculateNewDayProgress(dayProgress)

      // Update calendar
      const calendar = { ...(userData.calendar || {}) }
      if (!calendar[today]) {
        calendar[today] = { activities: [] }
      }
      if (!calendar[today].activities.includes(skillType)) {
        calendar[today].activities.push(skillType)
      }

      await updateUserData({
        dayProgress: {
          ...userData.dayProgress,
          [skillType]: newDayProgress
        },
        calendar
      })
    }

    trackProgress()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-start session
  useEffect(() => {
    if (messages.length === 0) {
      startSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ margin: 'calc(-1 * var(--space-xl))', height: 'calc(100vh - 60px)' }}>
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        streamingContent={streamingContent}
        onSendMessage={sendMessage}
        title={`${title} — Day ${currentDay}`}
        subtitle={`${subtitle} | Level: ${level} | Topic: ${topic}`}
      />
    </div>
  )
}

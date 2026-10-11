export const skills = ['vocabulary', 'speaking', 'grammar', 'listening', 'conversation']

export const skillLabels = {
  vocabulary: 'Vocabulary',
  speaking: 'Speaking',
  grammar: 'Grammar',
  listening: 'Listening',
  conversation: 'Conversation',
}

/** Local date as yyyy-MM-dd (same as DateFormat('yyyy-MM-dd') in the app) */
export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const getTodayString = () => formatDate(new Date())

export function calculateNewDayProgress(dayProgress) {
  const today = getTodayString()
  const lastPlayed = dayProgress?.lastPlayedDate ?? null
  const currentDay = dayProgress?.currentDay ?? 1

  if (lastPlayed === today) return dayProgress

  return {
    currentDay: currentDay < 30 ? currentDay + 1 : 30,
    lastPlayedDate: today,
  }
}

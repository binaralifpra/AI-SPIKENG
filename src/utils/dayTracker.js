export function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export function shouldIncrementDay(lastPlayedDate) {
  if (!lastPlayedDate) return true
  return lastPlayedDate !== getTodayString()
}

export function calculateNewDayProgress(currentProgress) {
  const today = getTodayString()
  if (!currentProgress.lastPlayedDate || currentProgress.lastPlayedDate !== today) {
    return {
      currentDay: Math.min((currentProgress.currentDay || 0) + 1, 30),
      lastPlayedDate: today
    }
  }
  return currentProgress
}

export function getSkillColor(skill) {
  const colors = {
    vocabulary: 'var(--color-vocabulary)',
    speaking: 'var(--color-speaking)',
    grammar: 'var(--color-grammar)',
    listening: 'var(--color-listening)',
    conversation: 'var(--color-conversation)'
  }
  return colors[skill] || '#888'
}

export function getSkillLabel(skill) {
  const labels = {
    vocabulary: 'Vocabulary',
    speaking: 'Speaking',
    grammar: 'Grammar',
    listening: 'Listening',
    conversation: 'Conversation'
  }
  return labels[skill] || skill
}

export const SKILLS = ['vocabulary', 'speaking', 'grammar', 'listening', 'conversation']

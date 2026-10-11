export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const CEFR_LABELS = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Proficient'
}

export const CEFR_DESCRIPTIONS = {
  A1: 'Kamu bisa memahami dan menggunakan ekspresi sehari-hari yang sangat dasar.',
  A2: 'Kamu bisa berkomunikasi dalam situasi sederhana dan rutin sehari-hari.',
  B1: 'Kamu bisa menangani sebagian besar situasi saat bepergian dan menulis teks sederhana.',
  B2: 'Kamu bisa berinteraksi dengan lancar dan spontan dengan penutur asli.',
  C1: 'Kamu bisa menggunakan bahasa secara fleksibel dan efektif untuk tujuan sosial dan profesional.',
  C2: 'Kamu bisa memahami hampir semua yang didengar atau dibaca dengan mudah.'
}

export function getCefrColor(level) {
  const colors = {
    A1: 'var(--color-a1)',
    A2: 'var(--color-a2)',
    B1: 'var(--color-b1)',
    B2: 'var(--color-b2)',
    C1: 'var(--color-c1)',
    C2: 'var(--color-c2)'
  }
  return colors[level] || colors.A1
}

export function getCefrBadgeClass(level) {
  return `badge badge-${level?.toLowerCase() || 'a1'}`
}

export function getNextLevel(currentLevel) {
  const index = CEFR_LEVELS.indexOf(currentLevel)
  if (index === -1 || index >= CEFR_LEVELS.length - 1) return null
  return CEFR_LEVELS[index + 1]
}

export function getSkillLevel(userData, skill) {
  if (!userData?.cefrLevels) return 'A1'
  const specific = userData.cefrLevels[skill.toLowerCase()]
  if (specific) return specific
  return userData.cefrLevels.overall || 'A1'
}

export function parseCefrFromResponse(text) {
  // Make regex case-insensitive and allow possible markdown backticks/bold around tags
  const match = text.match(/\[CEFR_RESULTS\]([\s\S]*?)\[\/CEFR_RESULTS\]/i)
  if (!match) return null

  const results = {}
  const lines = match[1].trim().split('\n')
  for (let line of lines) {
    // Remove all asterisks, backticks, and extra spaces that AI might add
    line = line.replace(/[*`]/g, '').trim()
    if (!line) continue

    const [skill, levelRaw] = line.split(':').map(s => s.trim())
    if (skill && levelRaw) {
      // Extract just the A1/B2 etc part
      const levelMatch = levelRaw.match(/(A1|A2|B1|B2|C1|C2)/i)
      if (levelMatch) {
        const cleanSkill = skill.toLowerCase()
        const cleanLevel = levelMatch[1].toUpperCase()
        results[cleanSkill] = cleanLevel
      }
    }
  }
  
  // Only return if we found at least some skills, usually overall is included
  return Object.keys(results).length > 0 ? results : null
}

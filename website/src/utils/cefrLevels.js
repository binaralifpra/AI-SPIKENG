export const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const cefrLabels = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Proficient',
}

export const cefrDescriptions = {
  A1: 'Kamu bisa memahami dan menggunakan ekspresi sehari-hari yang sangat dasar.',
  A2: 'Kamu bisa berkomunikasi dalam situasi sederhana dan rutin sehari-hari.',
  B1: 'Kamu bisa menangani sebagian besar situasi saat bepergian dan menulis teks sederhana.',
  B2: 'Kamu bisa berinteraksi dengan lancar dan spontan dengan penutur asli.',
  C1: 'Kamu bisa menggunakan bahasa secara fleksibel dan efektif untuk tujuan sosial dan profesional.',
  C2: 'Kamu bisa memahami hampir semua yang didengar atau dibaca dengan mudah.',
}

export function getNextLevel(currentLevel) {
  const index = cefrLevels.indexOf(currentLevel)
  if (index === -1 || index >= cefrLevels.length - 1) return null
  return cefrLevels[index + 1]
}

export function parseCefrFromResponse(text) {
  const match = /\[CEFR_RESULTS\]([\s\S]*?)\[\/CEFR_RESULTS\]/i.exec(text)
  if (!match) return null

  const results = {}
  for (let line of match[1].trim().split('\n')) {
    line = line.replace(/[*`]/g, '').trim()
    if (!line) continue

    const parts = line.split(':').map((s) => s.trim())
    if (parts.length >= 2) {
      const skill = parts[0].toLowerCase()
      const levelMatch = /(A1|A2|B1|B2|C1|C2)/i.exec(parts[1])
      if (levelMatch) results[skill] = levelMatch[1].toUpperCase()
    }
  }

  return Object.keys(results).length ? results : null
}

// Mirrors ai_spikeng_mobile/lib/models/user_data.dart — same Firestore document shape (users/{uid})
import { skills } from '../utils/dayTracker'

export function createUserData({ profile = null } = {}) {
  return {
    cefrLevels: {
      vocabulary: 'A1', speaking: 'A1', grammar: 'A1',
      listening: 'A1', conversation: 'A1', overall: '',
    },
    dayProgress: Object.fromEntries(skills.map((s) => [s, { currentDay: 1, lastPlayedDate: null }])),
    testCompleted: false,
    calendar: {},
    ...(profile ? { profile } : {}),
    settings: { language: 'hybrid' },
  }
}

export function createProfile({ name = '', email = '', gender = 'male', age = '', bio = '', createdAt = null } = {}) {
  return { name, email, gender, age, bio, createdAt }
}

/** Equivalent of UserData.fromMap — normalizes whatever is stored in Firestore */
export function userDataFromMap(map) {
  const defaults = createUserData()

  const cefrLevels = map.cefrLevels
    ? Object.fromEntries(Object.entries(map.cefrLevels).map(([k, v]) => [k, v != null ? String(v) : 'A1']))
    : {}

  const dayProgress = map.dayProgress
    ? Object.fromEntries(Object.entries(map.dayProgress).map(([k, v]) => [k, {
        currentDay: Number.isInteger(v?.currentDay) ? v.currentDay : 1,
        lastPlayedDate: v?.lastPlayedDate ?? null,
      }]))
    : defaults.dayProgress

  const calendar = map.calendar
    ? Object.fromEntries(Object.entries(map.calendar).map(([k, v]) => [k, {
        activities: Array.isArray(v?.activities) ? v.activities.map(String) : [],
      }]))
    : {}

  const p = map.profile
  const profile = p
    ? createProfile({
        name: p.name ?? '',
        email: p.email ?? '',
        gender: p.gender ?? 'male',
        age: p.age != null ? String(p.age) : '',
        bio: p.bio ?? '',
        createdAt: p.createdAt ?? null,
      })
    : null

  return {
    cefrLevels,
    dayProgress,
    testCompleted: map.testCompleted === true,
    calendar,
    profile,
    settings: { language: map.settings?.language ?? 'hybrid' },
  }
}

export function getSkillLevel(userData, skill) {
  const specific = userData?.cefrLevels?.[skill.toLowerCase()]
  if (specific) return specific
  return userData?.cefrLevels?.overall || 'A1'
}

export const isProfileComplete = (profile) => !!(profile?.name && profile?.age)

export function getInitials(name) {
  return (name || '').split(' ').map((n) => n[0] ?? '').join('').toUpperCase()
}

// Mirrors AppColors in ai_spikeng_mobile/lib/config/theme.dart
export const AppColors = {
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',

  vocabulary: '#F59E0B',
  speaking: '#3B82F6',
  grammar: '#EF4444',
  listening: '#8B5CF6',
  conversation: '#06B6D4',
}

const cefrColors = {
  A1: '#94A3B8',
  A2: '#22C55E',
  B1: '#3B82F6',
  B2: '#8B5CF6',
  C1: '#F59E0B',
  C2: '#EF4444',
}

export function getCefrColor(level) {
  return cefrColors[(level || '').toUpperCase()] ?? cefrColors.A1
}

export function getSkillColor(skill) {
  return AppColors[(skill || '').toLowerCase()] ?? AppColors.gradientStart
}

/** Hex color + alpha (0..1) → rgba(), same as Color.withValues(alpha:) */
export function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

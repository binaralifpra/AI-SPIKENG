import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Calendar, Globe, Save, Check, Edit2, X } from 'lucide-react'
import { getCefrBadgeClass, CEFR_LABELS, getSkillLevel } from '../../utils/cefrLevels'
import { SKILLS, getSkillLabel, getSkillColor } from '../../utils/dayTracker'

export default function ProfilePage() {
  const { user, userData, updateUserData } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const isProfileComplete = useMemo(() => {
    return !!(userData?.profile?.name && userData?.profile?.age)
  }, [userData])

  const [isEditing, setIsEditing] = useState(!isProfileComplete)

  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [language, setLanguage] = useState('hybrid')

  useEffect(() => {
    if (userData?.profile) {
      setName(userData.profile.name || '')
      setGender(userData.profile.gender || 'male')
      setAge(userData.profile.age || '')
      setBio(userData.profile.bio || '')
    }
    if (userData?.settings) {
      setLanguage(userData.settings.language || 'hybrid')
    }
    
    // Auto switch to view mode if profile is complete and we just saved
    if (userData?.profile?.name && userData?.profile?.age && saved) {
      setIsEditing(false)
    }
  }, [userData, saved])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setErrorMsg('')
    try {
      await updateUserData({
        profile: {
          ...userData?.profile,
          name,
          gender,
          age,
          bio
        },
        settings: {
          ...userData?.settings,
          language
        }
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Error saving profile:', err)
      setErrorMsg(err.message || 'Gagal menyimpan profil ke database.')
    } finally {
      setSaving(false)
    }
  }

  const userName = userData?.profile?.name || user?.displayName || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const memberSince = userData?.profile?.createdAt
    ? new Date(userData.profile.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="profile-page">
      {/* Profile Header Card */}
      <div className="profile-header-card card">
        <div className="profile-header-bg" />
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            {initials}
          </div>
          <div className="profile-header-info">
            <h2>{userName}</h2>
            <p>{user?.email}</p>
            <div className="profile-meta">
              <span><Calendar size={14} /> Member since {memberSince}</span>
              <span><Globe size={14} /> {language === 'hybrid' ? 'Hybrid (ID-EN)' : 'English Only'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Main Content (Edit Form or View Card) */}
        <div className="card profile-form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h3>{isEditing ? (isProfileComplete ? 'Edit Profil' : 'Lengkapi Profil Anda') : 'Data Profil'}</h3>
              <p>{isEditing ? 'Ubah informasi profil dan preferensi kamu.' : 'Informasi dasar akun kamu.'}</p>
            </div>
            {!isEditing && (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} /> Edit
              </button>
            )}
            {isEditing && isProfileComplete && (
              <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                <X size={16} /> Batal
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="profile-view-mode">
              <div className="profile-info-row">
                <span className="profile-info-label">Nama Lengkap</span>
                <span className="profile-info-value">{userData?.profile?.name || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Gender</span>
                <span className="profile-info-value">
                  {userData?.profile?.gender === 'male' ? '👨 Male' : '👩 Female'}
                </span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Usia</span>
                <span className="profile-info-value">{userData?.profile?.age || '—'} Tahun</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Bio / Motivasi</span>
                <span className="profile-info-value">{userData?.profile?.bio || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Preferensi AI</span>
                <span className="profile-info-value">
                  {userData?.settings?.language === 'hybrid' ? '🇮🇩🇬🇧 Hybrid (ID-EN)' : '🇬🇧 English Only'}
                </span>
              </div>
            </div>
          ) : (
            <div className="profile-form">
              <div className="input-group">
                <label>Nama Lengkap</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-tertiary)'
                  }} />
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama kamu"
                    style={{ paddingLeft: 42 }}
                    id="profile-name"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Gender</label>
                <div className="gender-select">
                  <button
                    type="button"
                    className={`gender-option ${gender === 'male' ? 'selected' : ''}`}
                    onClick={() => setGender('male')}
                  >
                    👨 Male
                  </button>
                  <button
                    type="button"
                    className={`gender-option ${gender === 'female' ? 'selected' : ''}`}
                    onClick={() => setGender('female')}
                  >
                    👩 Female
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Usia</label>
                <input
                  className="input"
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Contoh: 25"
                  min="10"
                  max="100"
                  id="profile-age"
                />
              </div>

              <div className="input-group">
                <label>Bio / Motivasi Belajar</label>
                <textarea
                  className="input"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Ceritakan tujuan belajar Bahasa Inggris kamu..."
                  rows={3}
                  style={{ minHeight: 80 }}
                  id="profile-bio"
                />
              </div>

              <div className="input-group">
                <label>Bahasa Respon AI</label>
                <p style={{ fontSize: '0.8rem', marginBottom: 8 }}>
                  Pilih bagaimana AI merespon kamu saat sesi latihan.
                </p>
                <div className="language-select">
                  <button
                    type="button"
                    className={`language-option ${language === 'hybrid' ? 'selected' : ''}`}
                    onClick={() => setLanguage('hybrid')}
                    id="lang-hybrid"
                  >
                    <div className="language-option-icon">🇮🇩🇬🇧</div>
                    <div className="language-option-text">
                      <strong>Hybrid (ID-EN)</strong>
                      <span>Instruksi Bahasa Indonesia, konten English</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`language-option ${language === 'english' ? 'selected' : ''}`}
                    onClick={() => setLanguage('english')}
                    id="lang-english"
                  >
                    <div className="language-option-icon">🇬🇧</div>
                    <div className="language-option-text">
                      <strong>English Only</strong>
                      <span>All instructions and responses in English</span>
                    </div>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div style={{ color: 'var(--color-grammar)', fontSize: '0.85rem', marginBottom: '8px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                  {errorMsg}
                </div>
              )}

              <button
                className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-lg`}
                onClick={handleSave}
                disabled={saving || !name || !age}
                id="save-profile"
                style={{ width: '100%', marginTop: 8 }}
              >
                {saving ? (
                  <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                ) : saved ? (
                  <span><Check size={18} /> <span>Tersimpan!</span></span>
                ) : (
                  <span><Save size={18} /> <span>Simpan Perubahan</span></span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* CEFR Levels Card */}
        <div className="card profile-levels-card">
          <h3>CEFR Level Saat Ini</h3>
          <p style={{ marginBottom: 'var(--space-lg)' }}>Kemampuan Bahasa Inggris kamu di setiap skill.</p>

          {userData?.cefrLevels?.overall && (
            <div className="profile-overall-level">
              <div className="profile-overall-badge">
                <span className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {userData.cefrLevels.overall}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Overall Level</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {CEFR_LABELS[userData.cefrLevels.overall]}
                </div>
              </div>
            </div>
          )}

          <div className="profile-skills-list">
            {SKILLS.map(skill => {
              const level = getSkillLevel(userData, skill)
              const dayProgress = userData?.dayProgress?.[skill] || { currentDay: 1 }

              return (
                <div key={skill} className="profile-skill-item">
                  <div className="profile-skill-dot" style={{ background: getSkillColor(skill) }} />
                  <div className="profile-skill-name">{getSkillLabel(skill)}</div>
                  <div className="profile-skill-progress">Day {dayProgress.currentDay}/30</div>
                  <span className={getCefrBadgeClass(level)}>{level}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

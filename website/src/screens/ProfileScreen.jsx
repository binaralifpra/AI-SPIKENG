import { useState } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { getInitials, isProfileComplete } from '../models/userData'
import AppShell from '../widgets/AppShell'
import { GenderButton } from './LoginScreen'

function formFromUserData(userData) {
  const p = userData?.profile
  return {
    name: p?.name ?? '',
    age: p?.age ?? '',
    bio: p?.bio ?? '',
    gender: p?.gender ?? 'male',
    language: userData?.settings?.language ?? 'hybrid',
  }
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  )
}

export default function ProfileScreen() {
  const { user, userData, updateUserData } = useAuth()
  const [form, setForm] = useState(() => formFromUserData(userData))
  const [isEditing, setIsEditing] = useState(() => !isProfileComplete(userData?.profile))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const userName = userData?.profile?.name || user?.displayName || 'User'
  const initials = getInitials(userName) || 'U'
  const profile = userData?.profile

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateUserData({
        profile: {
          name: form.name.trim(),
          gender: form.gender,
          age: form.age.trim(),
          bio: form.bio.trim(),
          email: user?.email ?? '',
          createdAt: profile?.createdAt ?? new Date().toISOString(),
        },
        settings: { language: form.language },
      })
      setIsEditing(false)
    } catch (err) {
      setError(err?.message || String(err))
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setForm(formFromUserData(userData))
    setError('')
    setIsEditing(false)
  }

  return (
    <AppShell title="Profile" showBack>
      <div className="narrow">
        <section className="hero-card hero-center">
          <span className="avatar avatar-lg">{initials}</span>
          <h2>{userName}</h2>
          <p>{user?.email ?? ''}</p>
        </section>

        <div className="card card-pad-lg">
          <div className="card-head">
            <h3>{isEditing ? 'Edit Profil' : 'Data Profil'}</h3>
            {!isEditing && (
              <button className="btn-text" onClick={() => setIsEditing(true)}><Pencil size={16} /> Edit</button>
            )}
            {isEditing && isProfileComplete(profile) && (
              <button className="btn-text" onClick={cancel}><X size={16} /> Batal</button>
            )}
          </div>

          {!isEditing ? (
            <>
              <InfoRow label="Nama Lengkap" value={profile?.name || '—'} />
              <InfoRow label="Gender" value={profile?.gender === 'female' ? '👩 Female' : '👨 Male'} />
              <InfoRow label="Usia" value={`${profile?.age || '—'} Tahun`} />
              <InfoRow label="Bio / Motivasi" value={profile?.bio || '—'} />
              <InfoRow label="Preferensi AI" value={form.language === 'hybrid' ? '🇮🇩🇬🇧 Hybrid' : '🇬🇧 English Only'} />
            </>
          ) : (
            <form className="form" onSubmit={save}>
              <label className="label">
                Nama Lengkap
                <input className="input" value={form.name} onChange={(e) => set('name')(e.target.value)} />
              </label>

              <div className="label">Gender</div>
              <div className="choice-row">
                <GenderButton label="👨 Male" selected={form.gender === 'male'} onClick={() => set('gender')('male')} />
                <GenderButton label="👩 Female" selected={form.gender === 'female'} onClick={() => set('gender')('female')} />
              </div>

              <label className="label">
                Usia
                <input className="input" type="number" min="1" max="120" inputMode="numeric"
                  value={form.age} onChange={(e) => set('age')(e.target.value)} />
              </label>

              <label className="label">
                Bio / Motivasi Belajar
                <textarea className="input" rows={3} value={form.bio} onChange={(e) => set('bio')(e.target.value)} />
              </label>

              <div className="label">Bahasa Respon AI</div>
              <div className="choice-col">
                <button type="button" className={`choice choice-left${form.language === 'hybrid' ? ' selected' : ''}`}
                  onClick={() => set('language')('hybrid')}>🇮🇩🇬🇧 Hybrid (ID-EN)</button>
                <button type="button" className={`choice choice-left${form.language === 'english' ? ' selected' : ''}`}
                  onClick={() => set('language')('english')}>🇬🇧 English Only</button>
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" className="btn-primary" disabled={saving || !form.name.trim() || !form.age.trim()}>
                {saving ? <><span className="spinner spinner-sm" /> Menyimpan...</> : <><Save size={18} /> Simpan Perubahan</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  )
}

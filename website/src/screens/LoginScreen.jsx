import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import Logo from '../widgets/Logo'

function parseError(e) {
  const msg = e?.code || e?.message || String(e)
  if (msg.includes('user-not-found')) return 'Akun tidak ditemukan'
  if (msg.includes('wrong-password')) return 'Password salah'
  if (msg.includes('email-already-in-use')) return 'Email sudah terdaftar'
  if (msg.includes('weak-password')) return 'Password minimal 6 karakter'
  if (msg.includes('invalid-email')) return 'Format email tidak valid'
  if (msg.includes('invalid-credential')) return 'Email atau password salah'
  if (msg.includes('missing-password')) return 'Password wajib diisi'
  if (msg.includes('too-many-requests')) return 'Terlalu banyak percobaan, coba lagi nanti'
  return (e?.message || String(e)).replace(/^Firebase:\s*/, '').replace(/\(.*?\)\.?/g, '').trim()
}

function Field({ icon: Icon, label, trailing, ...props }) {
  return (
    <label className="field">
      <Icon size={20} className="field-icon" />
      <input className="input input-icon" placeholder=" " {...props} />
      <span className="field-label">{label}</span>
      {trailing}
    </label>
  )
}

export function GenderButton({ label, selected, onClick }) {
  return (
    <button type="button" className={`choice${selected ? ' selected' : ''}`} onClick={onClick} aria-pressed={selected}>
      {label}
    </button>
  )
}

export default function LoginScreen() {
  const { login, signup, loginWithGoogle } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        if (!name.trim()) {
          setError('Nama wajib diisi')
          return
        }
        await signup(email, password, name.trim(), gender)
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      if (!String(err?.code || err).includes('popup-closed')) setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-head">
          <Logo />
          <h1 className="brand-title">AI-SPIKENG</h1>
          <p className="muted">Learn English with AI-powered adaptive tutoring</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {isSignup && (
          <>
            <Field icon={User} label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <div className="choice-row">
              <GenderButton label="👨 Male" selected={gender === 'male'} onClick={() => setGender('male')} />
              <GenderButton label="👩 Female" selected={gender === 'female'} onClick={() => setGender('female')} />
            </div>
          </>
        )}

        <Field icon={Mail} label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Field
          icon={Lock}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          trailing={
            <button type="button" className="icon-btn field-trailing" onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : isSignup ? 'Buat Akun' : 'Masuk'}
        </button>

        <div className="or-divider"><span>atau</span></div>

        <button type="button" className="btn-outline" onClick={handleGoogleLogin} disabled={loading}>
          <span className="google-g">G</span> Continue with Google
        </button>

        <p className="login-toggle">
          <span className="muted">{isSignup ? 'Sudah punya akun? ' : 'Belum punya akun? '}</span>
          <button type="button" className="link-btn" onClick={() => { setIsSignup((s) => !s); setError('') }}>
            {isSignup ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </form>
    </div>
  )
}

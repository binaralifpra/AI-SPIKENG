import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup, loginWithGoogle, dataReady } = useAuth()
  const navigate = useNavigate()

  // When dataReady becomes true (after login/signup), navigate
  useEffect(() => {
    if (dataReady) {
      navigate('/dashboard', { replace: true })
    }
  }, [dataReady, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        if (!name.trim()) {
          setError('Nama wajib diisi')
          setLoading(false)
          return
        }
        await signup(email, password, name.trim(), gender)
      } else {
        await login(email, password)
      }
      // Navigation is handled by the useEffect above
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Akun tidak ditemukan',
        'auth/wrong-password': 'Password salah',
        'auth/email-already-in-use': 'Email sudah terdaftar',
        'auth/weak-password': 'Password minimal 6 karakter',
        'auth/invalid-email': 'Format email tidak valid',
        'auth/invalid-credential': 'Email atau password salah'
      }
      setError(messages[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      // Navigation is handled by the useEffect above
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-card glass">
        <div className="login-logo">
          <div className="login-logo-icon">AI</div>
          <h1 className="gradient-text">AI-SPIKENG</h1>
          <p>Learn English with AI-powered adaptive tutoring</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
              fontSize: '0.85rem', fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {isSignup && (
            <div className="login-extra-fields">
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
                    placeholder="Masukkan nama kamu"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: 42 }}
                    id="signup-name"
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
                    id="gender-male"
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`gender-option ${gender === 'female' ? 'selected' : ''}`}
                    onClick={() => setGender('female')}
                    id="gender-female"
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-tertiary)'
              }} />
              <input
                className="input"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 42 }}
                id="login-email"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-tertiary)'
              }} />
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingLeft: 42, paddingRight: 42 }}
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                  padding: 4
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} id="login-submit">
            {loading ? <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : null}
            {isSignup ? 'Buat Akun' : 'Masuk'}
          </button>

          <div className="login-divider">
            <span>atau</span>
          </div>

          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            id="google-login"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="login-footer">
          {isSignup ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button onClick={() => { setIsSignup(!isSignup); setError('') }} id="toggle-auth-mode">
            {isSignup ? 'Masuk' : 'Daftar'}
          </button>
        </div>
      </div>
    </div>
  )
}

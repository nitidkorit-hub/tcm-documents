import { useState, useEffect } from 'react'
import { supabase, signUp, signIn, signOut, getCurrentUser } from './api/supabase.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u)
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, fullName)
        setError('✅ สมัครสำเร็จ! กรุณายืนยัน Email ของคุณ')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError('❌ ' + (err.message || 'เกิดข้อผิดพลาด'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>📋 TCM Document Agent</h1>
          <div className="user-info">
            <span>{user.email}</span>
            <button onClick={handleLogout} className="btn-secondary">ออกจากระบบ</button>
          </div>
        </header>

        <main className="app-main">
          <div className="welcome-card">
            <h2>🎉 ยินดีต้อนรับ!</h2>
            <p>คุณ Login เข้าระบบสำเร็จแล้ว</p>
            <p className="muted">Email: <strong>{user.email}</strong></p>

            <div className="info-section">
              <h3>📊 สถานะระบบ</h3>
              <ul>
                <li>✅ Supabase: Connected</li>
                <li>✅ Authentication: Working</li>
                <li>✅ Database: Ready</li>
                <li>✅ Storage: Ready</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>🚀 ขั้นตอนต่อไป</h3>
              <p>ระบบจัดการเอกสารกำลังพัฒนา:</p>
              <ul>
                <li>📁 Project Management</li>
                <li>📄 Document Upload</li>
                <li>🔍 Search & Filter</li>
                <li>📥 Download</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📋 TCM Document Agent</h1>
          <p className="muted">ระบบจัดการเอกสารทีม</p>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === 'signin' ? 'tab active' : 'tab'}
            onClick={() => { setMode('signin'); setError('') }}
          >
            เข้าสู่ระบบ
          </button>
          <button
            className={mode === 'signup' ? 'tab active' : 'tab'}
            onClick={() => { setMode('signup'); setError('') }}
          >
            สมัครสมาชิก
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="ชื่อของคุณ"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your-email@teamcm.co.th"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัว"
              minLength={6}
              required
            />
          </div>

          {error && <div className="alert">{error}</div>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'กำลังโหลด...' : (mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
          </button>
        </form>
      </div>
    </div>
  )
}

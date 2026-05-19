import { useState } from 'react'
import { signUp, signIn } from '../api/supabase.js'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

          {error && <div className={error.startsWith('✅') ? 'alert alert-success' : 'alert'}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'กำลังโหลด...' : (mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
          </button>
        </form>
      </div>
    </div>
  )
}

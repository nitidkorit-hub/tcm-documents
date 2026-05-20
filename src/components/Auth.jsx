import { useState } from 'react'
import { signUp, signIn } from '../api/supabase.js'
import Icon from './Icon.jsx'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [msg, setMsg] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, fullName)
        setMsg({ kind: 'ok', text: 'สมัครสำเร็จ! กรุณายืนยัน Email ที่ส่งให้คุณ' })
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setMsg({ kind: 'err', text: err.message || 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark" style={{ width: 48, height: 48, fontSize: 20 }}>
            T
          </div>
          <div>
            <h1 style={{ fontSize: 22, margin: 0 }}>TCM Document Agent</h1>
            <div className="muted small">v5 · Engineering Edition</div>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === 'signin' ? 'tab on' : 'tab'}
            onClick={() => {
              setMode('signin')
              setMsg(null)
            }}
            type="button"
          >
            เข้าสู่ระบบ
          </button>
          <button
            className={mode === 'signup' ? 'tab on' : 'tab'}
            onClick={() => {
              setMode('signup')
              setMsg(null)
            }}
            type="button"
          >
            สมัครสมาชิก
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label>ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ชื่อของคุณ"
                required
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@teamcm.co.th"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัว"
              minLength={6}
              required
            />
          </div>

          {msg && <div className={`auth-msg ${msg.kind}`}>{msg.text}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={submitting}>
            <Icon name={mode === 'signin' ? 'arrow-r' : 'check'} size={15} />
            {submitting ? 'กำลังโหลด...' : mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>
      </div>
    </div>
  )
}

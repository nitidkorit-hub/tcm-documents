import { signOut } from '../api/supabase.js'

export default function Header({ user, onUpload, onNewProject }) {
  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>📋 TCM Document Agent</h1>
      </div>
      <div className="header-right">
        <button onClick={onNewProject} className="btn-outline">
          ➕ โครงการใหม่
        </button>
        <button onClick={onUpload} className="btn-primary-sm">
          📤 อัปโหลด
        </button>
        <div className="user-badge">
          <div className="user-avatar">{(user.email[0] || '?').toUpperCase()}</div>
          <span className="user-email">{user.email}</span>
        </div>
        <button onClick={handleLogout} className="btn-icon" title="ออกจากระบบ">
          ⏻
        </button>
      </div>
    </header>
  )
}

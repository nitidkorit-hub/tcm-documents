import { useState } from 'react'
import { createProject } from '../api/supabase.js'

const COLORS = [
  '#2DBE60', '#3A6EA5', '#6E56CF', '#F5A623',
  '#0EA5E9', '#EC4899', '#DC2626', '#1F3A5F'
]

export default function NewProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [client, setClient] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await createProject({
        name,
        code: code.toUpperCase(),
        client,
        color,
        status: 'active'
      })
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message || 'สร้างโครงการไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ โครงการใหม่</h2>
          <button onClick={onClose} className="btn-icon">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>ชื่อโครงการ *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น รถไฟฟ้าสายสีชมพู"
                required
              />
            </div>
            <div className="form-group">
              <label>รหัสโครงการ *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="เช่น MRT-PP"
                required
              />
            </div>
            <div className="form-group">
              <label>เจ้าของงาน</label>
              <input
                type="text"
                value={client}
                onChange={e => setClient(e.target.value)}
                placeholder="เช่น รฟม."
              />
            </div>
            <div className="form-group">
              <label>สีโครงการ</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={color === c ? 'color-dot active' : 'color-dot'}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            {error && <div className="alert">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline" disabled={submitting}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'กำลังสร้าง...' : 'สร้างโครงการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

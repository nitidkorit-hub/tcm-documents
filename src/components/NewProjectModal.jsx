import { useState } from 'react'
import Icon from './Icon.jsx'
import { useToast } from './Toast.jsx'
import { createProject } from '../api/supabase.js'

const COLORS = ['#2DBE60', '#3A6EA5', '#6E56CF', '#F5A623', '#0EA5E9', '#EC4899', '#DC2626', '#1F3A5F']
const STATUSES = ['กำลังดำเนินการ', 'อนุมัติแบบ', 'ปิดโครงการ']

export default function NewProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [client, setClient] = useState('')
  const [color, setColor] = useState(COLORS[1])
  const [status, setStatus] = useState(STATUSES[0])
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createProject({
        name,
        code: code.toUpperCase(),
        client,
        color,
        status,
      })
      toast('สร้างโครงการเรียบร้อย')
      onCreated?.()
      onClose()
    } catch (err) {
      toast('สร้างไม่สำเร็จ: ' + err.message, 'err')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>สร้างโครงการใหม่</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="field">
              <label>ชื่อโครงการ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น รถไฟฟ้าสายสีม่วงใต้..."
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>รหัสโครงการ</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="MRT-PP"
                  required
                />
              </div>
              <div className="field">
                <label>เจ้าของงาน</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="รฟม."
                />
              </div>
            </div>
            <div className="field">
              <label>สถานะ</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>สีโครงการ</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: c,
                      cursor: 'pointer',
                      border: color === c ? '3px solid var(--navy)' : '2px solid transparent',
                      boxShadow: color === c ? '0 0 0 2px white inset' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Icon name="check" size={14} /> {submitting ? 'กำลังสร้าง...' : 'สร้างโครงการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

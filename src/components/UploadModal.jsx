import { useState, useEffect, useRef } from 'react'
import { fetchProjects, uploadFile, logActivity } from '../api/supabase.js'

const DOC_TYPES = [
  { key: 'auto', label: '🤖 จัดประเภทอัตโนมัติ', color: '#6B7280' },
  { key: 'eia', label: 'EIA', color: '#2DBE60' },
  { key: 'drawing', label: 'แบบ', color: '#3A6EA5' },
  { key: 'contract', label: 'สัญญา', color: '#6E56CF' },
  { key: 'mom', label: 'MOM', color: '#EC4899' },
  { key: 'boq', label: 'BOQ', color: '#DC2626' },
  { key: 'standard', label: 'มาตรฐาน', color: '#0EA5E9' },
  { key: 'labor', label: 'แรงงาน', color: '#F5A623' },
  { key: 'other', label: 'อื่นๆ', color: '#6B7280' },
]

function autoDetectType(filename) {
  const n = filename.toLowerCase()
  if (n.includes('eia')) return 'eia'
  if (n.includes('drawing') || n.includes('dwg') || n.includes('แบบ')) return 'drawing'
  if (n.includes('contract') || n.includes('สัญญา')) return 'contract'
  if (n.includes('mom') || n.includes('minute')) return 'mom'
  if (n.includes('boq') || n.includes('cost')) return 'boq'
  if (n.includes('standard') || n.includes('spec')) return 'standard'
  if (n.includes('labor') || n.includes('แรงงาน')) return 'labor'
  return 'other'
}

export default function UploadModal({ user, onClose, onUploaded }) {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [docType, setDocType] = useState('auto')
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data)
      if (data.length > 0) setProjectId(data[0].id)
    })
  }, [])

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const newFiles = Array.from(e.dataTransfer.files || [])
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpload = async () => {
    if (!projectId) { setError('กรุณาเลือกโครงการ'); return }
    if (files.length === 0) { setError('กรุณาเลือกไฟล์'); return }

    setUploading(true)
    setError('')
    setProgress(0)

    const uploaderName = user.user_metadata?.full_name || user.email
    const total = files.length
    let done = 0

    try {
      for (const file of files) {
        const type = docType === 'auto' ? autoDetectType(file.name) : docType
        await uploadFile(projectId, file, type, uploaderName)
        try {
          await logActivity(projectId, 'upload', `อัปโหลด ${file.name}`)
        } catch (e) { /* activity log fail ok */ }
        done++
        setProgress(Math.round((done / total) * 100))
      }
      onUploaded?.()
      onClose()
    } catch (err) {
      setError('อัปโหลดไม่สำเร็จ: ' + (err.message || err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 อัปโหลดเอกสาร</h2>
          <button onClick={onClose} className="btn-icon">✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>โครงการ</label>
            {projects.length === 0 ? (
              <div className="alert">ยังไม่มีโครงการ - กรุณาสร้างโครงการก่อน</div>
            ) : (
              <select value={projectId} onChange={e => setProjectId(e.target.value)}>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>ประเภทเอกสาร</label>
            <div className="type-grid">
              {DOC_TYPES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  className={docType === t.key ? 'type-btn active' : 'type-btn'}
                  style={docType === t.key ? { background: t.color, color: '#fff', borderColor: t.color } : {}}
                  onClick={() => setDocType(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>ไฟล์</label>
            <div
              className="dropzone"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon">📁</div>
              <p>ลากไฟล์มาที่นี่ หรือคลิกเพื่อเลือก</p>
              <p className="muted small">รองรับ PDF, DOC, XLS, รูปภาพ ฯลฯ</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="file-list-small">
              {files.map((f, i) => (
                <div key={i} className="file-item-small">
                  <span>📄 {f.name}</span>
                  <span className="muted small">{(f.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => removeFile(i)} className="btn-icon">✕</button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: progress + '%' }}></div>
              <div className="progress-label">{progress}%</div>
            </div>
          )}

          {error && <div className="alert">{error}</div>}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-outline" disabled={uploading}>
            ยกเลิก
          </button>
          <button onClick={handleUpload} className="btn-primary" disabled={uploading || files.length === 0 || !projectId}>
            {uploading ? `กำลังอัปโหลด... ${progress}%` : `ยืนยันอัปโหลด (${files.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}

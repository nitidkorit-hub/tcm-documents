import { useState, useEffect } from 'react'
import { fetchFiles, deleteFile, downloadFile, deleteProject } from '../api/supabase.js'

const DOC_TYPES = [
  { key: 'all', label: 'ทั้งหมด', color: '#6B7280' },
  { key: 'eia', label: 'EIA', color: '#2DBE60' },
  { key: 'drawing', label: 'แบบ', color: '#3A6EA5' },
  { key: 'contract', label: 'สัญญา', color: '#6E56CF' },
  { key: 'mom', label: 'MOM', color: '#EC4899' },
  { key: 'boq', label: 'BOQ', color: '#DC2626' },
  { key: 'standard', label: 'มาตรฐาน', color: '#0EA5E9' },
  { key: 'labor', label: 'แรงงาน', color: '#F5A623' },
  { key: 'other', label: 'อื่นๆ', color: '#6B7280' },
]

export default function ProjectDrawer({ project, onClose, onChanged }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [latestOnly, setLatestOnly] = useState(false)

  useEffect(() => {
    if (!project) return
    loadFiles()
  }, [project])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const data = await fetchFiles(project.id)
      setFiles(data)
    } catch (err) {
      alert('โหลดไฟล์ไม่สำเร็จ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.id, file.name)
    } catch (err) {
      alert('ดาวน์โหลดไม่สำเร็จ: ' + err.message)
    }
  }

  const handleDelete = async (file) => {
    if (!confirm(`ลบไฟล์ "${file.name}" ?`)) return
    try {
      await deleteFile(file.id)
      await loadFiles()
      onChanged?.()
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + err.message)
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm(`ลบโครงการ "${project.name}" และไฟล์ทั้งหมด?`)) return
    try {
      await deleteProject(project.id)
      onChanged?.()
      onClose()
    } catch (err) {
      alert('ลบโครงการไม่สำเร็จ: ' + err.message)
    }
  }

  if (!project) return null

  const filtered = files.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && f.type !== typeFilter) return false
    if (latestOnly && !f.is_latest) return false
    return true
  })

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <aside className="drawer">
        <div className="drawer-header" style={{ borderTop: `4px solid ${project.color || '#3A6EA5'}` }}>
          <div>
            <div className="drawer-title">{project.name}</div>
            <div className="muted small">
              <span className="badge">{project.code}</span>
              {project.client && <span> · {project.client}</span>}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" title="ปิด">✕</button>
        </div>

        <div className="drawer-toolbar">
          <input
            type="text"
            placeholder="🔍 ค้นหาไฟล์..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={latestOnly}
              onChange={e => setLatestOnly(e.target.checked)}
            />
            <span>เฉพาะล่าสุด</span>
          </label>
        </div>

        <div className="type-chips">
          {DOC_TYPES.map(t => (
            <button
              key={t.key}
              className={typeFilter === t.key ? 'chip active' : 'chip'}
              style={typeFilter === t.key ? { background: t.color, color: '#fff' } : {}}
              onClick={() => setTypeFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="drawer-body">
          {loading ? (
            <div className="center-pad"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>ไม่พบไฟล์</p>
              <p className="muted small">{files.length === 0 ? 'อัปโหลดไฟล์เพื่อเริ่มต้น' : 'ลองเปลี่ยน filter'}</p>
            </div>
          ) : (
            <div className="file-list">
              {filtered.map(f => {
                const type = DOC_TYPES.find(t => t.key === f.type) || DOC_TYPES[8]
                return (
                  <div key={f.id} className="file-row">
                    <div className="file-type-badge" style={{ background: type.color }}>
                      {type.label}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{f.name}</div>
                      <div className="muted small">
                        {f.is_latest ? <span className="latest-pill">ล่าสุด</span> : <span className="old-pill">เก่า</span>}
                        {' · '}
                        {f.uploader_name || 'ผู้ใช้'}
                        {' · '}
                        {new Date(f.created_at).toLocaleDateString('th-TH')}
                        {' · '}
                        {f.size || 0} KB
                      </div>
                    </div>
                    <div className="file-actions">
                      <button onClick={() => handleDownload(f)} className="btn-icon" title="ดาวน์โหลด">
                        ⬇️
                      </button>
                      <button onClick={() => handleDelete(f)} className="btn-icon danger" title="ลบ">
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <div className="muted small">{filtered.length} / {files.length} ไฟล์</div>
          <button onClick={handleDeleteProject} className="btn-text-danger">
            🗑️ ลบโครงการ
          </button>
        </div>
      </aside>
    </>
  )
}

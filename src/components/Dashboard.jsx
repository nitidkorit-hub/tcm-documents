import { useState, useEffect } from 'react'
import { fetchProjects, fetchFiles, fetchLatestFiles } from '../api/supabase.js'

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

export default function Dashboard({ onSelectProject, refreshKey }) {
  const [projects, setProjects] = useState([])
  const [allFiles, setAllFiles] = useState([])
  const [recentFiles, setRecentFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [refreshKey])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [projectsData, recentData] = await Promise.all([
        fetchProjects(),
        fetchLatestFiles(8)
      ])
      setProjects(projectsData)
      setRecentFiles(recentData)

      // Get file counts per project
      const filesPromises = projectsData.map(p => fetchFiles(p.id))
      const filesArrays = await Promise.all(filesPromises)
      const allFilesFlat = filesArrays.flat()
      setAllFiles(allFilesFlat)
    } catch (err) {
      setError(err.message || 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const totalFiles = allFiles.length
  const totalSize = allFiles.reduce((sum, f) => sum + (f.size || 0), 0)
  const last7days = allFiles.filter(f => {
    const created = new Date(f.created_at)
    const diff = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length

  const filesByType = {}
  DOC_TYPES.filter(t => t.key !== 'all').forEach(t => {
    filesByType[t.key] = allFiles.filter(f => f.type === t.key).length
  })
  const maxTypeCount = Math.max(...Object.values(filesByType), 1)

  const projectFileCounts = {}
  projects.forEach(p => {
    projectFileCounts[p.id] = allFiles.filter(f => f.project_id === p.id).length
  })

  if (loading) {
    return (
      <div className="center-pad">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {error && <div className="alert">{error}</div>}

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E6F8EC' }}>📁</div>
          <div>
            <div className="stat-label">โครงการทั้งหมด</div>
            <div className="stat-value">{projects.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F0F9' }}>📄</div>
          <div>
            <div className="stat-label">ไฟล์ทั้งหมด</div>
            <div className="stat-value">{totalFiles}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF7E6' }}>⚡</div>
          <div>
            <div className="stat-label">เพิ่มใหม่ 7 วัน</div>
            <div className="stat-value">{last7days}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F5E8FF' }}>💾</div>
          <div>
            <div className="stat-label">พื้นที่ใช้งาน</div>
            <div className="stat-value">{(totalSize / 1024).toFixed(1)} MB</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Projects */}
        <div className="card">
          <div className="card-header">
            <h2>📁 โครงการ ({projects.length})</h2>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มีโครงการ</p>
              <p className="muted small">คลิก "➕ โครงการใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="project-list">
              {projects.map(p => (
                <div
                  key={p.id}
                  className="project-item"
                  onClick={() => onSelectProject(p)}
                >
                  <div className="project-color" style={{ background: p.color || '#3A6EA5' }}></div>
                  <div className="project-info">
                    <div className="project-name">{p.name}</div>
                    <div className="project-meta">
                      <span className="badge">{p.code}</span>
                      <span className="muted small">{p.client || ''}</span>
                    </div>
                  </div>
                  <div className="project-stats">
                    <div className="file-count">{projectFileCounts[p.id] || 0}</div>
                    <div className="muted small">ไฟล์</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type distribution */}
        <div className="card">
          <div className="card-header">
            <h2>📊 สัดส่วนเอกสาร</h2>
          </div>
          <div className="dtype-bar">
            {DOC_TYPES.filter(t => t.key !== 'all').map(t => {
              const count = filesByType[t.key] || 0
              const percent = (count / maxTypeCount) * 100
              return (
                <div key={t.key} className="dtype-row">
                  <div className="dtype-lab">{t.label}</div>
                  <div className="dtype-track">
                    <div
                      className="dtype-fill"
                      style={{ width: percent + '%', background: t.color }}
                    ></div>
                  </div>
                  <div className="dtype-n">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent files */}
      <div className="card">
        <div className="card-header">
          <h2>📈 ไฟล์ล่าสุด</h2>
        </div>
        {recentFiles.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีไฟล์</p>
            <p className="muted small">คลิก "📤 อัปโหลด" เพื่อเพิ่มไฟล์</p>
          </div>
        ) : (
          <div className="recent-files">
            {recentFiles.map(f => {
              const type = DOC_TYPES.find(t => t.key === f.type) || DOC_TYPES[8]
              return (
                <div key={f.id} className="recent-file-item">
                  <div className="file-type-badge" style={{ background: type.color }}>
                    {type.label}
                  </div>
                  <div className="file-info">
                    <div className="file-name">{f.name}</div>
                    <div className="muted small">
                      โดย {f.uploader_name || 'ผู้ใช้'} · {new Date(f.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="muted small">{(f.size || 0)} KB</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

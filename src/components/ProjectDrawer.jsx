import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { useToast } from './Toast.jsx'
import { fetchFiles, deleteFile, downloadFile, deleteProject } from '../api/supabase.js'
import { fmtSize, fmtDate, normalizeFile, computeIsLatest, TYPE_LABEL, TYPE_COLOR, TYPE_BG, TYPE_TEXT } from '../utils/format.js'

function FileRow({ file, onDelete, onDownload }) {
  const toast = useToast()
  const color = TYPE_COLOR[file.type] || '#6B7280'
  const label = TYPE_LABEL[file.type] || file.type
  return (
    <div className="file-row">
      <div className="file-ico" style={{ background: color }}>
        {label.length > 3 ? label.slice(0, 3) : label}
      </div>
      <div className="file-meta">
        <div className="fn">{file.name}</div>
        <div className="info">
          <span>{(file.ext || '').toUpperCase()} · {fmtSize(file.size)}</span>
          <span>{fmtDate(file.date)}</span>
          {file.uploader && <span>โดย {file.uploader}</span>}
        </div>
      </div>
      <div>
        {file.isLatest ? (
          <span className="badge badge-latest">ล่าสุด</span>
        ) : (
          <span className="badge badge-old">เก่า</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="icon-btn" title="ดูตัวอย่าง" onClick={() => toast('Preview ยังไม่รองรับ', 'err')}>
          <Icon name="eye" size={15} />
        </button>
        <button className="icon-btn" title="ดาวน์โหลด" onClick={() => onDownload(file)}>
          <Icon name="download" size={15} />
        </button>
        <button
          className="icon-btn danger"
          title="ลบ"
          onClick={() => {
            if (window.confirm(`ลบไฟล์ "${file.name}" ?`)) onDelete(file)
          }}
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
  )
}

export default function ProjectDrawer({ project, onClose, onChanged }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showLatestOnly, setShowLatestOnly] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!project) return
    load()
  }, [project])

  const load = async () => {
    setLoading(true)
    try {
      const rows = await fetchFiles(project.id)
      const normalized = rows.map(normalizeFile)
      computeIsLatest(normalized)
      setFiles(normalized)
    } catch (err) {
      toast('โหลดไฟล์ไม่สำเร็จ: ' + err.message, 'err')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.id, file.name)
      toast(`ดาวน์โหลด ${file.name}`)
    } catch (err) {
      toast('ดาวน์โหลดไม่สำเร็จ', 'err')
    }
  }

  const handleDelete = async (file) => {
    try {
      await deleteFile(file.id)
      toast('ลบไฟล์เรียบร้อย')
      await load()
      onChanged?.()
    } catch (err) {
      toast('ลบไม่สำเร็จ', 'err')
    }
  }

  const handleDeleteProject = async () => {
    if (!window.confirm(`ลบโครงการ "${project.name}" และไฟล์ทั้งหมด?`)) return
    try {
      await deleteProject(project.id)
      toast('ลบโครงการเรียบร้อย')
      onChanged?.()
      onClose()
    } catch (err) {
      toast('ลบโครงการไม่สำเร็จ', 'err')
    }
  }

  if (!project) return null

  // group by baseName + type
  const groups = {}
  files.forEach((f) => {
    const k = `${f.type}|${f.baseName}`
    if (!groups[k]) groups[k] = []
    groups[k].push(f)
  })
  Object.values(groups).forEach((g) => g.sort((a, b) => new Date(b.date) - new Date(a.date)))

  const typesInProject = Array.from(new Set(files.map((f) => f.type)))
  const types = ['all', ...typesInProject]

  const filteredKeys = Object.keys(groups).filter((k) => {
    const [type, baseName] = k.split('|')
    if (filter !== 'all' && type !== filter) return false
    if (search && !baseName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalSize = files.reduce((s, f) => s + (f.size || 0), 0)

  return (
    <>
      <div className="drawer-bd" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div className="top">
            <div
              style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 999,
                fontSize: 11,
                fontFamily: 'Prompt',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              {project.code} · {project.status || 'active'}
            </div>
            <button className="close" onClick={onClose}>
              <Icon name="close" size={20} />
            </button>
          </div>
          <h2>{project.name}</h2>
          <div className="info">
            {project.client && (
              <span>
                <Icon name="building" size={13} /> {project.client}
              </span>
            )}
            <span>
              <Icon name="file" size={13} /> {files.length} ไฟล์
            </span>
            <span>
              <Icon name="layers" size={13} /> {fmtSize(totalSize)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn btn-sm btn-primary" onClick={() => toast('Zip ทั้งโครงการ ยังไม่รองรับ', 'err')}>
              <Icon name="zip" size={13} /> Zip ทั้งโครงการ
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              onClick={() => toast('Zip เฉพาะล่าสุด ยังไม่รองรับ', 'err')}
            >
              <Icon name="bolt" size={13} /> Zip เฉพาะล่าสุด
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: 'rgba(229,72,77,0.2)',
                color: 'white',
                border: '1px solid rgba(229,72,77,0.4)',
                marginLeft: 'auto',
              }}
              onClick={handleDeleteProject}
            >
              <Icon name="trash" size={13} /> ลบโครงการ
            </button>
          </div>
        </div>

        <div className="drawer-tools">
          <div className="drawer-search">
            <Icon name="search" size={15} style={{ color: 'var(--gray-500)' }} />
            <input
              placeholder="ค้นหาในเอกสาร..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`filter-chip ${showLatestOnly ? 'on' : ''}`}
            onClick={() => setShowLatestOnly((s) => !s)}
            title="แสดง Version ล่าสุดเท่านั้น"
          >
            <Icon name="bolt" size={11} /> ล่าสุด
          </button>
        </div>

        <div className="drawer-tools" style={{ borderTop: 0, paddingTop: 0, flexWrap: 'wrap' }}>
          {types.map((t) => (
            <button key={t} className={`filter-chip ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>
              {t === 'all' ? 'ทั้งหมด' : TYPE_LABEL[t] || t}
            </button>
          ))}
        </div>

        <div className="drawer-body">
          {loading ? (
            <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
              <div className="spinner"></div>
            </div>
          ) : filteredKeys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>
              <Icon name="file" size={28} />
              <div style={{ marginTop: 8 }}>
                {files.length === 0 ? 'ยังไม่มีเอกสารในโครงการนี้' : 'ไม่พบเอกสารที่ตรงกับเงื่อนไข'}
              </div>
            </div>
          ) : (
            filteredKeys.map((k) => {
              const grp = groups[k]
              const [type, baseName] = k.split('|')
              const shown = showLatestOnly ? grp.slice(0, 1) : grp
              return (
                <div className="version-group" key={k}>
                  <div className="vg-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        className="badge"
                        style={{ padding: '3px 10px', background: TYPE_BG[type], color: TYPE_TEXT[type] }}
                      >
                        {TYPE_LABEL[type] || type}
                      </span>
                      <span style={{ fontFamily: 'Prompt' }}>{baseName}</span>
                    </div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 12 }}>
                      {grp.length} version{grp.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="vg-body">
                    {shown.map((f) => (
                      <FileRow key={f.id} file={f} onDelete={handleDelete} onDownload={handleDownload} />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

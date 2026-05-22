// Format helpers
export const fmtSize = (kb) => {
  if (!kb && kb !== 0) return '0 KB'
  if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB'
  return Math.round(kb) + ' KB'
}

export const fmtDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  const diff = Math.floor((Date.now() - dt) / 86400000)
  if (diff === 0) return 'วันนี้'
  if (diff === 1) return 'เมื่อวาน'
  if (diff < 7) return `${diff} วันก่อน`
  if (diff < 30) return `${Math.floor(diff / 7)} สัปดาห์ก่อน`
  if (diff < 365) return `${Math.floor(diff / 30)} เดือนก่อน`
  return `${Math.floor(diff / 365)} ปีก่อน`
}

// Document type mapping: English DB key <-> Thai display label
export const TYPE_KEYS = ['eia', 'drawing', 'contract', 'labor', 'standard', 'mom', 'boq', 'other']

export const TYPE_LABEL = {
  eia: 'EIA',
  drawing: 'แบบ',
  contract: 'สัญญา',
  labor: 'แรงงาน',
  standard: 'มาตรฐาน',
  mom: 'MOM',
  boq: 'ราคา',
  other: 'อื่นๆ',
}

export const TYPE_COLOR = {
  eia: '#2DBE60',
  drawing: '#3A6EA5',
  contract: '#6E56CF',
  labor: '#F5A623',
  standard: '#0EA5E9',
  mom: '#EC4899',
  boq: '#DC2626',
  other: '#6B7280',
}

export const TYPE_BG = {
  eia: 'rgba(45,190,96,0.12)',
  drawing: 'rgba(58,110,165,0.12)',
  contract: 'rgba(110,86,207,0.12)',
  labor: 'rgba(245,166,35,0.14)',
  standard: 'rgba(14,165,233,0.12)',
  mom: 'rgba(236,72,153,0.12)',
  boq: 'rgba(220,38,38,0.12)',
  other: 'rgba(107,114,128,0.12)',
}

export const TYPE_TEXT = {
  eia: '#1F8E48',
  drawing: '#3A6EA5',
  contract: '#6E56CF',
  labor: '#C77F00',
  standard: '#0284C7',
  mom: '#DB2777',
  boq: '#B91C1C',
  other: '#6B7280',
}

// Auto-detect document type from filename
export const detectType = (filename) => {
  const f = (filename || '').toLowerCase()
  if (/eia|สิ่งแวดล้อม|environment|impact/.test(f)) return 'eia'
  if (/แบบ|drawing|plan|dwg|blueprint|สถาปัตย์|โครงสร้าง/.test(f)) return 'drawing'
  if (/สัญญา|contract|agreement/.test(f)) return 'contract'
  if (/แรงงาน|labor|worker|safety|ปลอดภัย/.test(f)) return 'labor'
  if (/มยผ|มาตรฐาน|standard|spec/.test(f)) return 'standard'
  if (/mom|minutes|รายงานประชุม|meeting|ประชุม/.test(f)) return 'mom'
  if (/ราคา|boq|ประมาณการ|cost|budget/.test(f)) return 'boq'
  return 'other'
}

export const detectVersion = (filename) => {
  if (!filename) return null
  const m = filename.match(/(rev\s*\d+|v\d+|\d{4}-\d{2}-\d{2})/i)
  return m ? m[0] : null
}

// Strip version and extension to derive baseName
export const deriveBaseName = (filename) => {
  if (!filename) return ''
  return filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_\s-]*(rev\s*\d+|v\d+|\d{4}-\d{2}-\d{2})/i, '')
}

// Convert Supabase file row -> UI file
export const normalizeFile = (row) => ({
  id: row.id,
  projectId: row.project_id,
  type: row.type || 'other',
  name: row.name,
  baseName: row.base_name || deriveBaseName(row.name),
  rev: row.rev || detectVersion(row.name),
  date: row.created_at?.slice(0, 10) || '',
  ext: (row.ext || row.name?.split('.').pop() || '').toLowerCase(),
  size: row.size || 0,
  uploader: row.uploader_name || '',
  isLatest: !!row.is_latest,
  storagePath: row.storage_path,
  contentText: row.content_text || '',
})

// Compute isLatest grouping (in-memory)
export const computeIsLatest = (files) => {
  const groups = {}
  files.forEach((f) => {
    const k = `${f.projectId}|${f.type}|${f.baseName}`
    ;(groups[k] = groups[k] || []).push(f)
  })
  Object.values(groups).forEach((g) => {
    g.sort((a, b) => new Date(b.date) - new Date(a.date))
    g.forEach((f, i) => {
      f.isLatest = i === 0
    })
  })
  return files
}

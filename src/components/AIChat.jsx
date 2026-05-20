import { useState, useRef, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useToast } from './Toast.jsx'
import { fmtDate, fmtSize, TYPE_LABEL, normalizeFile, computeIsLatest } from '../utils/format.js'
import { fetchProjects, fetchFiles, downloadFile } from '../api/supabase.js'

// Rule-based AI assistant — works without external API
// Returns { intent, reply, fileName, projectCode, fileId, files: [] }
function processQuery(text, ctx) {
  const t = text.toLowerCase().trim()
  const { projects, files } = ctx

  if (!text) {
    return { intent: 'answer', reply: 'กรุณาพิมพ์คำถามครับ' }
  }

  // 1) Greeting / help
  if (/^(สวัสดี|hello|hi|hey|help|ช่วย)/i.test(t)) {
    return {
      intent: 'answer',
      reply: `สวัสดีครับ ระบบมี ${projects.length} โครงการ ${files.length} ไฟล์\nลองถามได้เช่น:\n• "หา BOQ ล่าสุดของ ABC"\n• "ขอแบบทั้งหมดในโครงการ MRT"\n• "มี MOM กี่ฉบับ"`,
    }
  }

  // 2) Find project: try code match (most specific first)
  let matchProject = null
  const sortedByCodeLen = [...projects].sort((a, b) => (b.code || '').length - (a.code || '').length)
  for (const p of sortedByCodeLen) {
    const code = (p.code || '').toLowerCase()
    if (code && t.includes(code)) {
      matchProject = p
      break
    }
  }
  // Fuzzy: any 3+ char substring of project code matches
  if (!matchProject) {
    for (const p of projects) {
      const code = (p.code || '').toLowerCase()
      if (code && code.length >= 3) {
        const root = code.split('-')[0]
        if (root.length >= 2 && t.includes(root)) {
          matchProject = p
          break
        }
      }
    }
  }
  // Match by name (first significant word)
  if (!matchProject) {
    for (const p of projects) {
      const name = (p.name || '').toLowerCase()
      const words = name.split(/\s+/).filter((w) => w.length >= 3)
      if (words.some((w) => t.includes(w))) {
        matchProject = p
        break
      }
    }
  }

  // 3) Find type
  let matchType = null
  for (const [key, label] of Object.entries(TYPE_LABEL)) {
    if (t.includes(key) || t.includes(label.toLowerCase())) {
      matchType = key
      break
    }
  }

  // 4) Filename keyword match (e.g., "boq.pdf")
  const filenameKw = (t.match(/[฀-๿a-z0-9_-]{3,}\.[a-z]{2,5}/i) || [])[0]

  // 5) Intent: ZIP
  if (/zip|รวม|ดาวน์โหลดทั้ง|download all/i.test(text)) {
    if (matchProject) {
      return {
        intent: 'download_zip',
        reply: `จะรวมไฟล์โครงการ ${matchProject.code} (${matchProject.name}) เป็น Zip ให้ครับ`,
        projectCode: matchProject.code,
      }
    }
    return { intent: 'answer', reply: 'กรุณาระบุชื่อหรือรหัสโครงการที่ต้องการ Zip ครับ' }
  }

  // 6) Intent: COUNT
  if (/กี่|จำนวน|มี.*ไฟล์|how many|count/i.test(text)) {
    let list = files
    let scope = []
    if (matchProject) {
      list = list.filter((f) => f.projectId === matchProject.id)
      scope.push(`โครงการ ${matchProject.code}`)
    }
    if (matchType) {
      list = list.filter((f) => f.type === matchType)
      scope.push(`ประเภท "${TYPE_LABEL[matchType]}"`)
    }
    const latestCount = list.filter((f) => f.isLatest).length
    return {
      intent: 'answer',
      reply: `${scope.length ? scope.join(' · ') + ' ' : 'ระบบ'}มีไฟล์ทั้งหมด ${list.length} ฉบับ (Version ล่าสุด ${latestCount} ฉบับ)`,
    }
  }

  // 7) Intent: LIST/FIND
  // Filter candidates by criteria
  let candidates = files
  const scope = []
  if (matchProject) {
    candidates = candidates.filter((f) => f.projectId === matchProject.id)
    scope.push(`โครงการ ${matchProject.code}`)
  }
  if (matchType) {
    candidates = candidates.filter((f) => f.type === matchType)
    scope.push(`ประเภท "${TYPE_LABEL[matchType]}"`)
  }
  if (filenameKw) {
    candidates = candidates.filter((f) => f.name.toLowerCase().includes(filenameKw.toLowerCase()))
    scope.push(`ที่มีชื่อ "${filenameKw}"`)
  }

  // Decide between latest-only or all
  const wantLatest = /ล่าสุด|latest|new|ใหม่/i.test(text) || (!filenameKw && !/ทั้งหมด|all|every|ทุก/i.test(text))
  const wantAll = /ทั้งหมด|all|every|ทุก/i.test(text)

  let resultFiles = candidates
  if (wantLatest && !wantAll) {
    resultFiles = resultFiles.filter((f) => f.isLatest)
  }

  // Sort by date desc
  resultFiles = [...resultFiles].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (resultFiles.length === 0) {
    if (candidates.length === 0) {
      return {
        intent: 'answer',
        reply: scope.length
          ? `ไม่พบไฟล์${scope.length ? ` (${scope.join(' · ')})` : ''}ครับ`
          : 'ไม่พบไฟล์ที่ตรงเงื่อนไขครับ ลองระบุชื่อโครงการหรือประเภทเอกสารดูครับ',
      }
    }
    // Has candidates but not latest
    resultFiles = candidates.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  if (resultFiles.length === 1) {
    const f = resultFiles[0]
    return {
      intent: 'list',
      reply: `เจอไฟล์ ${scope.length ? `(${scope.join(' · ')})` : ''}:`,
      files: [f],
    }
  }

  const limit = 5
  const shown = resultFiles.slice(0, limit)
  const moreText = resultFiles.length > limit ? ` (แสดง ${limit} จาก ${resultFiles.length} ไฟล์)` : ''

  return {
    intent: 'list',
    reply: `เจอ ${resultFiles.length} ไฟล์${scope.length ? ` (${scope.join(' · ')})` : ''}${moreText}:`,
    files: shown,
  }
}

export default function AIChat({ open, onClose }) {
  const [msgs, setMsgs] = useState([
    {
      role: 'bot',
      text: 'สวัสดีครับ ผมเป็น AI Document Agent ผมช่วยค้นหาเอกสาร, ดาวน์โหลดไฟล์, หรือตอบคำถามเกี่ยวกับโครงการของคุณได้ครับ ลองพิมพ์คำสั่งดูเลย',
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [ctx, setCtx] = useState({ projects: [], files: [] })
  const endRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    if (!open) return
    loadContext()
  }, [open])

  useEffect(() => {
    endRef.current?.scrollTo(0, 99999)
  }, [msgs, thinking])

  const loadContext = async () => {
    try {
      const projects = await fetchProjects()
      const allFiles = []
      for (const p of projects) {
        const rows = await fetchFiles(p.id)
        rows.forEach((r) => allFiles.push(normalizeFile(r)))
      }
      computeIsLatest(allFiles)
      setCtx({ projects, files: allFiles })
    } catch (err) {
      console.error('load ctx:', err)
    }
  }

  const suggestions = [
    'หาไฟล์ล่าสุดทั้งหมด',
    'มีกี่โครงการ',
    'ดูเอกสารทั้งหมดในโครงการ ABC',
  ]

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim()
    if (!text || thinking) return
    setInput('')
    setMsgs((m) => [...m, { role: 'user', text }])
    setThinking(true)

    await new Promise((r) => setTimeout(r, 500))

    const result = processQuery(text, ctx)
    setThinking(false)
    setMsgs((m) => [
      ...m,
      {
        role: 'bot',
        text: result.reply,
        intent: result.intent,
        fileName: result.fileName,
        projectCode: result.projectCode,
        fileId: result.fileId,
        files: result.files || [],
      },
    ])
  }

  const triggerDownload = async (fileId, fileName) => {
    try {
      await downloadFile(fileId, fileName)
      toast(`ดาวน์โหลด ${fileName}`)
    } catch (err) {
      toast('ดาวน์โหลดไม่สำเร็จ', 'err')
    }
  }

  const triggerZip = (projectCode) => {
    toast(`Zip โครงการ ${projectCode} ยังไม่รองรับ`, 'err')
  }

  if (!open) return null

  return (
    <div className="chat-panel">
      <div className="chat-head">
        <div className="ico">
          <Icon name="sparkles" size={18} />
        </div>
        <div>
          <div className="ttl">ถามหาเอกสาร</div>
          <div className="sub">AI Assistant · พร้อมตอบเสมอ</div>
        </div>
        <button className="close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="chat-msgs" ref={endRef}>
        {msgs.map((m, i) => (
          <div className={`msg ${m.role}`} key={i}>
            <div className="bubble">
              <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
              {m.intent === 'list' && m.files && m.files.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {m.files.map((f) => (
                    <div
                      key={f.id}
                      className="file-pill"
                      onClick={() => triggerDownload(f.id, f.name)}
                      style={{ marginTop: 0 }}
                    >
                      <Icon name="download" size={14} style={{ color: 'var(--green)' }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="nm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>
                          {TYPE_LABEL[f.type] || f.type} · {fmtSize(f.size)} · {fmtDate(f.date)}
                          {f.isLatest && ' · ล่าสุด'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {m.intent === 'download_single' && m.fileId && (
                <div className="file-pill" onClick={() => triggerDownload(m.fileId, m.fileName)}>
                  <Icon name="download" size={14} style={{ color: 'var(--green)' }} />
                  <span className="nm">ดาวน์โหลด: {m.fileName}</span>
                </div>
              )}
              {m.intent === 'download_zip' && m.projectCode && (
                <div className="file-pill" onClick={() => triggerZip(m.projectCode)}>
                  <Icon name="zip" size={14} style={{ color: 'var(--green)' }} />
                  <span className="nm">ดาวน์โหลด Zip: {m.projectCode}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="msg bot">
            <div className="bubble">
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {msgs.length === 1 && !thinking && (
          <div className="chat-suggest">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          placeholder="พิมพ์คำถาม เช่น หา BOQ ล่าสุดของ ABC..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button onClick={() => send()} disabled={thinking || !input.trim()}>
          <Icon name="send" size={16} />
        </button>
      </div>
    </div>
  )
}

export function ChatFab({ onClick }) {
  return (
    <button className="chat-fab" onClick={onClick} title="ถามหาเอกสาร">
      <Icon name="sparkles" size={22} />
    </button>
  )
}

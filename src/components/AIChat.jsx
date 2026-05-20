import { useState, useRef, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useToast } from './Toast.jsx'
import { fmtDate, TYPE_LABEL, normalizeFile, computeIsLatest } from '../utils/format.js'
import { fetchProjects, fetchFiles, downloadFile } from '../api/supabase.js'

// Rule-based AI assistant — works without external API
// Returns { intent, reply, fileName, projectCode, fileId }
function processQuery(text, ctx) {
  const t = text.toLowerCase()
  const { projects, files } = ctx

  // Find project: try code first, then partial name match
  let matchProject = null
  for (const p of projects) {
    const code = (p.code || '').toLowerCase()
    if (code && (t.includes(code) || code.includes(t.replace(/\s/g, '')))) {
      matchProject = p
      break
    }
  }
  if (!matchProject) {
    for (const p of projects) {
      const name = (p.name || '').toLowerCase()
      if (name && name.length > 2 && t.includes(name.slice(0, Math.min(4, name.length)))) {
        matchProject = p
        break
      }
    }
  }

  // Find type
  let matchType = null
  for (const [key, label] of Object.entries(TYPE_LABEL)) {
    if (t.includes(key) || t.includes(label.toLowerCase())) {
      matchType = key
      break
    }
  }

  // Intent: zip
  if (/zip|รวม|ดาวน์โหลดทั้ง|download all/i.test(text)) {
    if (matchProject) {
      return {
        intent: 'download_zip',
        reply: `จะรวมไฟล์โครงการ ${matchProject.code} (${matchProject.name}) เป็น Zip ให้ครับ`,
        projectCode: matchProject.code,
      }
    }
    return {
      intent: 'answer',
      reply: 'กรุณาระบุชื่อหรือรหัสโครงการที่ต้องการ Zip ครับ',
    }
  }

  // Intent: count
  if (/กี่|จำนวน|มี.*ไฟล์|how many/i.test(text)) {
    if (matchType) {
      const list = matchProject ? files.filter((f) => f.projectId === matchProject.id && f.type === matchType) : files.filter((f) => f.type === matchType)
      return {
        intent: 'answer',
        reply: `มีไฟล์ประเภท "${TYPE_LABEL[matchType]}" ทั้งหมด ${list.length} ฉบับ${matchProject ? ` ในโครงการ ${matchProject.code}` : ''}ครับ`,
      }
    }
    if (matchProject) {
      const list = files.filter((f) => f.projectId === matchProject.id)
      return {
        intent: 'answer',
        reply: `โครงการ ${matchProject.code} มีไฟล์ทั้งหมด ${list.length} ฉบับครับ`,
      }
    }
    return {
      intent: 'answer',
      reply: `ระบบมีไฟล์ทั้งหมด ${files.length} ฉบับ ใน ${projects.length} โครงการครับ`,
    }
  }

  // Intent: find/download latest
  if (/หา|find|ดาวน์โหลด|download|เอา|ขอ/i.test(text) || matchType) {
    const candidates = files.filter((f) => {
      if (matchProject && f.projectId !== matchProject.id) return false
      if (matchType && f.type !== matchType) return false
      return true
    })
    const latests = candidates.filter((f) => f.isLatest)
    if (latests.length === 0) {
      return {
        intent: 'answer',
        reply: 'ไม่พบไฟล์ที่ตรงกับเงื่อนไขครับ',
      }
    }
    if (latests.length === 1) {
      return {
        intent: 'download_single',
        reply: `เจอไฟล์: ${latests[0].name} (Version ล่าสุด, ${fmtDate(latests[0].date)})`,
        fileName: latests[0].name,
        fileId: latests[0].id,
      }
    }
    return {
      intent: 'answer',
      reply: `เจอ ${latests.length} ไฟล์ตรงเงื่อนไข — ลองระบุโครงการหรือประเภทที่ชัดเจนกว่านี้ครับ`,
    }
  }

  return {
    intent: 'answer',
    reply: 'ผมสามารถช่วยค้นหาเอกสาร, ดาวน์โหลด, หรือบอกจำนวนไฟล์ในโครงการได้ครับ ลองพิมพ์ "หา EIA ล่าสุดของ MRT-PP" ดู',
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

  const suggestions = ['หา EIA ล่าสุดของ MRT-PP', 'รวม Zip โครงการ ABC', 'มี MOM กี่ฉบับ?']

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim()
    if (!text || thinking) return
    setInput('')
    setMsgs((m) => [...m, { role: 'user', text }])
    setThinking(true)

    // Simulate thinking time
    await new Promise((r) => setTimeout(r, 600))

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
          <div className="sub">Claude Haiku 4.5 · พร้อมตอบเสมอ</div>
        </div>
        <button className="close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="chat-msgs" ref={endRef}>
        {msgs.map((m, i) => (
          <div className={`msg ${m.role}`} key={i}>
            <div className="bubble">
              {m.text}
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

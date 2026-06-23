import { useState, useEffect, useMemo, useRef } from 'react'
import Icon from './Icon.jsx'
import { useToast } from './Toast.jsx'
import { fetchFiles, uploadFile } from '../api/supabase.js'
import { normalizeFile } from '../utils/format.js'
import { TEAM_OM_LOGO } from '../assets/teamLogo.js'

// ---------- helpers ----------
const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const TH_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const toThaiDate = (iso) => {
  const d = new Date(iso)
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}
const toThaiDateLine = (iso) => {
  const d = new Date(iso)
  return `วัน${TH_DAYS[d.getDay()]}ที่ ${d.getDate()} ${TH_MONTHS[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`
}

// Fixed 5-topic agenda — matches the company's standard MOM template exactly
// (locked by request: topics/order never change, AI only fills content per topic)
const TOPIC_DEFS = [
  { no: 1, topic: 'รับรองรายงานการประชุม' },
  { no: 2, topic: 'เรื่องแจ้งเพื่อทราบ' },
  { no: 3, topic: 'เรื่องติดตาม' },
  { no: 4, topic: 'เรื่องนำเสนอและเพิ่มเติมอื่นๆ' },
  { no: 5, topic: 'ประชุมครั้งถัดไป' },
]
const escapeHtml = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const fmtMMSS = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

const nextMeetingNo = (files) => {
  const momFiles = files.filter((f) => f.type === 'mom')
  let maxNo = 0
  momFiles.forEach((f) => {
    const m = f.baseName && f.baseName.match(/(\d+)/)
    if (m) maxNo = Math.max(maxNo, parseInt(m[1], 10))
  })
  return maxNo > 0 ? maxNo + 1 : momFiles.length + 1
}

const latestMOM = (files) =>
  files.find((f) => f.type === 'mom' && f.isLatest) ||
  files.filter((f) => f.type === 'mom').sort((a, b) => new Date(b.date) - new Date(a.date))[0] ||
  null

const buildGlossary = (proj, files) => {
  const terms = new Set([proj.code])
  files.forEach((f) => {
    const clean = (f.baseName || '').replace(/_/g, ' ').replace(/-/g, ' ').trim()
    clean.split(/\s+/).forEach((w) => {
      if (w.length > 3 && !/^\d+$/.test(w)) terms.add(w)
    })
  })
  return Array.from(terms).slice(0, 9)
}

// ---------- document builder (shared by preview + export) ----------
// Matches the company's real MOM template exactly: title/date/location header
// (no org/project line), single วาระ table, one recorder signature, attendee
// list as a numbered table on its own page.
const buildDocInner = (mom, meta, screenshots = [], recorderName = '') => {
  const header = `
  <div class="doc-header">
    <img class="doc-logo" src="${TEAM_OM_LOGO}" alt="logo" />
    <div class="doc-title">${escapeHtml(mom.meetingName)}</div>
    <div class="doc-datetime">${escapeHtml(mom.dateTimeLine)}</div>
    <div class="doc-location">สถานที่ประชุม : ${escapeHtml(mom.location)}</div>
  </div>
  ${mom._fallback ? `<div class="doc-fallback-warn">⚠ AI ไม่พร้อมใช้งานตอนสร้างรายงานนี้ — เนื้อหาเป็นสรุปพื้นฐานอัตโนมัติ ยังไม่ผ่านการตรวจสอบ</div>` : ''}`

  const agendaRows = (mom.agenda || [])
    .map((t) => {
      const items = (t.items || []).filter((it) => (it.detail || '').trim())
      if (!items.length) {
        return `<tr><td class="vno">${escapeHtml(t.no)}</td><td class="vtopic">${escapeHtml(t.topic)}</td><td class="c">-</td><td class="c">-</td><td class="c">-</td></tr>`
      }
      const head = `<tr><td class="vno">${escapeHtml(t.no)}</td><td class="vtopic">${escapeHtml(t.topic)}</td><td></td><td></td><td></td></tr>`
      const rows = items
        .map(
          (it) => `
        <tr>
          <td></td>
          <td class="detail">- ${escapeHtml(it.detail).replace(/\n/g, '<br/>- ')}</td>
          <td class="c">${escapeHtml(it.responsible || '-')}</td>
          <td class="c">${escapeHtml(it.due || '-')}</td>
          <td class="c">${escapeHtml(it.status || '-')}</td>
        </tr>`
        )
        .join('')
      return head + rows
    })
    .join('')

  const shots = (screenshots || [])
    .map(
      (s) => `
    <div class="doc-shot">
      <img src="${s.dataUrl}" alt="screenshot" />
      ${s.caption ? `<div class="cap">${escapeHtml(s.caption)}</div>` : ''}
    </div>`
    )
    .join('')

  const attendeeRows = (mom.attendees || [])
    .map((a, i) => `<tr><td class="c">${i + 1}</td><td>${escapeHtml(a)}</td></tr>`)
    .join('')

  return `
  ${header}

  <table class="doc-table">
    <thead>
      <tr><th rowspan="2">วาระ</th><th rowspan="2">รายละเอียด</th><th rowspan="2">ผู้ดำเนินการ</th><th colspan="2">กำหนดแล้วเสร็จ</th></tr>
      <tr><th>กำหนด</th><th>แล้วเสร็จ</th></tr>
    </thead>
    <tbody>${agendaRows}</tbody>
  </table>

  <div class="doc-closing">ปิดการประชุมเวลา ${escapeHtml(mom.closingTime)}</div>

  ${shots ? `<h4 class="doc-sec">ภาพหน้าจอประกอบการประชุม</h4><div class="doc-shots">${shots}</div>` : ''}

  <div class="doc-recorder">
    <div class="role">ผู้บันทึกประชุม</div>
    <div class="name">${escapeHtml(recorderName)}</div>
  </div>
  <div class="doc-footer">Page 1 of 2</div>

  <div class="doc-page-break"></div>
  ${header}
  <h4 class="doc-sec">รายชื่อผู้เข้าร่วมประชุม</h4>
  <table class="doc-attendee-table">
    <tbody>${attendeeRows || '<tr><td class="c">-</td><td>—</td></tr>'}</tbody>
  </table>
  <div class="doc-footer">Page 2 of 2</div>`
}

const DOC_FONT = `'Angsana New','AngsanaUPC','Norasi','Times New Roman',serif`
const EXPORT_CSS = `
body { font-family: ${DOC_FONT}; color:#000; font-size:15px; line-height:1.5; padding:24px 32px; }
.doc-header { position:relative; padding-right:90px; }
.doc-logo { position:absolute; top:-4px; right:0; width:72px; height:auto; }
.doc-title { text-align:center; font-family:${DOC_FONT}; font-weight:700; font-size:18px; margin:0 0 2px; }
.doc-datetime, .doc-location { text-align:center; font-family:${DOC_FONT}; font-weight:700; font-size:15px; margin:0; }
.doc-fallback-warn { margin:10px 0 0; padding:8px 12px; background:#FFF7E6; border:1px solid #F5A623; border-radius:6px; color:#92600C; font-size:13px; text-align:center; font-family:'Sarabun',sans-serif; }
h4.doc-sec { font-family:${DOC_FONT}; font-weight:700; font-size:16px; margin:18px 0 8px; }
table.doc-table { width:100%; border-collapse:collapse; font-size:14px; margin-top:14px; }
table.doc-table th { background:#1F3A5F; color:#fff; font-family:${DOC_FONT}; font-weight:700; padding:6px 8px; text-align:center; border:1px solid #1F3A5F; }
table.doc-table td { padding:6px 8px; border:1px solid #000; vertical-align:top; }
table.doc-table td.vno { text-align:center; font-weight:700; width:36px; }
table.doc-table td.vtopic { font-weight:700; }
table.doc-table td.detail { white-space:pre-line; }
table.doc-table td.c { text-align:center; white-space:nowrap; }
.doc-shots { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0 8px; }
.doc-shot { border:1px solid #E5E9EF; border-radius:8px; overflow:hidden; }
.doc-shot img { width:100%; display:block; }
.doc-shot .cap { font-size:13px; color:#6B7280; padding:6px 8px; border-top:1px solid #E5E9EF; font-family:'Sarabun',sans-serif; }
.doc-closing { font-weight:700; margin-top:14px; }
.doc-recorder { margin-top:48px; text-align:right; padding-right:24px; }
.doc-recorder .role { font-weight:700; font-size:15px; }
.doc-recorder .name { font-size:15px; margin-top:2px; }
.doc-footer { text-align:right; font-size:12px; color:#555; margin-top:24px; }
.doc-page-break { page-break-before: always; height:0; }
table.doc-attendee-table { width:100%; border-collapse:collapse; font-size:14px; margin-top:12px; }
table.doc-attendee-table td { padding:6px 10px; border:1px solid #E5E9EF; }
table.doc-attendee-table td.c { width:40px; text-align:center; color:#6B7280; }
`

// ---------- compose final doc model from raw AI output (or partial/no output) ----------
// Topics are always the fixed 5 from TOPIC_DEFS — only "items" content varies.
const composeMom = (raw, proj, meta) => {
  const usedFallback = !raw
  const itemsFor = (i) => {
    const key = `topic${i}Items`
    if (Array.isArray(raw?.[key])) return raw[key]
    if (usedFallback && i === 2) {
      return [
        {
          detail: meta.transcript
            ? meta.transcript.slice(0, 400)
            : 'ไม่มีข้อมูลเพียงพอจะสรุปอัตโนมัติ กรุณาตรวจ Transcript และสร้างรายงานใหม่',
          responsible: 'ALL',
          due: '-',
          status: 'รอตรวจสอบ',
        },
      ]
    }
    return []
  }
  const agenda = TOPIC_DEFS.map((t, i) => ({ ...t, items: itemsFor(i + 1) }))
  const timeRange = raw?.timeRange || '09.00 – 12.00 น.'
  const closingTime = raw?.closingTime || timeRange.split(/[–-]/).pop().trim()

  return {
    meetingName: raw?.meetingName || `${proj.name} – การประชุม`,
    dateTimeLine: `${toThaiDateLine(meta.today)} เวลา ${timeRange}`,
    location: raw?.location || 'ห้องประชุม',
    closingTime,
    agenda,
    attendees: Array.isArray(raw?.attendees) ? raw.attendees : [],
    _fallback: usedFallback,
  }
}

const buildPrompt = (transcript, proj, meta, formatRef, glossary) => {
  const styleHint = formatRef?.contentText
    ? `\nตัวอย่างโทนภาษา/ลีลาการเขียนจากรายงานก่อนหน้าของบริษัท (ใช้เป็นแนวทางโทนภาษาเท่านั้น ไม่ต้องคัดลอกเนื้อหา):\n"""\n${formatRef.contentText.slice(0, 1000)}\n"""`
    : ''

  return `คุณเป็นเลขานุการที่ประชุมมืออาชีพของบริษัทรับเหมาก่อสร้าง หน้าที่คือเรียบเรียง "บันทึกการประชุม (MOM)" ภาษาไทยที่เป็นทางการ จากบทถอดเสียงดิบ ตามฟอร์มมาตรฐานของบริษัทซึ่งมีวาระคงที่ 5 หัวข้อเสมอ (ห้ามเปลี่ยนชื่อหรือลำดับหัวข้อ ไม่ว่าเนื้อหาจะเป็นอย่างไร):
1. รับรองรายงานการประชุม
2. เรื่องแจ้งเพื่อทราบ
3. เรื่องติดตาม
4. เรื่องนำเสนอและเพิ่มเติมอื่นๆ
5. ประชุมครั้งถัดไป

บริบท: โครงการ ${proj.name} (เจ้าของงาน ${proj.client || '-'})
${styleHint}

ศัพท์เฉพาะ/ชื่อที่อาจถูกถอดเสียงผิด ให้ช่วยแก้ให้ถูก: ${glossary.join(', ')}

บทถอดเสียงดิบ:
"""
${transcript}
"""

งานของคุณ:
1) อ่าน transcript แล้วจัดแต่ละประเด็นเข้าหัวข้อวาระที่ตรงที่สุดจาก 5 หัวข้อข้างต้นเท่านั้น
2) แต่ละประเด็นในแต่ละวาระ ระบุ: รายละเอียด (detail, เรียบเรียงเป็นภาษาทางการ), ผู้รับผิดชอบ (responsible เช่น "ALL" หรือชื่อ/ฝ่ายที่เกี่ยวข้อง), กำหนดเสร็จ (due), สถานะ (status เช่น "บันทึก" = รับทราบ/ดำเนินการแล้ว หรือ "ยังไม่คืบหน้า" ถ้าเป็นเรื่องค้างที่ยังไม่จบ)
3) หัวข้อ "ประชุมครั้งถัดไป" ให้ใส่วันนัดครั้งหน้าเป็น 1 รายการถ้ามีพูดถึงใน transcript
4) หัวข้อที่ไม่มีเนื้อหาเกี่ยวข้องเลยใน transcript ให้ส่ง items เป็น array ว่าง []
5) ดึงชื่อการประชุม, ช่วงเวลา, สถานที่, และรายชื่อผู้เข้าร่วมประชุมจาก transcript ถ้ามีการพูดถึง

ตอบกลับเป็น JSON อย่างเดียว ห้ามมี markdown หรือ codeblock ตามรูปแบบนี้:
{
  "meetingName": "ชื่อการประชุม",
  "timeRange": "09.00 – 10.00 น.",
  "location": "สถานที่ประชุม",
  "attendees": ["ชื่อ (ชื่อเล่น)", "..."],
  "topic1Items": [{"detail":"...","responsible":"ALL","due":"-","status":"บันทึก"}],
  "topic2Items": [...],
  "topic3Items": [...],
  "topic4Items": [...],
  "topic5Items": [...]
}`
}

async function callMOMAPI(prompt) {
  try {
    const response = await fetch('/api/mom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    if (!response.ok) throw new Error('API not OK')
    const data = await response.json()
    if (data.fallback || !data.mom) return null
    return data.mom
  } catch (err) {
    console.warn('MOM API not available, using fallback:', err.message)
    return null
  }
}

// ---------- component ----------
export default function MOMWriter({ projects, user, onClose, onSaved }) {
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [projId, setProjId] = useState(null)
  const [projFiles, setProjFiles] = useState([])
  const [mode, setMode] = useState('record')
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genPhase, setGenPhase] = useState(0)
  const [mom, setMom] = useState(null)
  const [recError, setRecError] = useState(null)
  const [interim, setInterim] = useState('')
  const [bars, setBars] = useState(() => Array(21).fill(8))
  const [saving, setSaving] = useState(false)
  const [sharingScreen, setSharingScreen] = useState(false)
  const [screenshots, setScreenshots] = useState([])

  const timerRef = useRef(null)
  const recRef = useRef(null)
  const recActiveRef = useRef(false)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const rafRef = useRef(null)
  const baseRef = useRef('')
  const screenStreamRef = useRef(null)
  const screenVideoRef = useRef(null)

  const proj = projId ? projects.find((p) => p.id === projId) : null
  const uploaderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ผู้ใช้'

  // load files of selected project (for meeting count / format reference / glossary)
  useEffect(() => {
    if (!projId) {
      setProjFiles([])
      return
    }
    fetchFiles(projId)
      .then((rows) => setProjFiles((rows || []).map(normalizeFile)))
      .catch((err) => {
        console.error('load project files for MOM:', err)
        setProjFiles([])
      })
  }, [projId])

  const meta = useMemo(
    () =>
      proj
        ? {
            org: proj.client,
            projectName: proj.name,
            projectCode: proj.code,
            no: nextMeetingNo(projFiles),
            today: new Date().toISOString().slice(0, 10),
            transcript,
          }
        : null,
    [proj, projFiles, transcript]
  )
  const formatRef = proj ? latestMOM(projFiles) : null
  const glossary = proj ? buildGlossary(proj, projFiles) : []

  // recording timer
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [recording])

  useEffect(() => () => {
    teardownRecording()
    teardownScreenShare()
  }, [])

  const teardownScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }
    setSharingScreen(false)
  }

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      screenStreamRef.current = stream
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      screenVideoRef.current = video
      // if the user stops sharing via the browser's own UI, reflect that here
      stream.getVideoTracks()[0].addEventListener('ended', () => teardownScreenShare())
      setSharingScreen(true)
    } catch (e) {
      toast('ไม่ได้รับสิทธิ์แชร์หน้าจอ หรือถูกยกเลิก', 'err')
    }
  }

  const captureScreenshot = () => {
    const video = screenVideoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    const MAX_W = 960
    const scale = Math.min(1, MAX_W / video.videoWidth)
    canvas.width = video.videoWidth * scale
    canvas.height = video.videoHeight * scale
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setScreenshots((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, dataUrl, caption: '', time: elapsed }])
    toast('แคปหน้าจอแล้ว')
  }

  const removeScreenshot = (id) => setScreenshots((prev) => prev.filter((s) => s.id !== id))
  const updateScreenshotCaption = (id, caption) =>
    setScreenshots((prev) => prev.map((s) => (s.id === id ? { ...s, caption } : s)))

  const teardownRecording = () => {
    recActiveRef.current = false
    if (recRef.current) {
      try {
        recRef.current.stop()
      } catch (e) {}
      recRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch (e) {}
      audioCtxRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const startRecording = async () => {
    setRecError(null)
    setInterim('')
    baseRef.current = transcript ? transcript.trim() + ' ' : ''

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const AC = window.AudioContext || window.webkitAudioContext
      const ctx = new AC()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      let last = 0
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const now = performance.now()
        if (now - last > 45) {
          last = now
          const n = 21
          const arr = []
          for (let i = 0; i < n; i++) {
            const v = data[Math.floor((i / n) * data.length)] || 0
            arr.push(8 + (v / 255) * 42)
          }
          setBars(arr)
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (e) {
      setRecError('ไม่สามารถเข้าถึงไมโครโฟนได้ — กรุณาอนุญาตสิทธิ์ไมโครโฟนในเบราว์เซอร์ แล้วลองใหม่')
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setRecError('เบราว์เซอร์นี้ไม่รองรับการถอดเสียงสด — แนะนำ Google Chrome หรือใช้แท็บ "วางโน้ต"')
    } else {
      const rec = new SR()
      rec.lang = 'th-TH'
      rec.continuous = true
      rec.interimResults = true
      rec.onresult = (ev) => {
        let fin = ''
        let itm = ''
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i]
          if (r.isFinal) fin += r[0].transcript
          else itm += r[0].transcript
        }
        if (fin) {
          baseRef.current += fin.trim() + ' '
          setTranscript(baseRef.current.trim())
        }
        setInterim(itm)
      }
      rec.onerror = (ev) => {
        if (ev.error === 'no-speech' || ev.error === 'aborted') return
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed')
          setRecError('ไม่ได้รับสิทธิ์ใช้ไมโครโฟน — กรุณาอนุญาตแล้วลองใหม่')
        else if (ev.error === 'network') setRecError('การถอดเสียงสดต้องใช้อินเทอร์เน็ต — ตรวจสอบการเชื่อมต่อ')
      }
      rec.onend = () => {
        if (recActiveRef.current) {
          try {
            rec.start()
          } catch (e) {}
        }
      }
      recRef.current = rec
      try {
        rec.start()
      } catch (e) {}
    }

    recActiveRef.current = true
    setElapsed(0)
    setRecording(true)
  }

  const stopRecording = () => {
    recActiveRef.current = false
    setRecording(false)
    setInterim('')
    teardownRecording()
    setBars(Array(21).fill(8))
    setTimeout(() => {
      if ((baseRef.current || transcript).trim()) setStep(3)
      else toast('ไม่ได้ยินเสียงพูด — ลองอัดใหม่ หรือใช้แท็บวางโน้ต', 'err')
    }, 200)
  }

  const handleAudioFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTranscribing(true)
    // NOTE: production should send `file` to a server-side STT (Whisper / Google STT).
    // No STT backend is wired yet — ask the user to record live or paste notes instead.
    setTimeout(() => {
      setTranscribing(false)
      toast('การถอดไฟล์เสียงทั้งไฟล์ยังไม่เปิดใช้งาน — กรุณาใช้แท็บ "อัดเสียง" หรือ "วางโน้ต" แทน', 'err')
    }, 900)
  }

  const generate = async () => {
    setGenerating(true)
    setGenPhase(0)
    setMom(null)
    const ph = setInterval(() => setGenPhase((p) => Math.min(p + 1, 2)), 950)
    const prompt = buildPrompt(transcript, proj, meta, formatRef, glossary)
    let raw = null
    try {
      raw = await callMOMAPI(prompt)
    } catch (err) {
      console.warn('MOM generation fallback:', err)
    }
    const result = composeMom(raw, proj, meta)
    clearInterval(ph)
    setGenPhase(3)
    setMom(result)
    setGenerating(false)
  }

  const goStep4 = () => {
    setStep(4)
    if (!mom) generate()
  }

  const exportWord = () => {
    const inner = buildDocInner(mom, meta, screenshots, uploaderName)
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>${EXPORT_CSS}</style></head><body>${inner}</body></html>`
    const blob = new Blob(['﻿', html], { type: 'application/msword' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `MOM_${meta.projectCode}_ครั้งที่${meta.no}.doc`
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast('ดาวน์โหลดไฟล์ Word แล้ว')
  }

  const exportPDF = () => {
    toast('เปิดหน้าต่างพิมพ์ — เลือก "Save as PDF"')
    setTimeout(() => window.print(), 300)
  }

  const saveToSystem = async () => {
    setSaving(true)
    try {
      const inner = buildDocInner(mom, meta, screenshots, uploaderName)
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>${EXPORT_CSS}</style></head><body>${inner}</body></html>`
      const blob = new Blob(['﻿', html], { type: 'application/msword' })
      const fileName = `MOM_ประชุม-ครั้งที่-${meta.no}_${meta.today}.doc`
      const file = new File([blob], fileName, { type: 'application/msword' })
      await uploadFile(proj.id, file, 'mom', uploaderName, transcript)
      toast(`บันทึก MOM เข้าโครงการ ${proj.code} แล้ว`, 'ok')
      onSaved && onSaved()
      onClose()
    } catch (err) {
      console.error('save MOM:', err)
      toast('บันทึกไม่สำเร็จ: ' + (err.message || 'unknown error'), 'err')
    } finally {
      setSaving(false)
    }
  }

  // ----- step renderers -----
  const StepDots = () => {
    const labels = ['เลือกโครงการ', 'บันทึกการประชุม', 'ตรวจ Transcript', 'รายงาน MOM']
    return (
      <div className="mom-steps">
        {labels.map((l, i) => {
          const n = i + 1
          const cls = step === n ? 'active' : step > n ? 'done' : ''
          return (
            <div className={`mom-step ${cls}`} key={l}>
              <div className="num">{step > n ? <Icon name="check" size={15} /> : n}</div>
              <div className="lab">{l}</div>
              {i < labels.length - 1 && <div className="line"></div>}
            </div>
          )
        })}
      </div>
    )
  }

  let stage = null
  if (step === 1) {
    stage = (
      <div className="mom-inner">
        <div className="mom-stage-title">เลือกโครงการของการประชุม</div>
        <p className="mom-stage-desc">
          ระบบจะสร้างรายงานตามฟอร์มมาตรฐานบริษัท (5 วาระคงที่) และนับครั้งประชุมต่อจาก MOM เดิมของโครงการนั้นให้อัตโนมัติ
        </p>
        <div className="mom-proj-grid">
          {projects.map((p) => (
            <button className={`mom-proj-card ${projId === p.id ? 'sel' : ''}`} key={p.id} onClick={() => setProjId(p.id)}>
              <div className="pthumb" style={{ background: p.color || 'var(--steel)' }}>
                {(p.code || '').slice(0, 2)}
              </div>
              <div>
                <div className="pname">{p.name}</div>
                <div className="pmeta">
                  {p.code} · {p.client}
                </div>
              </div>
            </button>
          ))}
        </div>
        {proj && meta && (
          <div className="mom-prefill">
            <div className="h">
              <Icon name="sparkles" size={14} /> หัวรายงานที่ระบบเตรียมให้
            </div>
            <div className="mom-prefill-grid">
              <div className="row">
                <div className="k">ครั้งที่ประชุม</div>
                <div className="v tag">
                  ครั้งที่ {meta.no}
                  {meta.no > 1 ? ' (นับต่อจากครั้งก่อน)' : ''}
                </div>
              </div>
              <div className="row">
                <div className="k">วันที่</div>
                <div className="v">{toThaiDate(meta.today)}</div>
              </div>
              <div className="row">
                <div className="k">เจ้าของงาน</div>
                <div className="v">{proj.client}</div>
              </div>
              <div className="row">
                <div className="k">รูปแบบฟอร์ม</div>
                <div className="v tag">ฟอร์มมาตรฐานบริษัท (5 วาระคงที่){formatRef ? ` · อิงโทนภาษาจาก ${formatRef.name}` : ''}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  } else if (step === 2) {
    stage = (
      <div className="mom-inner">
        <div className="mom-stage-title">บันทึกการประชุม</div>
        <p className="mom-stage-desc">อัดเสียงในที่ประชุม วางโน้ตที่จดไว้ หรืออัปโหลดไฟล์เสียงที่บันทึกไว้แล้ว</p>
        <div className="mom-tabs">
          <button className={`mom-tab ${mode === 'record' ? 'on' : ''}`} onClick={() => setMode('record')}>
            <Icon name="mic" size={16} /> อัดเสียง
          </button>
          <button className={`mom-tab ${mode === 'notes' ? 'on' : ''}`} onClick={() => setMode('notes')}>
            <Icon name="pen" size={16} /> วางโน้ต
          </button>
          <button className={`mom-tab ${mode === 'upload' ? 'on' : ''}`} onClick={() => setMode('upload')}>
            <Icon name="sound" size={16} /> อัปไฟล์เสียง
          </button>
        </div>

        {transcribing ? (
          <div className="mom-record">
            <div className="mom-transcribing">
              <div className="spinner"></div>
              <div style={{ fontFamily: 'Prompt', fontWeight: 500, color: 'var(--navy)' }}>กำลังถอดเสียงเป็นข้อความ…</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>แปลงเสียงภาษาไทยเป็น Transcript</div>
            </div>
          </div>
        ) : mode === 'record' ? (
          <div className="mom-record">
            <button className={`mom-mic ${recording ? 'rec' : ''}`} onClick={() => (recording ? stopRecording() : startRecording())}>
              <Icon name={recording ? 'stop' : 'mic'} size={36} />
            </button>
            <div className="mom-rec-label">{recording ? 'กำลังบันทึก… แตะเพื่อหยุด' : 'แตะเพื่อเริ่มบันทึกเสียง'}</div>
            {recording ? (
              <>
                <div className="mom-timer">{fmtMMSS(elapsed)}</div>
                <div className="mom-wave">
                  {bars.map((h, i) => (
                    <span key={i} style={{ height: `${h}px` }}></span>
                  ))}
                </div>
                <div className="mom-live">
                  {transcript || interim ? (
                    <>
                      {transcript} <span className="itm">{interim}</span>
                    </>
                  ) : (
                    <span className="empty">เริ่มพูดได้เลย ระบบกำลังฟังและถอดเป็นข้อความ…</span>
                  )}
                </div>
              </>
            ) : (
              <div className="mom-rec-hint">ถอดเสียงภาษาไทยแบบสด คุณจะได้ตรวจ Transcript ก่อนสร้างรายงาน</div>
            )}
            {recError ? (
              <div className="mom-recerror">
                <Icon name="bell" size={15} />
                <span>{recError}</span>
              </div>
            ) : (
              <div className="mom-demo-tag">
                <Icon name="bolt" size={12} /> ถอดเสียงไทยสดด้วย Web Speech API · แนะนำ Google Chrome + อนุญาตไมโครโฟน
              </div>
            )}
          </div>
        ) : mode === 'notes' ? (
          <div>
            <textarea
              className="mom-transcript"
              placeholder="วางโน้ตที่จดระหว่างประชุม หรือพิมพ์สรุปสั้น ๆ ที่นี่… AI จะเรียบเรียงเป็นรายงานให้"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <div className="mom-textcount">{transcript.length} ตัวอักษร</div>
          </div>
        ) : (
          <label className="dropzone" style={{ display: 'block' }}>
            <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioFile} />
            <div className="ic">
              <Icon name="sound" size={32} />
            </div>
            <div className="t">ลากไฟล์เสียงมาวาง หรือคลิกเลือก</div>
            <div className="s">รองรับ MP3, WAV, M4A · ต้องต่อ Whisper/STT ก่อนใช้งานจริง (ยังไม่เปิดใช้)</div>
          </label>
        )}

        <div className="mom-share-bar">
          {!sharingScreen ? (
            <>
              <div className="lbl">
                <b>แคปหน้าจอ</b> — เก็บภาพประเด็นสำคัญ (แบบ, สไลด์ ฯลฯ) ไว้แนบในรายงาน MOM
              </div>
              <button className="btn btn-ghost btn-sm" onClick={startScreenShare}>
                <Icon name="monitor" size={14} /> เริ่มแชร์หน้าจอ
              </button>
            </>
          ) : (
            <>
              <div className="lbl">
                <Icon name="monitor" size={14} style={{ verticalAlign: -2 }} /> กำลังแชร์หน้าจอ — แคปได้เรื่อยๆ ({screenshots.length} รูป)
              </div>
              <button className="btn btn-navy btn-sm" onClick={captureScreenshot}>
                <Icon name="camera" size={14} /> แคปหน้าจอ
              </button>
              <button className="btn btn-ghost btn-sm" onClick={teardownScreenShare}>
                หยุดแชร์
              </button>
            </>
          )}
        </div>
        {screenshots.length > 0 && (
          <div className="mom-shots">
            {screenshots.map((s) => (
              <div className="mom-shot-card" key={s.id}>
                <img src={s.dataUrl} alt="screenshot" />
                <button className="rm" onClick={() => removeScreenshot(s.id)} title="ลบรูปนี้">
                  <Icon name="close" size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  } else if (step === 3) {
    stage = (
      <div className="mom-inner">
        <div className="mom-stage-title">ตรวจ Transcript ก่อนสร้างรายงาน</div>
        <p className="mom-stage-desc">
          แก้คำที่ถอดเสียงผิดได้ที่นี่ — โดยเฉพาะชื่อคน ตัวเลข และศัพท์เทคนิค AI จะใช้คำเฉพาะของโครงการช่วยให้รายงานแม่นขึ้น
        </p>
        <textarea className="mom-transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
        <div className="mom-textcount">{transcript.length} ตัวอักษร</div>
        <div className="mom-glossary" style={{ marginTop: 16 }}>
          <div className="h">
            <Icon name="sparkles" size={14} /> ศัพท์เฉพาะของโครงการ {proj.code} ที่ AI จะรู้จัก
          </div>
          <div className="mom-gloss-chips">
            {glossary.map((g) => (
              <span className="mom-gloss-chip" key={g}>
                {g}
              </span>
            ))}
          </div>
        </div>
        {screenshots.length > 0 && (
          <div className="mom-glossary" style={{ marginTop: 16 }}>
            <div className="h">
              <Icon name="camera" size={14} /> ภาพหน้าจอที่แคปไว้ ({screenshots.length} รูป) — เพิ่มคำอธิบายสั้นๆ ได้
            </div>
            <div className="mom-shots-review">
              {screenshots.map((s) => (
                <div className="mom-shot-row" key={s.id}>
                  <img src={s.dataUrl} alt="screenshot" />
                  <input
                    placeholder="คำอธิบายภาพ เช่น แบบ Rev2 จุดที่ท่อชนกัน"
                    value={s.caption}
                    onChange={(e) => updateScreenshotCaption(s.id, e.target.value)}
                  />
                  <button className="icon-btn danger" onClick={() => removeScreenshot(s.id)} title="ลบรูปนี้">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } else {
    stage = (
      <div className="mom-inner">
        {generating || !mom ? (
          <div className="mom-generating">
            <div className="spinner"></div>
            <div style={{ fontFamily: 'Prompt', fontWeight: 600, fontSize: 18, color: 'var(--navy)' }}>AI กำลังเรียบเรียงรายงานการประชุม</div>
            <div className="mom-gen-steps">
              {['เรียบเรียงเนื้อหาเป็นภาษาทางการ', 'แตกวาระและสรุปมติที่ประชุม', 'ดึง Action Items และเรื่องค้าง'].map((t, i) => (
                <div className={`mom-gen-step ${genPhase > i ? 'on' : ''}`} key={t}>
                  <div className="dot">{genPhase > i && <Icon name="check" size={11} />}</div>
                  {t}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mom-doc-wrap">
            {mom._fallback && (
              <div className="mom-fallback-warn">
                <Icon name="bell" size={15} />
                <div>
                  <b>AI ไม่พร้อมใช้งานตอนนี้</b> — รายงานนี้เป็น<b>สรุปพื้นฐานอัตโนมัติ</b> (นำ Transcript บางส่วนมาแปะตรงๆ) ไม่ใช่การวิเคราะห์โดย AI
                  กรุณาตรวจและแก้ไขทุกวาระด้วยตนเองก่อนบันทึก หรือกด "สร้างใหม่" อีกครั้งหลัง AI กลับมาใช้งานได้
                </div>
              </div>
            )}
            <div className="mom-export-bar">
              <button className="btn btn-pink" onClick={saveToSystem} disabled={saving}>
                <Icon name="save" size={15} /> {saving ? 'กำลังบันทึก...' : 'บันทึกเข้าโครงการ'}
              </button>
              <button className="btn btn-ghost" onClick={exportPDF}>
                <Icon name="pdf" size={15} /> ดาวน์โหลด PDF
              </button>
              <button className="btn btn-ghost" onClick={exportWord}>
                <Icon name="word" size={15} /> ดาวน์โหลด Word
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setMom(null)
                  generate()
                }}
              >
                <Icon name="history" size={15} /> สร้างใหม่
              </button>
            </div>
            <div className="mom-doc" dangerouslySetInnerHTML={{ __html: buildDocInner(mom, meta, screenshots, uploaderName) }} />
          </div>
        )}
      </div>
    )
  }

  // ----- footer -----
  const canNext1 = !!projId
  const canNext2 = mode === 'notes' && transcript.trim().length > 0
  let footer = null
  if (step === 1) {
    footer = (
      <>
        <div className="spacer"></div>
        <button className="btn btn-pink" disabled={!canNext1} onClick={() => setStep(2)}>
          ถัดไป <Icon name="arrow-r" size={15} />
        </button>
      </>
    )
  } else if (step === 2) {
    footer = (
      <>
        <button className="btn btn-ghost" onClick={() => setStep(1)}>
          <Icon name="arrow-l" size={15} /> ย้อนกลับ
        </button>
        <div className="spacer"></div>
        {mode === 'notes' && (
          <button className="btn btn-pink" disabled={!canNext2} onClick={() => setStep(3)}>
            ตรวจ Transcript <Icon name="arrow-r" size={15} />
          </button>
        )}
      </>
    )
  } else if (step === 3) {
    footer = (
      <>
        <button className="btn btn-ghost" onClick={() => setStep(2)}>
          <Icon name="arrow-l" size={15} /> ย้อนกลับ
        </button>
        <div className="spacer"></div>
        <button className="btn btn-pink" disabled={!transcript.trim()} onClick={goStep4}>
          <Icon name="sparkles" size={15} /> สร้างรายงาน MOM
        </button>
      </>
    )
  } else {
    footer = (
      <>
        <button className="btn btn-ghost" onClick={() => setStep(3)} disabled={generating}>
          <Icon name="arrow-l" size={15} /> แก้ Transcript
        </button>
        <div className="spacer"></div>
        {!generating && mom && (
          <button className="btn btn-navy" onClick={onClose}>
            <Icon name="check" size={15} /> เสร็จสิ้น
          </button>
        )}
      </>
    )
  }

  return (
    <div className="mom-overlay">
      <div className="mom-head">
        <div className="mom-head-top">
          <div className="mom-head-ico">
            <Icon name="doc-text" size={20} />
          </div>
          <div>
            <div className="mom-head-ttl">AI MOM Writer · ผู้ช่วยเขียนรายงานการประชุม</div>
            <div className="mom-head-sub">อัดเสียง → ถอดข้อความ → เรียบเรียงเป็น MOM ตามฟอร์มบริษัท</div>
          </div>
          <button className="close" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <StepDots />
      </div>
      <div className="mom-body">{stage}</div>
      <div className="mom-foot">
        <div className="mom-foot-inner">{footer}</div>
      </div>
    </div>
  )
}

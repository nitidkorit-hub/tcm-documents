import { useState, useEffect, useMemo, useRef } from 'react'
import Icon from './Icon.jsx'
import { useToast } from './Toast.jsx'
import { fetchFiles, uploadFile } from '../api/supabase.js'
import { normalizeFile } from '../utils/format.js'

// ---------- helpers ----------
const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const toThaiDate = (iso) => {
  const d = new Date(iso)
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`
}
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
const buildDocInner = (mom, meta) => {
  const att = (mom.attendees || [])
    .map((a) => `<li>${escapeHtml(typeof a === 'string' ? a : a.name + (a.role ? ` — ${a.role}` : ''))}</li>`)
    .join('')
  const agenda = (mom.agenda || [])
    .map(
      (item) => `
    <div class="doc-agenda-item">
      <div class="ah">วาระที่ ${escapeHtml(item.no)} · ${escapeHtml(item.topic)}</div>
      ${item.discussion ? `<p class="ad">${escapeHtml(item.discussion)}</p>` : ''}
      ${item.resolution ? `<div class="ar"><b>มติที่ประชุม:</b> ${escapeHtml(item.resolution)}</div>` : ''}
    </div>`
    )
    .join('')
  const actions = (mom.actionItems || [])
    .map(
      (a, i) => `
    <tr>
      <td class="c">${i + 1}</td>
      <td>${escapeHtml(a.task)}</td>
      <td class="owner">${escapeHtml(a.owner || '-')}</td>
      <td class="due">${escapeHtml(a.due || '-')}</td>
    </tr>`
    )
    .join('')
  const carry = (mom.carryForward || [])
    .map((c) => `<li>${escapeHtml(c.item)}${c.status ? `<span class="st">${escapeHtml(c.status)}</span>` : ''}</li>`)
    .join('')

  return `
  <div class="doc-org">${escapeHtml(meta.org)}</div>
  <div class="doc-title">รายงานการประชุม (Minutes of Meeting)</div>
  <div class="doc-proj">โครงการ ${escapeHtml(meta.projectName)} · รหัส ${escapeHtml(meta.projectCode)}</div>

  <div class="doc-meta">
    <div class="m"><b>เรื่อง:</b> ${escapeHtml(mom.meetingTitle || `การประชุม ครั้งที่ ${meta.no}`)}</div>
    <div class="m"><b>ครั้งที่:</b> ${escapeHtml(meta.no)}</div>
    <div class="m"><b>วัน–เวลา:</b> ${escapeHtml(mom.dateTime || '')}</div>
    <div class="m"><b>สถานที่:</b> ${escapeHtml(mom.location || '')}</div>
  </div>

  <h4 class="doc-sec">ผู้เข้าร่วมประชุม</h4>
  <ul class="doc-attendees">${att || '<li>—</li>'}</ul>

  <h4 class="doc-sec">ระเบียบวาระและมติที่ประชุม</h4>
  ${agenda || '<p>—</p>'}

  <h4 class="doc-sec">สรุปการมอบหมายงาน (Action Items)</h4>
  <table class="doc-table">
    <thead><tr><th>#</th><th>รายการที่ต้องดำเนินการ</th><th>ผู้รับผิดชอบ</th><th>กำหนดเสร็จ</th></tr></thead>
    <tbody>${actions || '<tr><td class="c">-</td><td>—</td><td>-</td><td>-</td></tr>'}</tbody>
  </table>

  ${carry ? `<h4 class="doc-sec">เรื่องสืบเนื่อง / ติดตามจากครั้งก่อน</h4><ul class="doc-carry">${carry}</ul>` : ''}

  <h4 class="doc-sec">นัดหมายการประชุมครั้งต่อไป</h4>
  <div class="doc-next">${escapeHtml(mom.nextMeeting || '—')}</div>

  <div class="doc-sign">
    <div class="s"><div class="line"></div><div class="role">ผู้บันทึกการประชุม</div></div>
    <div class="s"><div class="line"></div><div class="role">ผู้รับรองรายงาน</div></div>
  </div>`
}

const EXPORT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600&family=Sarabun:wght@400;500;600;700&display=swap');
body { font-family: 'Sarabun','TH Sarabun New',sans-serif; color:#1B1F26; font-size:14px; line-height:1.65; padding:24px; }
.doc-org { text-align:center; font-family:'Prompt'; font-weight:600; color:#1F3A5F; font-size:15px; }
.doc-title { text-align:center; font-family:'Prompt'; font-weight:600; font-size:19px; margin:4px 0 2px; }
.doc-proj { text-align:center; color:#6B7280; font-size:13px; margin-bottom:22px; }
.doc-meta { display:grid; grid-template-columns:1fr 1fr; gap:6px 28px; padding:16px 0; border-top:1.5px solid #1B1F26; border-bottom:1px solid #E5E9EF; margin-bottom:18px; }
.doc-meta .m b { font-family:'Prompt'; font-weight:600; color:#1F3A5F; }
h4.doc-sec { font-family:'Prompt'; font-weight:600; font-size:15px; color:#1F3A5F; margin:22px 0 10px; padding-bottom:6px; border-bottom:1px solid #E5E9EF; }
.doc-attendees, .doc-carry { padding-left:20px; }
.doc-attendees li, .doc-carry li { margin-bottom:4px; }
.doc-agenda-item { margin-bottom:16px; }
.doc-agenda-item .ah { font-family:'Prompt'; font-weight:600; font-size:14px; }
.doc-agenda-item .ad { margin:4px 0 0; }
.doc-agenda-item .ar { margin-top:5px; padding:8px 12px; background:#EEF2F8; border-left:3px solid #3A6EA5; border-radius:0 6px 6px 0; font-size:13px; }
.doc-agenda-item .ar b { color:#1F3A5F; font-family:'Prompt'; }
table.doc-table { width:100%; border-collapse:collapse; font-size:13px; }
table.doc-table th { background:#1F3A5F; color:#fff; font-family:'Prompt'; font-weight:500; padding:8px 10px; text-align:left; }
table.doc-table td { padding:8px 10px; border-bottom:1px solid #E5E9EF; vertical-align:top; }
table.doc-table td.c { text-align:center; color:#6B7280; }
.owner { font-weight:600; color:#1F3A5F; }
.due { color:#BE2A6E; }
.doc-carry .st { font-size:12px; padding:1px 8px; border-radius:999px; background:rgba(245,166,35,0.16); color:#C77F00; font-weight:600; margin-left:6px; }
.doc-next { padding:12px 16px; background:#FCE7F2; border-radius:8px; }
.doc-sign { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-top:48px; }
.doc-sign .s { text-align:center; }
.doc-sign .line { border-top:1px dotted #888; margin:42px 14px 8px; }
.doc-sign .role { font-size:13px; color:#6B7280; }
`

// ---------- fallback (used if Claude API is unavailable) ----------
const fallbackMOM = (proj, meta) => ({
  meetingTitle: `การประชุมประจำสัปดาห์ ครั้งที่ ${meta.no}`,
  dateTime: `${toThaiDate(meta.today)} เวลา 09:00 น.`,
  location: 'ห้องประชุมสำนักงานสนาม',
  attendees: ['ผู้บันทึกการประชุม (ประธาน)', `ผู้แทน ${proj.client || 'เจ้าของงาน'}`],
  agenda: [
    {
      no: 1,
      topic: 'สรุปประเด็นจากบทถอดเสียง',
      discussion: meta.transcript ? meta.transcript.slice(0, 400) : 'ไม่มีข้อมูลเพียงพอจะสรุปอัตโนมัติ กรุณาตรวจ Transcript และสร้างรายงานใหม่',
      resolution: 'รอการตรวจสอบและปรับแก้โดยผู้บันทึกการประชุม',
    },
  ],
  actionItems: [],
  carryForward: [],
  nextMeeting: 'รอกำหนดนัดครั้งต่อไป',
})

const buildPrompt = (transcript, proj, meta, formatRef, glossary) => {
  const formatHint = formatRef
    ? `- รูปแบบอ้างอิง: ให้ยึดรูปแบบ/ลำดับหัวข้อตามฟอร์มเดิมของโครงการ (อ้างอิงจาก "${formatRef.name}")${
        formatRef.contentText
          ? `\n  ตัวอย่างเนื้อหาฟอร์มเดิม (ใช้เป็นแนวทางการเรียบเรียงเท่านั้น ไม่ต้องคัดลอกเนื้อหา):\n  """\n  ${formatRef.contentText.slice(0, 1500)}\n  """`
          : ''
      }`
    : '- ใช้ฟอร์มมาตรฐานกลางของบริษัท'

  return `คุณเป็นเลขานุการที่ประชุมมืออาชีพของบริษัทรับเหมาก่อสร้าง หน้าที่คือเรียบเรียง "บันทึกการประชุม (MOM)" ภาษาไทยที่เป็นทางการ จากบทถอดเสียงดิบ

บริบทโครงการ:
- ชื่อโครงการ: ${proj.name} (รหัส ${proj.code})
- เจ้าของงาน: ${proj.client || '-'}
- ครั้งที่ประชุม: ${meta.no}
- วันที่: ${toThaiDate(meta.today)}
${formatHint}

ศัพท์เฉพาะ/ชื่อที่อาจถูกถอดเสียงผิด ให้ช่วยแก้ให้ถูก: ${glossary.join(', ')}

บทถอดเสียงดิบ:
"""
${transcript}
"""

งานของคุณ:
1) เรียบเรียงเป็นภาษาทางการ กระชับ ชัดเจน
2) แตกออกเป็นวาระ (agenda) พร้อมสรุปการอภิปรายและ "มติที่ประชุม"
3) ดึง Action Items ออกมาเป็นรายการ พร้อมผู้รับผิดชอบและกำหนดเสร็จ
4) แยก "เรื่องสืบเนื่อง/ค้างจากครั้งก่อน" ที่ยังไม่ปิด พร้อมสถานะ
5) ระบุนัดหมายครั้งต่อไป

ตอบกลับเป็น JSON อย่างเดียว ห้ามมี markdown หรือ codeblock ตามรูปแบบนี้:
{
  "meetingTitle": "ชื่อการประชุม",
  "dateTime": "วัน–เวลา เช่น ${toThaiDate(meta.today)} เวลา 09:00 น.",
  "location": "สถานที่",
  "attendees": ["ชื่อ — ตำแหน่ง", "..."],
  "agenda": [{"no":1,"topic":"...","discussion":"...","resolution":"..."}],
  "actionItems": [{"task":"...","owner":"...","due":"..."}],
  "carryForward": [{"item":"...","status":"..."}],
  "nextMeeting": "..."
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

  const timerRef = useRef(null)
  const recRef = useRef(null)
  const recActiveRef = useRef(false)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const rafRef = useRef(null)
  const baseRef = useRef('')

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

  useEffect(() => () => teardownRecording(), [])

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
    let result = null
    try {
      result = await callMOMAPI(prompt)
    } catch (err) {
      console.warn('MOM generation fallback:', err)
    }
    if (!result || !Array.isArray(result.agenda)) result = fallbackMOM(proj, meta)
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
    const inner = buildDocInner(mom, meta)
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
      const inner = buildDocInner(mom, meta)
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
          ระบบจะเติมหัวรายงานอัตโนมัติ นับครั้งต่อจาก MOM เดิม และอ้างอิงรูปแบบฟอร์มจากรายงานล่าสุดของโครงการนั้น
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
                <div className="v tag">{formatRef ? `ตามฟอร์มของ ${formatRef.name}` : 'ฟอร์มกลางมาตรฐาน'}</div>
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
            <div className="mom-doc" dangerouslySetInnerHTML={{ __html: buildDocInner(mom, meta) }} />
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

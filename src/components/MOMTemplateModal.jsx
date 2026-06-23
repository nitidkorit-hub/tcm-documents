import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useToast } from './Toast.jsx'
import { updateProject, fetchProjects } from '../api/supabase.js'
import {
  DEFAULT_MOM_TOPICS,
  DEFAULT_MOM_LOGO,
  MOM_FONT_OPTIONS,
  getProjectTopics,
  getProjectLogo,
  getProjectFontStack,
} from '../utils/momDefaults.js'

export default function MOMTemplateModal({ project, onClose, onSaved }) {
  const [topics, setTopics] = useState(() => [...getProjectTopics(project)])
  const [logo, setLogo] = useState(() => (project.mom_logo === '' ? null : project.mom_logo || DEFAULT_MOM_LOGO))
  const [font, setFont] = useState(project.mom_font || 'Angsana New')
  const [saving, setSaving] = useState(false)
  const [otherProjects, setOtherProjects] = useState([])
  const [copyFromId, setCopyFromId] = useState('')
  const toast = useToast()

  useEffect(() => {
    fetchProjects()
      .then((rows) => setOtherProjects(rows.filter((p) => p.id !== project.id)))
      .catch(() => {})
  }, [project.id])

  const handleCopyFrom = () => {
    const src = otherProjects.find((p) => p.id === copyFromId)
    if (!src) return
    setTopics([...getProjectTopics(src)])
    setLogo(getProjectLogo(src))
    setFont(src.mom_font || 'Angsana New')
    toast(`คัดลอกฟอร์มจาก ${src.name} แล้ว — ตรวจสอบก่อนกดบันทึก`)
  }

  const updateTopic = (i, value) => setTopics((prev) => prev.map((t, idx) => (idx === i ? value : t)))
  const removeTopic = (i) => setTopics((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))
  const addTopic = () => setTopics((prev) => [...prev, ''])
  const moveTopic = (i, dir) => {
    setTopics((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogo(reader.result)
    reader.readAsDataURL(file)
  }

  const resetDefaults = () => {
    setTopics([...DEFAULT_MOM_TOPICS])
    setLogo(DEFAULT_MOM_LOGO)
    setFont('Angsana New')
  }

  const handleSave = async () => {
    const cleanTopics = topics.map((t) => t.trim()).filter(Boolean)
    if (!cleanTopics.length) {
      toast('ต้องมีวาระอย่างน้อย 1 หัวข้อ', 'err')
      return
    }
    setSaving(true)
    try {
      await updateProject(project.id, {
        mom_topics: cleanTopics,
        mom_logo: logo === DEFAULT_MOM_LOGO ? null : logo === null ? '' : logo,
        mom_font: font,
      })
      toast('บันทึก Form MOM ของโครงการเรียบร้อย', 'ok')
      onSaved?.()
      onClose()
    } catch (err) {
      toast('บันทึกไม่สำเร็จ: ' + err.message, 'err')
    } finally {
      setSaving(false)
    }
  }

  const previewFontStack = getProjectFontStack({ mom_font: font })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>ตั้งค่า Form MOM · {project.name}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {otherProjects.length > 0 && (
            <div className="field">
              <label>คัดลอกฟอร์มจากโครงการอื่น</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={copyFromId} onChange={(e) => setCopyFromId(e.target.value)} style={{ flex: 1 }}>
                  <option value="">เลือกโครงการ...</option>
                  {otherProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyFrom} disabled={!copyFromId}>
                  <Icon name="history" size={13} /> คัดลอกมาใช้
                </button>
              </div>
            </div>
          )}

          <div className="field">
            <label>วาระการประชุม (เรียงตามลำดับ)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topics.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 20, textAlign: 'center', fontSize: 12, color: 'var(--gray-500)', flexShrink: 0 }}>{i + 1}</span>
                  <input type="text" value={t} onChange={(e) => updateTopic(i, e.target.value)} placeholder="ชื่อวาระ" style={{ flex: 1 }} />
                  <button type="button" className="icon-btn" onClick={() => moveTopic(i, -1)} disabled={i === 0} title="เลื่อนขึ้น">
                    <Icon name="arrow-r" size={13} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => moveTopic(i, 1)} disabled={i === topics.length - 1} title="เลื่อนลง">
                    <Icon name="arrow-r" size={13} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => removeTopic(i)} disabled={topics.length <= 1} title="ลบวาระนี้">
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={addTopic}>
              <Icon name="plus" size={13} /> เพิ่มวาระ
            </button>
          </div>

          <div className="field">
            <label>โลโก้บนหัวกระดาษ</label>
            {logo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={logo} alt="logo preview" style={{ width: 64, height: 'auto', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 4 }} />
                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                  เปลี่ยนโลโก้
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />
                </label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLogo(null)}>
                  ลบโลโก้
                </button>
              </div>
            ) : (
              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', width: 'fit-content' }}>
                <Icon name="upload" size={13} /> อัปโหลดโลโก้
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />
              </label>
            )}
          </div>

          <div className="field">
            <label>รูปแบบฟอนต์</label>
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              {MOM_FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <div
              style={{
                marginTop: 8,
                padding: '12px 14px',
                border: '1px solid var(--gray-200)',
                borderRadius: 8,
                textAlign: 'center',
                fontFamily: previewFontStack,
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              ตัวอย่าง: รายงานการประชุม (Minutes of Meeting)
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={resetDefaults} disabled={saving} style={{ marginRight: 'auto' }}>
            คืนค่าเริ่มต้น
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            ยกเลิก
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Icon name="check" size={14} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}

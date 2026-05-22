# ConstructAI QTO — BASE Document
> โปรเจกต์พื้นฐานสำหรับส่งต่อการพัฒนาใน Claude Session ใหม่

---

## 1. ชื่อและภาพรวม

**ชื่อระบบ:** TCM ConstructAI QTO Agent  
**เวอร์ชัน:** 2.0  
**ประเภท:** Standalone Web App (ไฟล์ HTML ไฟล์เดียว ไม่ต้อง install)

ConstructAI QTO คือ AI Agent สำหรับถอดปริมาณงานก่อสร้าง (Quantity Takeoff) ที่อ่านแบบจากไฟล์จริงโดยตรงผ่าน Claude API ด้วยกลไก Base64 รองรับทุกสาขาวิชาชีพก่อสร้าง Export Excel/CSV ได้ทันที

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | HTML5 + CSS3 + Vanilla JavaScript (ไม่มี Framework) |
| AI Engine | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Excel Export | SheetJS (xlsx.full.min.js via CDN) |
| Font | Montserrat (Heading) + Sarabun (Body) via Google Fonts |
| Storage | localStorage (บันทึก API Key บนเครื่องผู้ใช้) |
| Hosting | ไม่ต้องมี — เปิดไฟล์ .html ผ่าน Browser ได้เลย |

---

## 3. TCM Brand Theme

```
Navy Blue  #1F3A5F  → พื้นหลัง / Header
Steel Blue #3A6EA5  → UI / ปุ่มหลัก / Accent
Green      #2DBE60  → Highlight / ปุ่ม Action / Success
White      #FFFFFF  → ข้อความ
Dark Gray  #2B2B2B  → ข้อความหลัก
```

**Typography**
- Heading: `Montserrat` (font-weight 700–800)
- Body: `Sarabun` (font-weight 400–600)
- Mood: โมเดิร์น + วิศวะ

---

## 4. โครงสร้างไฟล์ HTML

ไฟล์เดียว `TCM_QTO_Agent.html` ประกอบด้วย 3 ส่วน:

```
TCM_QTO_Agent.html
├── <style>      CSS (TCM Theme + Layout + Components)
├── <body>
│   ├── #setup   หน้าใส่ API Key (แสดงครั้งแรก)
│   ├── #ld      Loading overlay
│   ├── #toast   Toast notifications
│   └── #app     Main app
│       ├── #hdr    Header (Logo + Badges + API Key input)
│       ├── #tabs   Tab navigation (8 tabs)
│       └── #body → #content  (render ด้วย JS ทุก tab)
└── <script>     JavaScript (State + Functions + Renderers)
```

---

## 5. State Management

```javascript
const S = {
  key:    '',          // Anthropic API Key (จาก localStorage)
  files:  [],          // ไฟล์แบบที่อัปโหลด [{id, name, size, file, disc, type}]
  disc:   [...],       // หมวดงานที่เลือก (8 disciplines)
  verify: null,        // ผลการตรวจสอบแบบ
  boq:    null,        // BOQ data {projectName, categories, grandTotal, ...}
  meas:   null,        // ผลวัดระยะ
  flags:  [],          // Legal flags
  qa:     [...],       // Chat history [{r:'ai'|'user', t:'text'}]
  cmp: {               // Compare state
    mode: 'bb',        // 'bb' = BOQ vs BOQ | 'dvb' = Drawing vs BOQ
    f1, f2, fq, res    // ไฟล์ที่อัปโหลด + ผลลัพธ์
  },
  tab: 'upload',       // Tab ปัจจุบัน
};
```

---

## 6. แท็บและฟังก์ชันหลัก

| Tab ID | ฟังก์ชัน Render | ฟังก์ชัน Action | หมายเหตุ |
|--------|----------------|----------------|----------|
| `upload` | `rUpload()` | `addF()`, `toggleD()` | Drag & Drop + Discipline Selector |
| `verify` | `rVerify()` | `runVerify()` | เรียก AI ตรวจสอบความครบถ้วน |
| `takeoff` | `rTakeoff()` | `runTakeoff()` | **หลัก** — อ่านแบบ Base64 → BOQ |
| `measure` | `rMeasure()` | `runMeasure()` | วัดระยะโดยอ้างอิงสเกล |
| `compare` | `rCompare()` | `runBB()`, `runDvB()` | BOQ vs BOQ / แบบ vs BOQ |
| `legal` | `rLegal()` | — | แสดง Legal flags |
| `qa` | `rQA()` | `qaQ()` | Chat กับ AI QS |
| `export` | `rExport()` | `dlXLSX()`, `dlCSV()` | Export Excel/CSV/JSON |

---

## 7. API Call Pattern

```javascript
// ฟังก์ชัน ai() — wrapper หลักสำหรับเรียก Claude API
async function ai(systemPrompt, content, maxTokens) {
  fetch('https://api.anthropic.com/v1/messages', {
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: { model: 'claude-sonnet-4-20250514', max_tokens: maxTokens, ... }
  })
}
```

**Content Types ที่ส่งได้:**
- `{type:'document', source:{type:'base64', media_type:'application/pdf', data:b64}}`
- `{type:'image', source:{type:'base64', media_type:'image/jpeg', data:b64}}`
- `{type:'text', text:'...'}`

**Token Budget:**
| Action | max_tokens |
|--------|-----------|
| Verify | 800 |
| Takeoff | 8,000 |
| Measure | 600 |
| Compare BB | 6,000 |
| Compare DVB | 6,000 |
| QA Chat | 1,200 |

---

## 8. Disciplines (8 สาขา)

```javascript
const DISC = {
  architectural: { l:'สถาปัตยกรรม',     i:'🏛️', c:'#3A6EA5', s:'Arch' },
  structural:    { l:'โครงสร้าง',        i:'🏗️', c:'#2DBE60', s:'Struct' },
  mechanical:    { l:'งานระบบ M (HVAC)', i:'⚙️', c:'#0694a2', s:'Mech' },
  electrical:    { l:'งานระบบ E',        i:'⚡', c:'#7c3aed', s:'Elec' },
  plumbing:      { l:'งานระบบ P',        i:'🔧', c:'#06b6d4', s:'Plumb' },
  fire:          { l:'Fire Protection',  i:'🔥', c:'#e53e3e', s:'Fire' },
  civil:         { l:'งานโยธา/ภูมิสถ.', i:'🌿', c:'#68d391', s:'Civil' },
  interior:      { l:'ตกแต่งภายใน',      i:'🪑', c:'#ed64a6', s:'Int' },
};
```

---

## 9. ฟังก์ชัน Utility สำคัญ

```javascript
fileToBase64(file)     // แปลงไฟล์ → Base64 string (ใช้ FileReader)
pJSON(raw)             // Parse JSON + Auto-repair truncated JSON
dlXLSX(rows, fname)    // Export Excel ด้วย SheetJS
dlCSV(rows, fname)     // Export CSV (UTF-8 BOM รองรับภาษาไทย)
toast(msg, type, dur)  // Toast notification (g=green, r=red, b=blue)
ld(bool, text)         // Loading overlay on/off
updBdg()               // Update header badges
go(tabId)              // Navigate to tab + render
```

---

## 10. Setup Flow

```
เปิดไฟล์ .html
    ↓
init() ตรวจสอบ localStorage
    ├── มี Key → ซ่อน #setup → แสดง #app → go('upload')
    └── ไม่มี Key → แสดง #setup → รอ input
                        ↓
                   saveKey() validate
                        ↓
                   ซ่อน #setup → แสดง #app → go('upload')
```

---

## 11. ปัญหาที่แก้ไขแล้ว (Known Fixes)

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| BOQ ไม่แสดง | model name ผิด (`claude-opus-4-5`) | เปลี่ยนเป็น `claude-sonnet-4-20250514` |
| JSON truncated | max_tokens 2500 น้อยเกิน | เพิ่มเป็น 8000 |
| discipline filter ตัดทิ้งหมด | AI คืนชื่อ discipline ผิด | เพิ่ม discNorm mapping ทุกรูปแบบ |
| Setup ค้าง ไปต่อไม่ได้ | `#app` ไม่ถูก show หลัง saveKey | เพิ่ม `$('app').style.display='flex'` |
| Compare ไม่ทำงาน | Prompt อยู่ใน nested template literal | เปลี่ยนเป็น plain string |

---

## 12. ไฟล์ที่มีอยู่

| ไฟล์ | คำอธิบาย |
|------|----------|
| `TCM_QTO_Agent.html` | ตัวแอปพลิเคชันหลัก (Standalone) |
| `constructai-qto.md` | Documentation + Source Code แนบ |
| `BASE.md` | ไฟล์นี้ — พื้นฐานโปรเจกต์ |
| `SKILL.md` | BOQ Knowledge + Prompt Engineering Guide |
| `presentation-script-formal.md` | บทพรีเซนต์ 60 วินาที |
| `ai-qto-presentation.html` | Animation Presentation |

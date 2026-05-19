# 📁 Document Agent — TCM
## Base & Skill Reference
> ไฟล์นี้ใช้สำหรับย้ายข้อมูลและพัฒนาต่อใน Claude Design

---

## 1. PROJECT OVERVIEW

| รายการ | รายละเอียด |
|---|---|
| ชื่อโปรเจกต์ | TCM Document Agent |
| เวอร์ชัน | v4 (Stable) |
| ประเภท | Single-file Web App (.html) |
| ภาษา | HTML / CSS / JavaScript |
| AI Engine | Claude API (claude-haiku-4-5) |
| สถานะ | พร้อมใช้งาน — รอเชื่อม OneDrive |

---

## 2. BRAND (TCM Theme)

```
สี:
  --navy:        #1F3A5F   → Header / UI หลัก
  --steel:       #3A6EA5   → Secondary / Border
  --green:       #2DBE60   → Highlight / Badge ล่าสุด
  --white:       #FFFFFF   → พื้นหลัง
  --gray:        #2B2B2B   → ตัวอักษรหลัก
  --bg:          #F4F6F9   → Background หน้า

ฟอนต์:
  Heading  → Prompt (Google Fonts)
  Body     → Sarabun (Google Fonts)

Mood: โมเดิร์น + วิศวกรรม + มืออาชีพ
```

---

## 3. FEATURES (ฟีเจอร์ปัจจุบัน)

### 3.1 รับไฟล์
- อัปโหลดหลายไฟล์พร้อมกัน (Click หรือ Drag & Drop)
- รองรับ PDF, Word, Excel, JPG, PNG
- ระบุชื่อโครงการและประเภทเอกสารก่อนอัปโหลด
- จัดประเภทอัตโนมัติจากชื่อไฟล์

### 3.2 ประเภทเอกสาร (8 ประเภท)
```
EIA        → eia, สิ่งแวดล้อม, environment, impact
แบบ        → แบบ, drawing, plan, dwg, blueprint
สัญญา     → สัญญา, contract, agreement
แรงงาน    → แรงงาน, labor, worker, safety
มาตรฐาน   → มยผ, มาตรฐาน, standard, spec
MOM        → mom, minutes, รายงานประชุม, meeting
ราคา       → ราคา, boq, ประมาณการ, cost, budget
อื่นๆ      → ที่เหลือทั้งหมด
```

### 3.3 Version History
- จับ Rev1/Rev2/Rev3 อัตโนมัติจากชื่อไฟล์
- รองรับรูปแบบ: `Rev3`, `v2`, `2024-04-20`
- Badge "ล่าสุด" และ "เก่า" อัตโนมัติ
- เรียงลำดับ Version จากใหม่ไปเก่า

### 3.4 โครงการ
- จัดกลุ่มไฟล์ตามชื่อโครงการ
- Zip ทั้งโครงการในคลิกเดียว
- Zip เฉพาะ Version ล่าสุดของแต่ละกลุ่ม
- ลบทั้งโครงการพร้อมกัน

### 3.5 ดาวน์โหลด / ลบ
- ปุ่ม "ดาวน์โหลด" ทุกไฟล์
- ปุ่ม "ลบ" พร้อม Dialog ยืนยันก่อนลบ
- ลบทีละไฟล์ หรือลบทั้งโครงการ

### 3.6 ถามหาเอกสาร (AI Chat)
- ใช้ Claude API (claude-haiku-4-5)
- พิมพ์คำสั่งภาษาธรรมชาติ
- Intent Detection 3 แบบ:
  - `download_single` → ดาวน์โหลดไฟล์เดียว
  - `download_zip` → รวบรวม Zip
  - `answer` → ตอบคำถามข้อมูล

---

## 4. TECH STACK

```
Frontend:   HTML5, CSS3 (CSS Variables), Vanilla JS (ES6+)
AI:         Anthropic Claude API v1/messages
Library:    JSZip 3.10.1 (cdnjs)
Font:       Google Fonts — Prompt, Sarabun
Storage:    Browser Memory (ชั่วคราว)
Deploy:     Single HTML File — เปิดใน Browser ได้เลย
```

---

## 5. API CONFIGURATION

```javascript
// Claude API
endpoint:  https://api.anthropic.com/v1/messages
model:     claude-haiku-4-5
headers:
  x-api-key: [CLAUDE_API_KEY]
  anthropic-version: 2023-06-01
  anthropic-dangerous-direct-browser-access: true
max_tokens: 1000

// Key Location ในไฟล์ HTML
const CLAUDE_API_KEY = 'sk-ant-api...';
```

---

## 6. FILE NAMING CONVENTION (แนะนำ)

```
[ประเภท]_[โครงการ]_[Version].[นามสกุล]

ตัวอย่าง:
  EIA_โครงการA_Rev3.pdf
  BOQ_โครงการB_v2.xlsx
  MOM_โครงการA_2024-04-20.pdf
  แบบสถาปัตย์_โครงการC_Rev1.pdf
```

---

## 7. ROADMAP

```
✅ Phase 1 (เสร็จแล้ว)
   - Single HTML File พร้อมใช้งาน
   - TCM Theme ครบ
   - AI Chat ด้วย Claude API
   - Drag & Drop + Version History

🔄 Phase 2 (รอ IT)
   - เชื่อม OneDrive (ต้องการ Client ID + Tenant ID)
   - ไฟล์ไม่หายเมื่อปิด Browser
   - ทุกคนเห็นเอกสารเดียวกัน

🔮 Phase 3 (อนาคต)
   - Deploy บน Web Server จริง
   - ระบบ Login + สิทธิ์ผู้ใช้
   - Notification เมื่อมีเอกสารใหม่
   - รายงานสถิติการใช้งาน
```

---

## 8. CONTENT (หัวข้อ + คำอธิบาย)

**หัวข้อที่เลือก:**
> "เอกสารทุกไฟล์ ทุก Version อยู่ในมือคุณเสมอ"

**คำอธิบาย:**
> เอกสารก่อสร้างนับร้อยไฟล์ ทั้ง EIA แบบก่อสร้าง สัญญา BOQ และ MOM จัดการได้ในระบบเดียว
> Document Agent จัดหมวดหมู่เอกสารและติดตาม Version History ทุกไฟล์โดยอัตโนมัติ
> ไม่ต้องเสียเวลาค้นหา — แค่พิมพ์คำสั่ง ระบบดึงไฟล์ที่ถูกต้องส่งให้ทันที
> รวบรวมเอกสารทั้งโครงการเป็น Zip ได้ในคลิกเดียว ลดความผิดพลาดจากการใช้ไฟล์ผิด Version
> เพราะเวลาของทีมมีค่า — ให้ AI ทำงานหนักแทน

**เครื่องมือที่ใช้สร้าง:**
> Claude (Anthropic) — AI Assistant ช่วยออกแบบและเขียนโค้ดทั้งระบบ
> HTML / CSS / JavaScript — พัฒนา UI และ Logic ทั้งหมด
> Claude API (claude-haiku-4-5) — ขับเคลื่อนระบบถามหาเอกสารด้วยภาษาธรรมชาติ
> JSZip Library — รวบรวมและบีบอัดไฟล์เป็น .zip
> Google Fonts (Prompt + Sarabun) — Typography ตาม TCM Brand

**รูปแบบผลลัพธ์:**
> Single-file Web App (.html) เปิดได้ทันทีในทุกเบราว์เซอร์
> ไม่ต้อง Install — แชร์ผ่าน Shared Drive หรือ SharePoint ได้เลย
> พร้อม Upgrade เป็น Web App จริงบน Server ในอนาคต

---

## 9. KNOWN ISSUES & FIXES

| ปัญหา | สาเหตุ | วิธีแก้ |
|---|---|---|
| Drag & Drop ไม่ทำงาน | addEventListener รันก่อน DOM โหลด | ย้ายเข้า DOMContentLoaded |
| API ใช้ไม่ได้หลังใส่ Key | Model name ผิด | แก้เป็น claude-haiku-4-5 |
| Gemini API ไม่ได้รับการรองรับ | Model ถูก Google ปิด | เปลี่ยนมาใช้ Claude API |
| เอกสารหายเมื่อปิด Browser | เก็บใน Memory เท่านั้น | รอเชื่อม OneDrive (Phase 2) |

---

## 10. PROMPT TEMPLATE (สำหรับ Claude Design)

```
Context:
- โปรเจกต์: TCM Document Agent
- ประเภท: Single-file Web App
- Tech: HTML/CSS/JS + Claude API
- Theme: TCM (Navy #1F3A5F, Green #2DBE60, Font: Prompt/Sarabun)
- สถานะ: v4 พร้อมใช้งาน

ต้องการพัฒนาต่อ:
[ระบุสิ่งที่อยากทำต่อที่นี่]

ข้อจำกัด:
- ต้องเป็นไฟล์ HTML เดียว
- ใช้ Claude API (claude-haiku-4-5)
- รักษา TCM Theme ไว้
```

---

*จัดทำโดย: Claude (Anthropic) | TCM Document Agent Project*

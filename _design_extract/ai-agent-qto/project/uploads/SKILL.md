# ConstructAI QTO — SKILL Document
> BOQ Knowledge Base + Prompt Engineering Guide สำหรับพัฒนาต่อใน Claude Session ใหม่

---

## 1. TCM Standard BOQ Items (อาคารสำนักงาน)

ข้อมูลนี้ได้จากการศึกษา BOQ จริงของ TCM (แบบ ปร.4 อาคารสำนักงาน)  
ใช้เป็น Reference สำหรับ AI ในการถอดปริมาณและตรวจสอบ BOQ

---

### 1.1 งานฝ้าเพดาน (Ceiling Works) — หน่วย: ตร.ม.

| รหัส | รายการ |
|------|--------|
| C1 | ฝ้ายิปซั่มบอร์ด 9มม. ฉาบเรียบทาสีน้ำพลาสติก โครงเหล็กชุบสังกะสี |
| C1-เล่นระดับ | ฝ้าเล่นระดับยิปซั่มบอร์ด 9มม. ฉาบเรียบทาสี |
| C2 | ฝ้ายิปซั่มบอร์ด 9มม. ชนิดกันชื้น โครงเหล็กชุบสังกะสี |
| C3 | ฝ้าตะแกรง Aluminium Cell Ceiling ช่อง 5×5 ซม. |
| C4 | ฝ้าเพดานอะคูสติก โครงเหล็กชุบสังกะสี ระบบซ่อนโครง |
| C5 | ฝ้าแต่งผิวฉาบเรียบทาสีน้ำอะครีลิค (คสล. เดิม) |
| C6 | ฝ้าระแนงไม้เทียม |
| C7 | ฝ้าชายคาแผ่นฝ้าตกแต่งสำเร็จรูป โครงเหล็กชุบสังกะสี |

---

### 1.2 งานผนังและผิวผนัง (Wall Works)

| รหัส | รายการ | หน่วย |
|------|--------|-------|
| P1 | ผนังก่ออิฐมอญครึ่งแผ่น ฉาบเรียบทาสีน้ำอะคริลิค 100% | ตร.ม. |
| P1A | ผนังก่ออิฐมอญเต็มแผ่น ฉาบเรียบทาสีน้ำอะคริลิค 100% | ตร.ม. |
| P2 | ผนังก่ออิฐมอญครึ่งแผ่น กรุกระเบื้องโฮโมจีเนียส 0.60×0.60 ม. | ตร.ม. |
| P2A | ผนังก่ออิฐมอญเต็มแผ่น กรุกระเบื้องโฮโมจีเนียส 0.60×0.60 ม. | ตร.ม. |
| P3 | ผนัง คสล. กรุกระเบื้องโฮโมจีเนียส 0.60×0.60 ม. | ตร.ม. |
| P4 | ผนัง คสล. ฉาบเรียบทาสีน้ำอะคริลิค 100% | ตร.ม. |
| P5 | ผนังทาสีน้ำมัน | ตร.ม. |
| P6 | ผนังกรุหินแกรนิต | ตร.ม. |
| P7 | ผนังกรุแผ่นยิปซั่มบอร์ด 12มม. โครงเคร่าสำเร็จรูป | ตร.ม. |
| — | บัวหินขัด สูง 10 ซม. | ม. |
| — | บัวพื้นสำเร็จรูป PVC สูง 10ซม. หนา 8มม. | ม. |
| — | บัวสีน้ำมัน สูง 10 ซม. | ม. |

---

### 1.3 งานผิวพื้น (Floor Works)

| รหัส | รายการ | หน่วย |
|------|--------|-------|
| F1 | พื้นกระเบื้องพอร์ซเลน 0.60×0.60 ม. | ตร.ม. |
| F2 | พื้นปรับระดับ+กันซึม+กระเบื้องพอร์ซเลนโฮโมจีเนียส 0.60×0.60 ม. | ตร.ม. |
| F3 | พื้นปูหินแกรนิต | ตร.ม. |
| F4 | พื้นทรายล้าง เบอร์ 4 สีน้ำตาล | ตร.ม. |
| F5 | พื้นขัดมัน Epoxy Coating Self Leveling | ตร.ม. |
| F6 | พื้น คสล. ผิวขัดหยาบ ปรับระดับ | ตร.ม. |
| F7 | พื้นแกรนิตโต 0.60×0.60 ม. ผิวด้าน | ตร.ม. |
| F8 | พื้น คสล.+น้ำยากันซึม ผิวขัดมัน เคลือบ Polyurethane | ตร.ม. |
| F9 | พื้นกระเบื้องแกรนิตโต 80×80 ซม. | ตร.ม. |
| F10 | พื้นกระเบื้องยาง PVC (ม้วน) กันประจุไฟฟ้าสถิต | ตร.ม. |
| — | เส้นแบ่งพื้นแสตนเลส กว้าง 5มม. | ม. |

---

### 1.4 งานประตู-หน้าต่าง (Doors & Windows) — หน่วย: ชุด

**ประตู**
- ประตูหนีไฟ ขนาด 1000×2050 มม. พร้อมบาร์ผลัก
- ประตูบานเปิดเดี่ยว WPC (หลายขนาด: 900×2050, 800×2050 ฯลฯ)
- ประตูบานเลื่อนเดี่ยว WPC
- ประตูบานเลื่อนเดี่ยวอลูมิเนียม
- ประตูบานเปิดเดี่ยว/คู่ เหล็ก
- ประตูบานเปิดคู่/สวิงอลูมิเนียม กระจก (หลายขนาด)
- ประตูบานเปิดคู่ WPC (หลายขนาด)
- ประตูบานเปิดคู่ไม้เนื้อแข็ง (หลายขนาด)

**หน้าต่าง**
- หน้าต่างบานกระทุ้ง/ติดตาย/เปิด/เลื่อน/เกร็ด อลูมิเนียม (หลายขนาด)

---

### 1.5 งานสุขภัณฑ์ (Sanitary Works)

| รายการ | หน่วย |
|--------|-------|
| โถสุขภัณฑ์ชักโครก / ระบบฟลัชวาล์ว พร้อมอุปกรณ์ | ชุด |
| สายฉีดชำระ | ชุด |
| โถปัสสาวะชาย พร้อมอุปกรณ์ | ชุด |
| อ่างล้างหน้าฝังใต้เคาน์เตอร์ พร้อม Top หินแกรนิต | ชุด |
| อ่างล้างหน้าชนิดแขวนผนัง พร้อมอุปกรณ์ | ชุด |
| ก๊อกน้ำเดี่ยว/คู่ / ฝักบัว / ก๊อกสนาม | ชุด |
| ที่ใส่กระดาษชำระ / สบู่แข็ง / สบู่เหลว | ชุด |
| ราวแขวนผ้า / เครื่องเป่าลมร้อน | ชุด |
| ราวจับคนพิการ ตั้งพื้น / รูปตัวแอล | ชุด |
| กระจกเงาบานเปลือย / กระจกเงาสำเร็จรูป | ชุด |
| กระจกกั้นอาบน้ำ Tempered Glass | ชุด |
| ผนังกั้นห้องน้ำสำเร็จรูป HPL พร้อมประตู | ชุด |
| ฝาท่อระบายน้ำ FD. แสตนเลส | ชุด |

---

### 1.6 งานหลังคา (Roof Works)

| รายการ | หน่วย |
|--------|-------|
| หลังคาแผ่นเหล็กรีดลอน 0.40มม. บุฉนวน PU 40K หนา 1 นิ้ว | ตร.ม. |
| ครอบสันหลังคาเหล็กรีดลอน | ม. |
| ครอบข้างหลังคาเหล็กรีดลอน | ม. |
| เชิงชาย+ทับเชิงชายไม้สำเร็จรูป 6" | ม. |
| สกรูยึดแผ่นหลังคา | ตัว |

---

### 1.7 งานเบ็ดเตล็ดและภายนอก

| รายการ | หน่วย |
|--------|-------|
| จมูกบันไดอลูมิเนียม | ม. |
| ราวบันไดไม้เนื้อแข็ง / ปูนปั้น | ม. |
| ราวจับแสตนเลส / เสาแสตนเลส / ลูกกรงแสตนเลส | ม. / ต้น |
| เหล็กดัดรมดำ Ø6มม. | ตร.ม. |
| ผิวหน้า Ramp กรวดล้าง / เซาะร่อง | ตร.ม. |
| ตัวอักษรสแตนเลส / ตราสัญลักษณ์ | ชุด |

---

## 2. Prompt Engineering Guide

### 2.1 System Prompt สำหรับ Takeoff (ดีที่สุด)

```
You are an expert QS for TCM company Thailand. You know TCM standard BOQ items:
Ceiling: C1=Gypsum9mm painted, C2=WaterproofGypsum, C3=AluminiumCell, 
         C4=Acoustic, C5=PlasterPainted, C6=WoodSlat, C7=FinishedEave
Wall: P1=BrickPlasterPaint, P2=BrickCeramic60x60, P3=ConcreteWallCeramic, 
      P4=ConcreteWallPaint, P5=OilPaint, P6=Granite, P7=Gypsum12mm
Floor: F1=Porcelain60x60, F2=WaterproofPorcelain, F3=Granite, F4=WashedGravel, 
       F5=EpoxyCoating, F6=RoughConcrete, F7=Granito60, F8=WaterproofPolyurethane, 
       F9=Granito80, F10=PVCRubber
Doors: FireDoor, WPCDoor(single/double/sliding), AluminiumDoor, SteelDoor, HardwoodDoor
Windows: AluminiumWindow(casement/fixed/sliding/louvre)
Sanitary: FlushValve/SyphonToilet, Urinal, Washbasin(undercounter/wallhung), 
          Faucet, Mirror, ToiletPartition HPL

Output ONLY raw JSON starting with { ending with }. Zero other text.
```

### 2.2 User Prompt สำหรับ Takeoff

```
[Files: PDF/Image แนบไป]

Analyze the attached construction drawing file(s).
Extract quantity takeoff for discipline keys: {discKeys}.
IMPORTANT TO AVOID TRUNCATION:
- Keep description under 60 chars each
- Keep note under 40 chars each
- Include max 8 items per discipline
- Use short Thai/English descriptions

REQUIRED SCHEMA:
{
  "projectName": "...",
  "totalArea": 0,
  "scale": "1:100",
  "categories": [
    {
      "discipline": "architectural",
      "items": [
        {
          "code": "A-001",
          "description": "งานฝ้าเพดาน Gypsum Board",
          "unit": "m2",
          "qty": 820,
          "unitPrice": 450,
          "total": 369000,
          "note": ""
        }
      ]
    }
  ],
  "grandTotal": 0,
  "legalFlags": ["..."],
  "readingNotes": "..."
}
```

### 2.3 System Prompt สำหรับ BOQ vs BOQ

```
You are an expert BOQ comparison analyst in Thailand. 
Output ONLY raw JSON. Start with { end with }. Zero other text.
```

### 2.4 User Prompt สำหรับ BOQ vs BOQ

```
Compare the 2 BOQ documents. Use Thai baht prices. 
Output ONLY raw JSON starting with {:
{
  "mode": "bb",
  "boq1Name": "...",
  "boq2Name": "...",
  "boq1Total": 0,
  "boq2Total": 0,
  "difference": 0,
  "differencePercent": 0.0,
  "winner": "boq1",
  "winnerReason": "Thai reason",
  "summary": "Thai summary",
  "items": [
    {
      "category": "...",
      "description": "...",
      "boq1Value": 0,
      "boq2Value": 0,
      "diff": 0,
      "diffPercent": 0.0,
      "remark": "..."
    }
  ],
  "onlyInBoq1": ["..."],
  "onlyInBoq2": ["..."],
  "risks": ["Thai risk"],
  "recommendation": "Thai recommendation"
}
```

### 2.5 User Prompt สำหรับ Drawing vs BOQ

```
Verify the BOQ against the construction drawings. 
Use TCM standard BOQ items as reference.
Output ONLY raw JSON starting with {:
{
  "mode": "dvb",
  "projectName": "...",
  "boqName": "...",
  "overallMatch": 85,
  "overallStatus": "mostly_match",
  "summary": "Thai summary",
  "items": [
    {
      "code": "A-001",
      "description": "...",
      "unit": "m2",
      "qtyFromDrawing": 820,
      "qtyFromBOQ": 800,
      "qtyDiff": 20,
      "qtyDiffPercent": 2.5,
      "priceFromBOQ": 450,
      "totalFromDrawing": 369000,
      "totalFromBOQ": 360000,
      "status": "match",
      "statusLabel": "ตรงกัน",
      "remark": ""
    }
  ],
  "missingInBOQ": ["..."],
  "extraInBOQ": ["..."],
  "totalFromDrawing": 0,
  "totalFromBOQ": 0,
  "totalDiff": 0,
  "risks": ["Thai risk"],
  "recommendation": "Thai recommendation"
}
```

---

## 3. JSON Repair Logic (pJSON Function)

ปัญหาที่พบบ่อย: AI ตอบ JSON แต่ถูกตัดกลางคันเพราะ Token หมด  
วิธีแก้ที่ใช้:

```javascript
function pJSON(raw) {
  // 1. Direct parse — ideal
  try { return JSON.parse(s); } catch {}

  // 2. Find last COMPLETE item using regex
  // Complete item = มี "code" + "total" + ปิดด้วย }
  const itemRe = /\{"code"\s*:[\s\S]*?"total"\s*:\s*[\d.]+[\s\S]*?\}/g;
  const matches = [...s.matchAll(itemRe)];
  
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const partial   = s.slice(0, lastMatch.index + lastMatch[0].length);
    // Close: items array → category → categories array → root
    const closing   = '\n      ]\n    }\n  ],\n  "grandTotal":0,...\n}';
    return JSON.parse(partial + closing);
  }
}
```

---

## 4. Discipline Name Normalization

AI คืน discipline ได้หลายรูปแบบ ต้องทำ mapping ก่อนเสมอ:

```javascript
const discNorm = {
  // Architectural
  'architectural':'architectural', 'architecture':'architectural',
  'สถาปัตยกรรม':'architectural', 'arch':'architectural',
  // Structural
  'structural':'structural', 'structure':'structural',
  'โครงสร้าง':'structural', 'struct':'structural',
  // Mechanical
  'mechanical':'mechanical', 'hvac':'mechanical',
  'งานระบบ m':'mechanical', 'mech':'mechanical', 'm':'mechanical',
  // Electrical
  'electrical':'electrical', 'electric':'electrical',
  'งานระบบ e':'electrical', 'elec':'electrical', 'e':'electrical',
  // Plumbing
  'plumbing':'plumbing', 'sanitary':'plumbing',
  'งานระบบ p':'plumbing', 'plumb':'plumbing', 'p':'plumbing',
  // Fire
  'fire':'fire', 'fire protection':'fire', 'f':'fire',
  // Civil & Interior
  'civil':'civil', 'landscape':'civil', 'โยธา':'civil',
  'interior':'interior', 'ตกแต่ง':'interior', 'int':'interior',
};
```

---

## 5. Legal Rules ที่ระบบตรวจสอบ

```javascript
const LEGAL = [
  'แนวร่นอาคารตาม พ.ร.บ.ควบคุมอาคาร มาตรา 8',
  'FAR (Floor Area Ratio) ตามผังเมืองรวม',
  'ความสูงอาคาร > 23m ต้องขออนุญาตพิเศษ กฎกระทรวง ฉบับที่ 33',
  'จำนวนที่จอดรถขั้นต่ำ กฎกระทรวง ฉบับที่ 7',
  'ระยะทางหนีไฟ ≤ 60m กฎกระทรวง ฉบับที่ 47',
  'บันไดหนีไฟ ≥ 1.2m กฎกระทรวง ฉบับที่ 47 มาตรา 8',
  'ช่องเปิดผนังรับน้ำหนัก ต้องเสริมคานทับหลัง มาตรฐาน วสท.',
  'ระบบไฟฉุกเฉิน บังคับสำหรับอาคารสูงและอาคารสาธารณะ',
];
```

---

## 6. ฟีเจอร์ที่ยังไม่ได้พัฒนา (Backlog)

| ฟีเจอร์ | Priority | หมายเหตุ |
|---------|----------|----------|
| บันทึก/โหลด Project | สูง | localStorage หรือ JSON export/import |
| History การถอดปริมาณ | สูง | เก็บหลาย Session |
| PDF Viewer inline | กลาง | แสดงแบบในหน้าเดียวกับ BOQ |
| ราคาวัสดุ Reference | กลาง | ดึงราคาตลาดปัจจุบัน |
| Print / PDF Export | กลาง | พิมพ์ BOQ เป็น PDF |
| Multi-language | ต่ำ | อังกฤษ/ไทย toggle |
| User Auth | ต่ำ | Login สำหรับทีม |

---

## 7. การ Handoff ไปยัง Session ใหม่

เมื่อเริ่ม Session ใหม่ใน Claude ให้แนบไฟล์เหล่านี้:

1. **`BASE.md`** — โครงสร้างโปรเจกต์และ Tech Stack
2. **`SKILL.md`** — ไฟล์นี้ (BOQ Knowledge + Prompt Guide)
3. **`TCM_QTO_Agent.html`** — Source code ปัจจุบัน

แล้วบอก Claude ว่า:
> "นี่คือ TCM ConstructAI QTO Agent ที่กำลังพัฒนาอยู่ อ่าน BASE.md และ SKILL.md เพื่อทำความเข้าใจโครงสร้าง แล้วช่วย [สิ่งที่ต้องการต่อ]"

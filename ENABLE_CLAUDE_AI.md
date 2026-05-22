# 🤖 เปิดใช้งาน Real Claude AI (Optional)

ระบบมี **AI 2 โหมด:**

| โหมด | สถานะปัจจุบัน | คุณภาพ | ค่าใช้จ่าย |
|------|---------------|--------|----------|
| 🟢 **Smart Search (Local)** | ✅ เปิดใช้งานแล้ว | ดีมาก | $0 (ฟรี) |
| 🔵 **Claude Haiku 4.5 (Real AI)** | ⏳ ต้องเพิ่ม API Key | ดีที่สุด | ~$1-3/เดือน |

---

## 🟢 Smart Search (โหมดปัจจุบัน)

**ทำงานได้แล้ว!** เข้าใจคำสั่งดังต่อไปนี้:

### 🔍 ค้นหา
- "หา EIA ล่าสุดของ MRT-PP"
- "ขอ BOQ ของโครงการ ABC"
- "แบบทั้งหมดในโครงการ MRT"
- "ไฟล์ MOM"

### ⏰ ตามเวลา
- "ไฟล์ที่อัพโหลดเมื่อวาน"
- "เอกสารวันนี้"
- "อัพโหลดในสัปดาห์นี้"
- "ไฟล์ใน 7 วันที่ผ่านมา"
- "เอกสารเดือนนี้"

### 📏 ตามขนาด
- "ไฟล์ใหญ่กว่า 5MB"
- "เอกสารเล็กกว่า 1MB"
- "ไฟล์ที่ใหญ่ที่สุด"
- "ไฟล์เล็กสุด"

### 👥 ตามผู้อัพโหลด
- "ของที่นภัสวรรณอัพ"
- "ไฟล์โดย Somchai"
- "ใครอัพไฟล์เยอะที่สุด"

### 📊 สถิติ
- "มีโครงการอะไรบ้าง"
- "MOM กี่ฉบับ"
- "สรุปไฟล์ทั้งระบบ"
- "ระบบมีอะไรบ้าง"

### 🎯 รวมเงื่อนไข
- "EIA ของ MRT ที่อัพเมื่อวาน"
- "BOQ ใหญ่กว่า 2MB ของโครงการ ABC"
- "ไฟล์แบบที่อัพในเดือนนี้"

### 📦 Zip
- "Zip ทั้งโครงการ MRT"
- "ดาวน์โหลดทั้งหมดของ ABC"

---

## 🔵 Real Claude AI (โหมดเสริม)

ถ้าต้องการ AI ที่เข้าใจภาษาธรรมชาติได้ลึกซึ้งกว่า สามารถเปิดใช้ **Claude Haiku 4.5** ผ่าน Anthropic API

### ✨ ข้อดี vs Smart Search

| คุณสมบัติ | Smart Search | Claude AI |
|----------|--------------|-----------|
| คำถามตรงๆ | ✅ ดีมาก | ✅ ยอดเยี่ยม |
| คำถามซับซ้อน | ⚠️ พอใช้ | ✅ ยอดเยี่ยม |
| ภาษาธรรมชาติ | ⚠️ จำกัด | ✅ เข้าใจเต็มที่ |
| เหตุผลที่ตอบ | ❌ ไม่มี | ✅ มี explanation |
| คำถามต่อเนื่อง | ❌ ไม่จำ | ⚠️ ระดับ session |
| ความเร็ว | ⚡ ทันที (<0.5s) | 🕐 1-3 วินาที |
| ค่าใช้จ่าย | $0 | ~$0.01/คำถาม |

---

## 🚀 วิธีเปิดใช้ Real Claude AI

### **Step 1: สมัคร Anthropic Console**

1. ไป **https://console.anthropic.com**
2. **Sign Up** ด้วย email
3. ยืนยัน email

### **Step 2: เติมเงิน Credit**

1. ใน Console → **Billing** → **Add Credits**
2. **แนะนำเริ่มต้น: $5** (พอใช้ ~500 คำถาม)
3. ใช้บัตร Credit Card

### **Step 3: สร้าง API Key**

1. ใน Console → **API Keys**
2. **Create Key**
3. **ตั้งชื่อ:** `TCM-Document-Agent`
4. **Copy Key** (ขึ้นต้น `sk-ant-api...`)
5. **บันทึกที่ปลอดภัย!** (ไม่สามารถดูซ้ำได้)

### **Step 4: ใส่ Key ใน Vercel**

1. **Vercel Dashboard** → Project `teamcm-doc-agent`
2. **Settings** → **Environment Variables**
3. **Add New:**
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-xxxxxx...` (Paste key)
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
4. **Save**

### **Step 5: Redeploy**

1. **Vercel** → **Deployments**
2. **คลิก ⋮** ที่ deployment ล่าสุด
3. **Redeploy** → **Use existing build cache** ✅
4. **Redeploy**
5. **รอ 1-2 นาที**

### **Step 6: ทดสอบ**

1. **เปิดเว็บ** https://teamcm-doc-agent.vercel.app
2. **คลิก AI Chat** (ปุ่ม Sparkles มุมล่างขวา)
3. **ลองถาม:** "ขอเอกสารที่เกี่ยวข้องกับโครงสร้างของอาคาร ABC"
4. **ดูใต้คำตอบ** → จะแสดง **⚡ Claude AI** ถ้าเปิดใช้สำเร็จ

✅ **เสร็จเรียบร้อย!** AI Chat ใช้ Claude Haiku 4.5 จริงแล้ว

---

## 💰 ค่าใช้จ่าย Claude API

### **Claude Haiku 4.5 Pricing**
- **Input:** $0.80 / 1M tokens (≈ 750K คำ)
- **Output:** $4.00 / 1M tokens (≈ 750K คำ)

### **ประมาณการ:**
| Usage | ต้นทุน |
|-------|-------|
| 1 คำถาม | $0.008 - $0.015 |
| 100 คำถาม | $0.80 - $1.50 |
| 1,000 คำถาม | $8 - $15 |
| **ทีม 10 คน × 20 คำถาม/วัน** | **$2-5/เดือน** |

### **กลไกควบคุมงบ**
- ตั้ง **Budget Alert** ใน Anthropic Console
- ตั้ง **Spend Limit** เพื่อหยุดอัตโนมัติเมื่อใช้เกิน

---

## 🔄 Smart Fallback

ระบบ **ออกแบบมาดี** มาก ถึงจะเปิด Claude API แล้ว:

1. ✅ **Claude API ทำงาน** → ใช้ Real AI
2. ⚠️ **Claude API down** → Auto fallback to Smart Search
3. ❌ **API Key หมดเงิน** → Auto fallback to Smart Search
4. 🌐 **Network ช้า** → Auto fallback to Smart Search

**ผลคือทีมจะใช้งานได้เสมอ** ไม่ว่า Claude API จะมีปัญหาหรือไม่

---

## 🛡️ ความปลอดภัย

### **API Key ปลอดภัยอย่างไร?**

✅ **เก็บที่ฝั่ง Server เท่านั้น** (Vercel env vars)
✅ **ไม่เปิดเผยต่อ browser** (เรียกผ่าน `/api/chat`)
✅ **HTTPS encrypted** ตอนส่งข้อมูล
✅ **CORS protected** (เฉพาะ domain ของเรา)

### **ข้อมูลที่ส่งไป Claude**

ส่งไปเฉพาะ:
- ✅ คำถามผู้ใช้
- ✅ รายชื่อโครงการ (code + name + จำนวนไฟล์)
- ✅ รายชื่อไฟล์ (filename + type + size + date + uploader)

**ไม่ส่ง:**
- ❌ เนื้อหาในไฟล์
- ❌ Email ผู้ใช้
- ❌ Password
- ❌ ไฟล์จริง (PDF, Excel, etc.)

---

## 🚫 ถ้าไม่อยากใช้ Claude API

**ไม่ต้องทำอะไรเลย!** ระบบใช้ **Smart Search (Local)** อยู่แล้ว ทำงานได้ดีและฟรี 100%

---

## 📞 ติดต่อ

หากมีปัญหาเรื่อง Setup → ติดต่อ Admin: `Nitid_S@teamcm.co.th`

---

**TCM Document Agent** · AI Configuration Guide
© 2025 TCM

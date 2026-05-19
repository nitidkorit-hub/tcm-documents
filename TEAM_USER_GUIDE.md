# 👥 TCM Document Agent - Team User Guide

**สำหรับ:** ทีม 5-10 คน  
**ภาษา:** ไทย  
**เวลาอ่าน:** 5 นาที

---

## 🎯 วิธีเข้าใช้ (ครั้งแรก)

### 1️⃣ Sign Up (สมัคร)

```
1. ไปที่: https://tcm-document-agent.vercel.app
2. Click: "Sign up"
3. ใส่:
   - Email: your-email@teamcm.co.th
   - Password: ตั้งรหัสของคุณ (จำเอาไว้!)
4. Click: "Sign Up"
5. ไปเช็ค Email inbox → ยืนยัน email
6. Kembali app → Login
7. ✅ เข้าได้แล้ว!
```

---

## 📊 Dashboard (หน้าแรก)

```
┌─────────────────────────────────┐
│  TCM Document Agent             │
├─────────────────────────────────┤
│                                 │
│  📊 Stat Cards:                 │
│  ├─ โครงการทั้งหมด              │
│  ├─ ไฟล์ทั้งหมด                 │
│  ├─ เพิ่มใหม่ 7 วัน             │
│  └─ พื้นที่ใช้งาน                │
│                                 │
│  📁 โครงการล่าสุด:              │
│  ├─ MRT-PP                      │
│  ├─ ABC-HQ                      │
│  ├─ M7-EXT                      │
│  └─ HSM-RES                     │
│                                 │
│  📈 กิจกรรมล่าสุด:              │
│  ├─ Nitid uploaded file.pdf     │
│  ├─ Admin updated project       │
│  └─ ...                         │
└─────────────────────────────────┘
```

---

## 💼 การใช้งาน (5 ขั้นตอน)

### ขั้นตอน 1: เลือก Project

```
1. Click ที่ชื่อโครงการ (เช่น "MRT-PP")
2. Drawer เปิดมาด้านขวา
3. เห็นรายการไฟล์ทั้งหมด
```

### ขั้นตอน 2: ค้นหาไฟล์

```
1. ใน Drawer มี Search box
2. พิมพ์ชื่อไฟล์ (เช่น "EIA")
3. ผลการค้นหาแสดงเลย
```

### ขั้นตอน 3: Filter ตามประเภท

```
1. ใน Drawer มี Filter chips:
   ├─ ทั้งหมด
   ├─ EIA
   ├─ แบบ
   ├─ สัญญา
   ├─ MOM
   ├─ BOQ
   ├─ มาตรฐาน
   ├─ แรงงาน
   └─ อื่นๆ

2. Click ประเภทที่ต้องการ
3. แสดงเฉพาะประเภทนั้น
```

### ขั้นตอน 4: ดาวน์โหลด/ดู

```
1. หาไฟล์ที่ต้องการ
2. Click ไอคอน 👁️ = ดูตัวอย่าง
3. Click ไอคอน ⬇️ = ดาวน์โหลด
4. ไฟล์เซฟลงคอม
```

### ขั้นตอน 5: Version History

```
1. ไฟล์บางอย่างมี Rev1, Rev2, Rev3...
2. ล่าสุด = มีแบจ "ล่าสุด" สีเขียว
3. เก่า = มีแบจ "เก่า" สีเทา
4. Download เวอร์ชั่นที่ต้องการ
```

---

## 📤 Upload Document (อัปโหลด)

```
1. Click ปุ่ม "อัปโหลด" (สีน้ำเงิน)
2. Modal เปิดมา
3. เลือก Project:
   ├─ MRT-PP
   ├─ ABC-HQ
   ├─ M7-EXT
   └─ HSM-RES
4. เลือกประเภท:
   ├─ 🤖 จัดประเภทอัตโนมัติ (แนะนำ)
   ├─ EIA
   ├─ แบบ
   ├─ สัญญา
   ├─ MOM
   ├─ BOQ
   ├─ มาตรฐาน
   ├─ แรงงาน
   └─ อื่นๆ
5. Drag ไฟล์ลงมา หรือ Click เลือกไฟล์
6. รอ Upload progress (100%)
7. Click "ยืนยันอัปโหลด"
8. ✅ เสร็จ!
```

---

## 🤖 AI Chat (ถามหาเอกสาร)

```
1. Click ปุ่มสีน้ำเงิน ล่างขวา (ไอคอน ✨)
2. Chat panel เปิดมา
3. พิมพ์คำถาม:
   - "หา EIA ล่าสุดของ MRT-PP"
   - "รวม Zip โครงการ ABC"
   - "มี MOM กี่ฉบับ?"
4. AI ตอบและแสดง option:
   - ไฟล์ที่จะดาวน์โหลด
   - Project ที่จะ zip
5. Click ปุ่มสีเขียว = ดาวน์โหลด
```

---

## 📋 ความหมายของสัญลักษณ์

| สัญลักษณ์ | ความหมาย |
|----------|---------|
| 👁️ | ดูตัวอย่าง (Preview) |
| ⬇️ | ดาวน์โหลด |
| 🗑️ | ลบไฟล์ |
| 📦 | Zip ทั้งโครงการ |
| ⚡ | Zip เฉพาะล่าสุด |
| ✨ | AI Chat ถามหา |
| 🔍 | ค้นหา |
| 📌 | Filter |

---

## 🎨 Color Codes

| สี | ประเภท | ตัวอย่าง |
|----|--------|---------|
| 🟢 | EIA | สิ่งแวดล้อม |
| 🔵 | แบบ | Drawings |
| 🟣 | สัญญา | Contracts |
| 🟠 | แรงงาน | Labor |
| 🔷 | มาตรฐาน | Standards |
| 🌸 | MOM | Minutes |
| 🔴 | ราคา | BOQ |
| ⚫ | อื่นๆ | Other |

---

## 💾 Helpful Tips

✅ **Tips ที่ดี:**

1. **ตั้งชื่อไฟล์อย่างชาญฉลาด**
   - ✅ ดี: `EIA_MRT-PP_Rev3.pdf`
   - ❌ ไม่ดี: `document.pdf` หรือ `eiafile123.pdf`

2. **ใช้ประเภทที่ถูกต้อง**
   - ✅ ดี: Upload "แบบ" → type = "แบบ"
   - ❌ ไม่ดี: Upload "แบบ" → type = "อื่นๆ"

3. **Check ไฟล์เก่าก่อน upload ใหม่**
   - ✅ ดี: Upload Rev3 หลังจาก Rev2
   - ❌ ไม่ดี: Upload Rev1 ซ้ำ

4. **Download รุ่นที่ถูกต้อง**
   - ✅ ดี: ใช้ "ล่าสุด" (latest) เพื่อเวิร์ก
   - ❌ ไม่ดี: ใช้ "เก่า" ที่ out-of-date

---

## ❓ FAQ (คำถามที่ถามบ่อย)

### Q: ลืมรหัส?
```
A: Click "Forgot password?" → ใส่ email 
   → ยืนยันใน email inbox
```

### Q: ไม่เห็นไฟล์ที่อัปโหลด?
```
A: 1. Refresh page
   2. Check ถูก project ไหม
   3. Check filter ถูกไหม
```

### Q: ไฟล์ upload ล้มเหลว?
```
A: 1. Check ขนาดไฟล์ (< 100MB)
   2. Check internet connection
   3. Try again
```

### Q: Zip download ล้มเหลว?
```
A: 1. Check มีไฟล์ในโครงการไหม
   2. Refresh → Try again
   3. Báo admin ถ้ายังล้มเหลว
```

### Q: ปล่อยให้ AI chat ทำได้ไหม?
```
A: ได้! AI ช่วย:
   - ค้นหาไฟล์
   - ดาวน์โหลด
   - ตอบคำถาม
   - Zip project
```

---

## 🔐 Security Tips

⚠️ **ความปลอดภัย:**

- [ ] ไม่บอกรหัส โครงการอื่นๆ
- [ ] Logout เมื่อเสร็จใช้
- [ ] ไม่แชร์ account
- [ ] แจ้ง admin ถ้าเป็นปัญหา security

---

## 📞 สอบถาม

**Admin:** Nitid_S@teamcm.co.th

**Issues:**
- ไฟล์หาย?
- Upload ล้มเหลว?
- ปัญหาเทคนิค?

→ Email admin ทันที

---

## ✅ Checklist (ครั้งแรก)

- [ ] Sign up เรียบร้อย
- [ ] Login ได้
- [ ] หา project ได้
- [ ] หา document ได้
- [ ] Download ได้
- [ ] Upload ได้
- [ ] ค้นหาได้

---

## 🎯 Next Steps

1. **Explore**: ลองเล่นดู
2. **Upload**: Upload document ของคุณ
3. **Share**: ให้ทีม access
4. **Collaborate**: ทำงานร่วมกัน

---

**Happy document managing! 🎉**

---

**Last updated:** 2025  
**Version:** 1.0

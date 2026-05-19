# 🚀 TCM Document Agent - Setup Guide

**สำหรับ:** Admin (Nitid_S@teamcm.co.th)  
**Project:** TCM Document Agent  
**Deployment:** Vercel + Supabase + GitHub  
**เวลา:** ~45 นาที

---

## 📋 ขั้นตอนการตั้งค่า (ตามลำดับ)

### **Step 1: Supabase Setup (15 นาที)**

#### 1.1 สร้าง Supabase Project
```
1. ไป https://supabase.com
2. Click "Sign Up" → ใช้เมล: Nitid_S@teamcm.co.th
3. ตั้งรหัสผ่าน (จำเอาไว้!)
4. Verify email
5. Click "Create New Project"
   - Project name: "TCM-Documents"
   - Password: ใส่รหัส (จำเอาไว้!)
   - Region: Singapore (เร็วที่สุดสำหรับไทย)
   - Click "Create new project"
6. รอ ~2-3 นาที (status bar)
```

#### 1.2 รัน SQL Schema
```
1. ไปที่ Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy ทั้งหมดจากไฟล์ "SQL_SCHEMA.sql"
4. Paste ลงใน SQL Editor
5. Click "Run" (สีน้ำเงิน)
6. รอจนสำเร็จ (ไม่มี error)
```

#### 1.3 ตั้ง Authentication
```
1. ไปที่ Authentication → Providers
2. Email: ✅ (เปิดอยู่แล้ว)
3. Google (Optional):
   - Click "Google"
   - Copy "Client ID" & "Client Secret" จาก Google Cloud
   - Paste ลง Supabase
   - Save
4. สำเร็จ!
```

#### 1.4 สร้าง Storage Bucket
```
1. ไปที่ Storage → Buckets
2. Click "+ New bucket"
   - Name: "documents"
   - Make it public: ✅ (check)
   - Click "Create bucket"
3. สำเร็จ!
```

#### 1.5 Get API Keys
```
1. ไปที่ Settings → API
2. Copy:
   - "Project URL" → paste ลง .env VITE_SUPABASE_URL
   - "anon public" key → paste ลง .env VITE_SUPABASE_ANON_KEY
3. หลังจากนี้ยังไม่ save .env ปกติ (ทำต่อใน Step 3)
```

---

### **Step 2: GitHub Setup (5 นาที)**

#### 2.1 สร้าง Repository
```
1. ไป https://github.com/nitidkorit-hub
2. Click "+" → "New repository"
3. ตั้งค่า:
   - Repository name: "tcm-documents"
   - Description: "TCM Document Agent - Team collaboration"
   - Visibility: Private (แนะนำ) หรือ Public
   - ✅ Add .gitignore → Node.js
   - ✅ Add a README file
   - Click "Create repository"
4. Copy: "HTTPS" clone URL
```

#### 2.2 Clone & Push Code
```bash
# ในคอมพิวเตอร์
cd "D:/AI Project/AI Agent Document"

# Clone repo ที่สร้างมา
git clone https://github.com/nitidkorit-hub/tcm-documents.git

# หรือ init repo ใหม่
git init
git remote add origin https://github.com/nitidkorit-hub/tcm-documents.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: TCM Document Agent setup

- React + Supabase integration
- Full file management system
- Team collaboration features"

# Push
git branch -M main
git push -u origin main
```

---

### **Step 3: Environment Configuration (5 นาที)**

#### 3.1 สร้าง .env.local
```
ใน folder: D:\AI Project\AI Agent Document

สร้างไฟล์: .env.local

Paste:
---
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...xxx
---

(ใช้ค่า API keys จาก Step 1.5)
```

#### 3.2 ทดสอบ Local
```bash
cd "D:/AI Project/AI Agent Document"

# Install dependencies
npm install

# Run dev server
npm run dev

# ควร output:
# ✓ Local: http://localhost:5173/

# ทดสอบ:
1. ไปที่ http://localhost:5173
2. Click "Sign up"
3. ใส่ email: test@example.com
4. ใส่รหัส: Test123!
5. ควรจะ redirect เข้า Dashboard
6. ✅ ถ้าเข้าได้ = OK!

# Ctrl+C เพื่อหยุด
```

---

### **Step 4: Vercel Deployment (10 นาที)**

#### 4.1 สร้าง Vercel Project
```
1. ไป https://vercel.com
2. Sign up → ใช้เมล: Nitid_S@teamcm.co.th
3. Click "Import Project"
4. Select: GitHub repository "tcm-documents"
5. Click "Import"
```

#### 4.2 ตั้ง Environment Variables
```
1. ในหน้า Vercel Deploy Settings
2. ไปที่ "Environment Variables"
3. Add:
   - Name: VITE_SUPABASE_URL
     Value: https://xxxx.supabase.co
   - Name: VITE_SUPABASE_ANON_KEY
     Value: eyJhbGc...xxx
4. Click "Save"
```

#### 4.3 Deploy
```
1. Vercel จะ auto-detect framework (React/Vite)
2. Click "Deploy"
3. รอ ~3-5 นาที (สีน้ำเงิน = in progress)
4. เมื่อเสร็จ (สีเขียว) = ✅
5. Copy URL: tcm-document-agent.vercel.app
```

---

### **Step 5: Testing (10 นาที)**

#### 5.1 Live Testing
```
1. ไป https://tcm-document-agent.vercel.app
2. Sign up: ใส่ email + password
3. Verify email (ไปเช็ค inbox)
4. Login
5. สำเร็จ! 🎉
```

#### 5.2 Functional Testing
```
ทดสอบฟีเจอร์:

[ ] Sign up works
[ ] Login works
[ ] Create project (click "Projects")
[ ] Upload file (click "Upload")
[ ] Download file
[ ] Search in drawer
[ ] View timeline
[ ] Switch project
[ ] Logout
```

---

### **Step 6: Team Invite (5 นาที)**

#### 6.1 เชิญสมาชิกทีม
```
1. ให้ทีมเข้า https://tcm-document-agent.vercel.app
2. Click "Sign up"
3. ใส่เมล + password
4. ยืนยัน email
5. Login
6. ✅ ใช้ได้เลย!
```

#### 6.2 ให้ Access ต่างๆ (Admin)
```
ถ้าต้องการ set role (owner/manager/editor/viewer):
1. Supabase → project_members table
2. Insert:
   - project_id: ID ของ project (ดูที่ projects table)
   - user_id: ID ของ user (ดูที่ auth.users table)
   - role: "manager" หรือ "editor" หรือ "viewer"
3. Save

Roles:
- owner: create/delete project, manage members
- manager: upload, delete, manage
- editor: upload, view
- viewer: view only
```

---

## 🔧 **Troubleshooting**

### ❌ "Cannot find Supabase credentials"
```
✅ Fix: ตรวจสอบ .env.local มี VITE_ prefix ไหม
```

### ❌ "Upload fails"
```
✅ Fix: ตรวจสอบ Storage bucket ชื่อ "documents" มีไหม
```

### ❌ "Auth not working"
```
✅ Fix: 
1. Supabase → Authentication → Confirm email required
2. Check: inbox สำหรับ verification email
```

### ❌ "Vercel shows blank page"
```
✅ Fix:
1. Check Environment Variables ตั้งถูกไหม
2. Redeploy: Vercel → Deployments → ... → Redeploy
```

---

## 📞 **Quick Reference**

| Item | Value |
|------|-------|
| **Admin Email** | Nitid_S@teamcm.co.th |
| **GitHub** | nitidkorit-hub/tcm-documents |
| **Live URL** | tcm-document-agent.vercel.app |
| **Supabase Project** | TCM-Documents |
| **Database** | PostgreSQL (Supabase) |
| **Region** | Singapore |

---

## ✅ **Final Checklist**

- [ ] Supabase project created
- [ ] SQL schema running
- [ ] Storage bucket created
- [ ] GitHub repo pushed
- [ ] .env.local configured
- [ ] npm install done
- [ ] Local test OK
- [ ] Vercel deployed
- [ ] Live test OK
- [ ] Team invited
- [ ] Ready to use! 🚀

---

## 📚 **Next Steps**

1. **Team onboarding**: ให้ทีมเข้า sign up
2. **Create sample projects**: ใน app
3. **Upload documents**: test upload flow
4. **Customize**: เพิ่ม logo, colors ตามต้องการ
5. **Monitor**: ดูการใช้งานใน Supabase dashboard

---

**Questions?** Check Supabase docs: https://supabase.com/docs

Good luck! 🎉

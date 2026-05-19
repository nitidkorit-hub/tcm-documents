# ✅ TCM Document Agent - Deployment Checklist

**Admin:** Nitid_S@teamcm.co.th  
**Date:** [Fill in today]  
**Status:** Ready to deploy

---

## 📋 Pre-Deployment Checklist

- [ ] Reviewed SETUP_GUIDE.md
- [ ] Have GitHub username ready: `nitidkorit-hub`
- [ ] Have email ready: `Nitid_S@teamcm.co.th`
- [ ] Have password ready (save in password manager)

---

## 🔧 Step-by-Step Deployment

### Phase 1: Supabase (15 min)

- [ ] **Sign up**: https://supabase.com
  - Email: `Nitid_S@teamcm.co.th`
  - Save password

- [ ] **Create project**:
  - Name: `TCM-Documents`
  - Region: `Singapore`
  - Password: __________ (save this)

- [ ] **Run SQL Schema**:
  - Go to: SQL Editor
  - Paste: `SQL_SCHEMA.sql` content
  - Click Run
  - Check: No errors

- [ ] **Setup Authentication**:
  - Go to: Authentication → Providers
  - Email: ✅ (already enabled)
  - Google: ✅ (optional)

- [ ] **Create Storage Bucket**:
  - Go to: Storage → Buckets
  - Name: `documents`
  - Make public: ✅
  - Create

- [ ] **Copy API Keys**:
  - Go to: Settings → API
  - Copy: Project URL
  - Copy: Anon public key
  - Paste into .env file (next step)

**✅ Supabase Ready!**

---

### Phase 2: Environment Setup (5 min)

- [ ] **Create .env.local**:
  ```
  File: D:\AI Project\AI Agent Document\.env.local
  Content:
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  ```

- [ ] **Test locally**:
  ```bash
  cd "D:\AI Project\AI Agent Document"
  npm install
  npm run dev
  
  # Should show: ✓ Local: http://localhost:5173/
  # Test sign up
  # Ctrl+C to stop
  ```

**✅ Local Testing Done!**

---

### Phase 3: GitHub Setup (5 min)

- [ ] **Create GitHub repo**:
  - Go to: https://github.com/new
  - Name: `tcm-documents`
  - Visibility: Private or Public
  - Add .gitignore: Node.js
  - Create

- [ ] **Push code**:
  ```bash
  cd "D:\AI Project\AI Agent Document"
  
  git init
  git remote add origin https://github.com/nitidkorit-hub/tcm-documents.git
  git add .
  git commit -m "Initial: TCM Document Agent setup"
  git branch -M main
  git push -u origin main
  ```

- [ ] **Verify**: Check GitHub repo has files

**✅ GitHub Ready!**

---

### Phase 4: Vercel Deployment (10 min)

- [ ] **Sign up Vercel**:
  - Go to: https://vercel.com
  - Email: `Nitid_S@teamcm.co.th`
  - Connect GitHub

- [ ] **Import Project**:
  - Click: "Import Project"
  - Select: tcm-documents
  - Click: "Import"

- [ ] **Add Environment Variables**:
  ```
  VITE_SUPABASE_URL = https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY = eyJhbGc...
  ```

- [ ] **Deploy**:
  - Click: "Deploy"
  - Wait: ~3-5 min (watch status)
  - Done: Green checkmark ✅

- [ ] **Get Live URL**:
  - Copy: `tcm-document-agent.vercel.app`

**✅ Vercel Deployed!**

---

## 🧪 Post-Deployment Testing

- [ ] **Test Live URL**: https://tcm-document-agent.vercel.app

- [ ] **Sign Up Test**:
  - Click: "Sign up"
  - Email: `test1@example.com`
  - Password: `Test123!`
  - Verify email
  - Result: ✅ Can login

- [ ] **Dashboard Test**:
  - [ ] See stat cards (0 projects, 0 files)
  - [ ] See empty project list
  - [ ] See empty activity

- [ ] **Create Project Test**:
  - [ ] Click: "Projects" tab
  - [ ] Click: "New Project"
  - [ ] Name: "Test Project"
  - [ ] Code: "TEST"
  - [ ] Result: Project appears

- [ ] **Upload File Test**:
  - [ ] Click: "Upload"
  - [ ] Select any file
  - [ ] Type: EIA
  - [ ] Click: "Confirm"
  - [ ] Result: File appears in dashboard

- [ ] **Logout/Login Test**:
  - [ ] Logout
  - [ ] Login with same email
  - [ ] Result: Data persists

**✅ All Tests Pass!**

---

## 👥 Team Onboarding

- [ ] **Invite Team (5 min each)**:
  - Share URL: `https://tcm-document-agent.vercel.app`
  - Each team member:
    - [ ] Sign up
    - [ ] Verify email
    - [ ] Login
    - [ ] Can see projects
    - [ ] Can upload files

- [ ] **Set Permissions** (if needed):
  - Go to: Supabase → project_members table
  - Add team members with role:
    - `owner` = full control
    - `manager` = upload/delete
    - `editor` = upload/view
    - `viewer` = view only

**✅ Team Ready!**

---

## 📊 Verification Summary

| Item | Status | Notes |
|------|--------|-------|
| Supabase | ✅ | Database ready |
| GitHub | ✅ | Code pushed |
| Vercel | ✅ | Live deployment |
| Email Auth | ✅ | Sign up works |
| File Upload | ✅ | Storage ready |
| Team Access | ✅ | Members can use |

---

## 🔐 Important Notes

- **Save these somewhere safe:**
  - [ ] Supabase password
  - [ ] GitHub password
  - [ ] Vercel account email
  - [ ] Supabase API keys (in .env.local)

- **Don't share:**
  - [ ] VITE_SUPABASE_ANON_KEY (in .env files)
  - [ ] Passwords

- **Backup:**
  - [ ] Daily database backup (Supabase auto does this)
  - [ ] GitHub repo is backed up (private repo)

---

## 📞 Support Links

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Help**: https://docs.github.com

---

## ✅ Sign Off

- [ ] All steps completed
- [ ] All tests passed
- [ ] Team can access
- [ ] Ready for production use

**Deployment Date**: _______________  
**Deployed By**: Nitid_S@teamcm.co.th  
**Status**: 🟢 LIVE

---

**Congratulations! 🎉 TCM Document Agent is now live!**

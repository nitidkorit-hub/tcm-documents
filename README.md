# 📋 TCM Document Agent

Team document management system for construction projects. Built with React + Supabase.

![Status](https://img.shields.io/badge/status-ready%20to%20deploy-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## 🎯 Features

✅ **Document Management**
- Upload/download documents by project
- Version control (Rev1, Rev2, etc.)
- 8 document types: EIA, แบบ, สัญญา, MOM, BOQ, etc.

✅ **Team Collaboration**
- Multi-user access with role-based permissions
- Project-specific access control
- Activity timeline showing who did what

✅ **Smart Search**
- Search by project, document type, filename
- Filter by latest version only
- Real-time filtering

✅ **File Management**
- Drag-drop upload
- Automatic categorization
- Zip download entire projects
- Storage: Supabase (1GB free)

✅ **Dashboard**
- Project stats and timeline
- Recent activities
- Quick access to all documents

---

## 🚀 Quick Start

### For Admin (Deployment)

**Prerequisites:**
- GitHub account: `nitidkorit-hub`
- Email: `Nitid_S@teamcm.co.th`
- 45 minutes

**Steps:**
1. Follow: `SETUP_GUIDE.md`
2. Check: `DEPLOYMENT_CHECKLIST.md`
3. Deploy to: Vercel + Supabase

### For Team (Usage)

1. Go to: https://tcm-document-agent.vercel.app
2. Sign up with work email
3. Verify email
4. Start uploading documents!

---

## 📂 Project Structure

```
tcm-documents/
├── src/
│   ├── api/
│   │   └── supabase.js          (Database API)
│   ├── components/
│   │   ├── Auth.jsx             (Sign up/login)
│   │   ├── Dashboard.jsx        (Main app)
│   │   └── ...
│   └── App.jsx                  (Root component)
├── .env.example                 (Copy to .env.local)
├── SETUP_GUIDE.md               (Deployment steps)
├── DEPLOYMENT_CHECKLIST.md      (Verification)
├── SQL_SCHEMA.sql               (Database schema)
├── package.json                 (Dependencies)
├── vite.config.js              (Build config)
└── vercel.json                 (Deployment config)
```

---

## 🗄️ Database

**Supabase PostgreSQL:**
- `projects` - Team projects
- `files` - Documents with versions
- `activity` - Timeline/history
- `project_members` - Access control

**Storage:** Supabase Storage (1GB free, documents bucket)

---

## 🔐 Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | React 18 + Vite | Fast, modern |
| **Backend** | Supabase (PostgreSQL) | Managed, scalable |
| **Auth** | Supabase Auth | Email + SSO support |
| **Storage** | Supabase Storage | Integrated with DB |
| **Hosting** | Vercel | Fast, auto-deploy from GitHub |
| **VCS** | GitHub | Team collaboration |

---

## 📊 Deployment Status

```
┌─────────────────────────────────┐
│  Supabase (PostgreSQL)          │  ✅ Ready
│  Database + Storage             │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  React App (Vite)               │  ✅ Ready
│  Deployed on Vercel             │
└─────────────────────────────────┘
```

---

## 👥 Team Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Owner** | Full access | Project lead/admin |
| **Manager** | Upload/delete | Document officer |
| **Editor** | Upload/view | Engineer |
| **Viewer** | View only | Stakeholder |

---

## 📋 Admin Checklist

- [ ] Supabase project created
- [ ] SQL schema running
- [ ] Storage bucket created
- [ ] GitHub repo initialized
- [ ] Vercel deployed
- [ ] Team members invited
- [ ] Tested sign up/login
- [ ] Tested file upload/download

---

## 🆘 Troubleshooting

**Q: Auth not working?**  
A: Check Supabase email verification settings

**Q: File upload fails?**  
A: Verify storage bucket "documents" is public

**Q: App shows blank?**  
A: Check environment variables in Vercel

**Q: Can't access database?**  
A: Check row-level security (RLS) policies

---

## 📖 Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Full deployment steps
- **Checklist**: `DEPLOYMENT_CHECKLIST.md` - Verification checklist
- **Database**: `SQL_SCHEMA.sql` - Schema definition
- **API**: `src/api/supabase.js` - API functions

---

## 💰 Cost (Team of 5-10)

| Service | Free Tier | Cost/Month |
|---------|-----------|-----------|
| Supabase | 500MB DB, 1GB storage | $0 |
| Vercel | Unlimited | $0 |
| GitHub | Unlimited private | $0 |
| **Total** | | **$0/month** ✅ |

When scaling:
- Database > 500MB → $25/month
- Storage > 1GB → $0.024/GB

---

## 🎓 For Developers

### Local Development
```bash
npm install
npm run dev
# Opens http://localhost:5173
```

### Build for Production
```bash
npm run build
# Creates dist/ folder
```

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📞 Support

- **Admin**: Nitid_S@teamcm.co.th
- **GitHub Issues**: nitidkorit-hub/tcm-documents/issues
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 📄 License

Internal TCM Company Project - 2025

---

**Built with ❤️ for TCM Team**

Last updated: 2025

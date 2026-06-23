-- TCM Document Agent - Database Schema
-- Copy and paste this entire SQL into Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  client TEXT,
  color TEXT DEFAULT '#1F3A5F',
  status TEXT DEFAULT 'กำลังดำเนินการ',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- per-project AI MOM Writer template (added for multi-form support)
  mom_topics JSONB DEFAULT '["รับรองรายงานการประชุม","เรื่องแจ้งเพื่อทราบ","เรื่องติดตาม","เรื่องนำเสนอและเพิ่มเติมอื่นๆ","ประชุมครั้งถัดไป"]'::jsonb,
  mom_logo TEXT,
  mom_font TEXT DEFAULT 'Angsana New'
);

-- ============================================================
-- 2. FILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  base_name TEXT,
  rev TEXT,
  size INT,
  ext TEXT,
  is_latest BOOLEAN DEFAULT TRUE,
  storage_path TEXT,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploader_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 3. ACTIVITY TABLE (Timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  action TEXT,
  details TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 4. PROJECT MEMBERS (Permissions)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ============================================================
-- INDEXES (Performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_is_latest ON files(is_latest);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_activity_project_id ON activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Projects: Authenticated users can see all projects
CREATE POLICY "Users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Project creator can insert"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Files: Users can see files from projects they're members of
CREATE POLICY "Users can view project files"
  ON files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = files.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Activity: Users can view activity from projects they're members of
CREATE POLICY "Users can view project activity"
  ON activity FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = activity.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Project Members: Users can view their own memberships
CREATE POLICY "Users can view their memberships"
  ON project_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Note: Create this in Supabase dashboard:
-- Storage → Create new bucket → Name: "documents" → Make it public

-- ============================================================
-- INITIAL DATA (Sample Projects)
-- ============================================================
-- Uncomment after running above, replace YOUR_USER_ID with admin user ID

-- INSERT INTO projects (name, code, client, color, status, created_by) VALUES
--   ('รถไฟฟ้าสายสีม่วงใต้ ช่วงเตาปูน–ราษฎร์บูรณะ', 'MRT-PP', 'การรถไฟฟ้าขนส่งมวลชนแห่งประเทศไทย', '#1F3A5F', 'กำลังดำเนินการ', 'YOUR_USER_ID'),
--   ('อาคารสำนักงานใหญ่ ABC ทาวเวอร์', 'ABC-HQ', 'บริษัท เอบีซี โฮลดิ้ง จำกัด (มหาชน)', '#3A6EA5', 'กำลังดำเนินการ', 'YOUR_USER_ID'),
--   ('ทางหลวงพิเศษหมายเลข 7 ส่วนต่อขยาย', 'M7-EXT', 'กรมทางหลวง', '#2DBE60', 'อนุมัติแบบ', 'YOUR_USER_ID'),
--   ('อ่างเก็บน้ำห้วยโสมง อันเนื่องมาจากพระราชดำริ', 'HSM-RES', 'กรมชลประทาน', '#6E56CF', 'ปิดโครงการ', 'YOUR_USER_ID');

-- ============================================================
-- END OF SCHEMA
-- ============================================================

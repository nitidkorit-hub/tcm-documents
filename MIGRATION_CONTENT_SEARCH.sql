-- ============================================================
-- MIGRATION: เพิ่ม Content Search ให้ TCM Document Agent
-- รันใน Supabase SQL Editor (one-time)
-- ============================================================

-- 1. เพิ่มคอลัมน์เก็บเนื้อหาที่สกัดจากเอกสาร
ALTER TABLE files
ADD COLUMN IF NOT EXISTS content_text TEXT;

-- 2. สร้าง Index แบบ Full-Text สำหรับค้นเนื้อหา (เร็วขึ้น)
CREATE INDEX IF NOT EXISTS files_content_text_gin
ON files
USING gin (to_tsvector('simple', coalesce(content_text, '')));

-- 3. ตรวจสอบว่าสำเร็จ
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'files'
  AND column_name = 'content_text';

-- ============================================================
-- เสร็จแล้ว! รีเฟรชหน้าเว็บ TCM Document Agent
-- ระบบจะเริ่มสกัดข้อความเอกสารใหม่ทันที (ตอน Upload)
--
-- สำหรับไฟล์เก่าที่อัพโหลดไปแล้ว:
-- → เปิด project drawer แล้วคลิก "Re-index เนื้อหา"
-- หรือ Upload ไฟล์ใหม่อีกครั้ง
-- ============================================================

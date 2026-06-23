import { TEAM_OM_LOGO } from '../assets/teamLogo.js'

export const DEFAULT_MOM_TOPICS = [
  'รับรองรายงานการประชุม',
  'เรื่องแจ้งเพื่อทราบ',
  'เรื่องติดตาม',
  'เรื่องนำเสนอและเพิ่มเติมอื่นๆ',
  'ประชุมครั้งถัดไป',
]

export const DEFAULT_MOM_LOGO = TEAM_OM_LOGO

export const MOM_FONT_OPTIONS = [
  { value: 'Angsana New', label: 'Angsana New · ตัวเหลี่ยมทางการ (ค่าเริ่มต้น)', stack: "'Angsana New','AngsanaUPC','Norasi','Times New Roman',serif" },
  { value: 'Sarabun', label: 'Sarabun · สมัยใหม่ อ่านง่าย', stack: "'Sarabun','TH Sarabun New',sans-serif" },
  { value: 'TH SarabunPSK', label: 'TH SarabunPSK · มาตรฐานราชการ', stack: "'TH SarabunPSK','Sarabun',sans-serif" },
  { value: 'Cordia New', label: 'Cordia New', stack: "'Cordia New','CordiaUPC',sans-serif" },
  { value: 'Times New Roman', label: 'Times New Roman · อังกฤษล้วน', stack: "'Times New Roman',serif" },
]

export const getMomFontStack = (value) => MOM_FONT_OPTIONS.find((f) => f.value === value)?.stack || MOM_FONT_OPTIONS[0].stack

// project.mom_logo: null/undefined = never configured -> show default logo
//                   ''              = explicitly removed -> no logo
//                   string          = custom base64 logo
export const getProjectLogo = (proj) => {
  if (proj?.mom_logo === '') return null
  return proj?.mom_logo || DEFAULT_MOM_LOGO
}

export const getProjectTopics = (proj) =>
  Array.isArray(proj?.mom_topics) && proj.mom_topics.length ? proj.mom_topics : DEFAULT_MOM_TOPICS

export const getProjectFontStack = (proj) => getMomFontStack(proj?.mom_font)

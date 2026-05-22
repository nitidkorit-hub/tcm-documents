/* ===========================================================
   TCM ConstructAI QTO Agent — DATA & CONSTANTS
   =========================================================== */

/* ---------- DISCIPLINES ---------- */
const DISC = {
  architectural: { l:'สถาปัตยกรรม',      i:'🏛️', c:'#3A6EA5', s:'Arch'   },
  structural:    { l:'โครงสร้าง',         i:'🏗️', c:'#2DBE60', s:'Struct' },
  mechanical:    { l:'งานระบบ M (HVAC)',  i:'⚙️', c:'#0694A2', s:'Mech'   },
  electrical:    { l:'งานระบบ E',         i:'⚡', c:'#7C3AED', s:'Elec'   },
  plumbing:      { l:'งานระบบ P',         i:'🔧', c:'#06B6D4', s:'Plumb'  },
  fire:          { l:'Fire Protection',   i:'🔥', c:'#E53E3E', s:'Fire'   },
  civil:         { l:'ภูมิสถาปัตย์',     i:'🌿', c:'#68D391', s:'Landscape' },
  interior:      { l:'ตกแต่งภายใน',       i:'🪑', c:'#ED64A6', s:'Int'    },
};

const DISC_ORDER = ['architectural','structural','mechanical','electrical','plumbing','fire','civil','interior'];

/* ---------- DISCIPLINE NORMALIZATION (for AI responses) ---------- */
const discNorm = {
  'architectural':'architectural','architecture':'architectural','สถาปัตยกรรม':'architectural','arch':'architectural','a':'architectural',
  'structural':'structural','structure':'structural','โครงสร้าง':'structural','struct':'structural','s':'structural',
  'mechanical':'mechanical','hvac':'mechanical','งานระบบ m':'mechanical','mech':'mechanical','m':'mechanical',
  'electrical':'electrical','electric':'electrical','งานระบบ e':'electrical','elec':'electrical','e':'electrical',
  'plumbing':'plumbing','sanitary':'plumbing','งานระบบ p':'plumbing','plumb':'plumbing','p':'plumbing',
  'fire':'fire','fire protection':'fire','f':'fire',
  'civil':'civil','landscape':'civil','โยธา':'civil','c':'civil',
  'interior':'interior','ตกแต่ง':'interior','int':'interior','i':'interior',
};

function normDisc(d) {
  if (!d) return 'architectural';
  const k = String(d).trim().toLowerCase();
  return discNorm[k] || (DISC[k] ? k : 'architectural');
}

/* ---------- LEGAL RULES ---------- */
const LEGAL = [
  { t:'แนวร่นอาคาร', d:'พ.ร.บ.ควบคุมอาคาร มาตรา 8 — ระยะร่นจากที่ดินข้างเคียง', s:'ok' },
  { t:'FAR (Floor Area Ratio)', d:'ตามผังเมืองรวม กทม. — FAR สูงสุดที่อนุญาตในย่านพาณิชย์', s:'ok' },
  { t:'ความสูงอาคาร', d:'> 23m ต้องขออนุญาตพิเศษ ตามกฎกระทรวง ฉบับที่ 33', s:'warn' },
  { t:'จำนวนที่จอดรถ', d:'ขั้นต่ำตามกฎกระทรวง ฉบับที่ 7 (1 คัน ต่อพื้นที่ใช้สอย 60 ตร.ม.)', s:'ok' },
  { t:'ระยะทางหนีไฟ', d:'≤ 60 เมตร ตามกฎกระทรวง ฉบับที่ 47', s:'ok' },
  { t:'บันไดหนีไฟ', d:'ความกว้างขั้นต่ำ 1.20 ม. ตามกฎกระทรวง ฉบับที่ 47 มาตรา 8', s:'warn' },
  { t:'ช่องเปิดผนังรับน้ำหนัก', d:'ต้องเสริมคานทับหลัง — มาตรฐาน วสท.', s:'ok' },
  { t:'ระบบไฟฉุกเฉิน', d:'บังคับสำหรับอาคารสูงและอาคารสาธารณะ — กฎกระทรวง ฉบับที่ 39', s:'ok' },
];

/* ---------- MOCK BOQ — TCM Office Building (5-storey, 2,400 sq.m.) ---------- */
const MOCK_BOQ = {
  projectName: 'อาคารสำนักงาน TCM 5 ชั้น (Office Building)',
  totalArea: 2400,
  scale: '1:100',
  date: '2025-11-15',
  client: 'บริษัท ทีซีเอ็ม คอร์ปอเรชั่น จำกัด',
  location: 'ถนนวิภาวดีรังสิต กรุงเทพมหานคร',
  categories: [
    { discipline:'architectural', items: [
      /* ===== 1. งานฝ้าเพดาน (Ceiling) ===== */
      { group:'ceiling', code:'AC-1', description:'ฝ้ายิปซั่มบอร์ด 9มม. ฉาบเรียบทาสีน้ำพลาสติก โครงเหล็กชุบสังกะสี (C1)', unit:'ตร.ม.', qty:1850, unitPrice:520,  total:962000,  note:'ทุกชั้น' },
      { group:'ceiling', code:'AC-2', description:'ฝ้ายิปซั่มบอร์ด 9มม. ชนิดกันชื้น โครงเหล็กชุบสังกะสี (C2)',           unit:'ตร.ม.', qty:340,  unitPrice:680,  total:231200,  note:'ห้องน้ำ' },
      { group:'ceiling', code:'AC-3', description:'ฝ้าตะแกรง Aluminium Cell Ceiling ช่อง 5×5 ซม. (C3)',                  unit:'ตร.ม.', qty:120,  unitPrice:1450, total:174000,  note:'โถง Lobby' },

      /* ===== 2. งานผนัง (Wall) ===== */
      { group:'wall', code:'AP-1',  description:'ผนังก่ออิฐมอญครึ่งแผ่น ฉาบเรียบทาสีน้ำอะคริลิค 100% (P1)',           unit:'ตร.ม.', qty:2840, unitPrice:680,  total:1931200, note:'ภายใน เผื่ออิฐ 3%' },
      { group:'wall', code:'AP-2A', description:'ผนังก่ออิฐมอญเต็มแผ่น กรุกระเบื้องโฮโมจีเนียส 60×60 (P2A)',           unit:'ตร.ม.', qty:520,  unitPrice:1280, total:665600,  note:'ห้องน้ำ' },
      { group:'wall', code:'AP-4',  description:'ผนัง คสล. ฉาบเรียบทาสีน้ำอะคริลิค 100% (P4)',                         unit:'ตร.ม.', qty:680,  unitPrice:560,  total:380800,  note:'ปล่องลิฟต์/บันได' },
      { group:'wall', code:'AP-6',  description:'ผนังกรุหินแกรนิตธรรมชาติ (P6)',                                       unit:'ตร.ม.', qty:95,   unitPrice:3200, total:304000,  note:'โถง Lobby' },

      /* ===== 3. งานพื้น (Floor) ===== */
      { group:'floor', code:'AF-1', description:'พื้นกระเบื้องพอร์ซเลน 60×60 (F1)',                       unit:'ตร.ม.', qty:1620, unitPrice:880,  total:1425600, note:'พื้นที่สำนักงาน เผื่อ 5%' },
      { group:'floor', code:'AF-2', description:'พื้นปรับระดับ+กันซึม+กระเบื้องโฮโมจีเนียส 60×60 (F2)',  unit:'ตร.ม.', qty:240,  unitPrice:1180, total:283200,  note:'ห้องน้ำ' },
      { group:'floor', code:'AF-3', description:'พื้นปูหินแกรนิตธรรมชาติ (F3)',                          unit:'ตร.ม.', qty:180,  unitPrice:2450, total:441000,  note:'โถงทางเข้า' },
      { group:'floor', code:'AF-9', description:'พื้นกระเบื้องแกรนิตโต 80×80 ซม. ผิวด้าน (F9)',          unit:'ตร.ม.', qty:380,  unitPrice:1320, total:501600,  note:'โถงลิฟต์' },
      { group:'floor', code:'AF-B', description:'บัวพื้นสำเร็จรูป PVC สูง 10 ซม.',                       unit:'ม.',    qty:920,  unitPrice:95,   total:87400,   note:'รอบห้อง' },

      /* ===== 4. งานประตู-หน้าต่าง (Doors & Windows) ===== */
      { group:'door-window', code:'AD-1', description:'ประตูหนีไฟ ขนาด 1000×2050 มม. พร้อมบาร์ผลัก',                   unit:'ชุด', qty:10, unitPrice:18500, total:185000, note:'5 ชั้น × 2' },
      { group:'door-window', code:'AD-2', description:'ประตูบานเปิดเดี่ยว WPC 900×2050 มม. พร้อมวงกบ',                 unit:'ชุด', qty:42, unitPrice:6800,  total:285600, note:'ห้องต่างๆ' },
      { group:'door-window', code:'AD-3', description:'ประตูบานเปิดคู่อลูมิเนียม กระจกเทมเปอร์ 1800×2400 มม.',         unit:'ชุด', qty:5,  unitPrice:42000, total:210000, note:'ทางเข้าหลัก' },
      { group:'door-window', code:'AW-1', description:'หน้าต่างบานเลื่อนอลูมิเนียม กระจก 6มม. (ขนาดตามแบบ)',           unit:'ชุด', qty:68, unitPrice:8500,  total:578000, note:'รอบอาคาร' },

      /* ===== 5. งานหลังคา (Roof) ===== */
      { group:'roof', code:'AR-1', description:'หลังคาแผ่นเหล็กรีดลอน 0.40 มม. บุฉนวน PU 40K หนา 1 นิ้ว',  unit:'ตร.ม.', qty:580,  unitPrice:1250, total:725000, note:'' },
      { group:'roof', code:'AR-2', description:'ครอบสันหลังคาเหล็กรีดลอน',                                  unit:'ม.',    qty:48,   unitPrice:380,  total:18240,  note:'' },
      { group:'roof', code:'AR-3', description:'ครอบข้างหลังคาเหล็กรีดลอน',                                 unit:'ม.',    qty:60,   unitPrice:320,  total:19200,  note:'' },
      { group:'roof', code:'AR-4', description:'เชิงชาย+ทับเชิงชายไม้สำเร็จรูป 6"',                          unit:'ม.',    qty:96,   unitPrice:280,  total:26880,  note:'' },
      { group:'roof', code:'AR-5', description:'สกรูยึดแผ่นหลังคา (Self-drilling)',                          unit:'ตัว',   qty:2400, unitPrice:8,    total:19200,  note:'' },

      /* ===== 6. งานเบ็ดเตล็ดและภายนอก (Misc) ===== */
      { group:'misc', code:'AM-1', description:'จมูกบันไดอลูมิเนียม',                              unit:'ม.',  qty:280, unitPrice:280,   total:78400,  note:'' },
      { group:'misc', code:'AM-2', description:'ราวบันไดสแตนเลส Ø2" + ลูกกรง',                     unit:'ม.',  qty:240, unitPrice:1850,  total:444000, note:'' },
      { group:'misc', code:'AM-3', description:'ตัวอักษรสแตนเลสติดผนัง "TCM" + ตราสัญลักษณ์',     unit:'ชุด', qty:1,   unitPrice:85000, total:85000,  note:'หน้าอาคาร' },
      { group:'misc', code:'AM-4', description:'ฝาท่อระบายน้ำสแตนเลส (FD) รอบอาคาร',              unit:'ชุด', qty:36,  unitPrice:580,   total:20880,  note:'' },

      /* ===== 7. % เพิ่มเติม ตามเกณฑ์กรมบัญชีกลาง ===== */
      /* วัสดุรวม = 962000+231200+174000 + 1931200+665600+380800+304000 + 1425600+283200+441000+501600+87400 + 185000+285600+210000+578000 + 725000+18240+19200+26880+19200 + 78400+444000+85000+20880 = 10,083,000 */
      { group:'markups', code:'AM-LB', description:'ค่าแรงงานติดตั้ง+ทาสี+เก็บงาน (30% ของค่าวัสดุ)', unit:'งวด', qty:1, unitPrice:3024900, total:3024900, note:'กรมบัญชีกลาง 2560' },
    ]},
    { discipline:'structural', items: [
      /* ========== หมวด 1: งานฐานราก (Foundation) — ติดดิน ต้องมี Lean Concrete ========== */
      { group:'foundation', code:'F-LC', description:'คอนกรีตหยาบ (Lean Concrete) fc=140 ksc หนา 5 ซม. รองฐานราก', unit:'ลบ.ม.', qty:14.5, unitPrice:2400, total:34800,   note:'รองพื้นใต้ฐานราก' },
      { group:'foundation', code:'F-CC', description:'คอนกรีตฐานราก fc=280 ksc',                                   unit:'ลบ.ม.', qty:144,  unitPrice:3250, total:468000,  note:'60 ฐาน' },
      { group:'foundation', code:'F-FM', description:'แบบหล่อคอนกรีตฐานราก (ไม้อัด)',                              unit:'ตร.ม.', qty:288,  unitPrice:380,  total:109440,  note:'' },
      { group:'foundation', code:'F-R09',description:'เหล็กเสริม SR24-RB9 (ปลอก/ตะแกรง)',                          unit:'กก.',   qty:850,  unitPrice:28,   total:23800,   note:'' },
      { group:'foundation', code:'F-D20',description:'เหล็กเสริม SD40-DB20 (เหล็กเอก)',                             unit:'กก.',   qty:4500, unitPrice:29,   total:130500,  note:'' },
      { group:'foundation', code:'F-D25',description:'เหล็กเสริม SD40-DB25 (เหล็กเสริม)',                           unit:'กก.',   qty:2800, unitPrice:29.5, total:82600,   note:'' },
      { group:'foundation', code:'F-TW', description:'ลวดผูกเหล็ก #18',                                              unit:'กก.',   qty:80,   unitPrice:55,   total:4400,    note:'' },
      { group:'foundation', code:'F-NL', description:'ตะปู (รวมทุกขนาด)',                                            unit:'กก.',   qty:25,   unitPrice:48,   total:1200,    note:'' },

      /* ========== หมวด 2: งานเสา (Column) ========== */
      { group:'column', code:'C-CC',  description:'คอนกรีตเสา fc=320 ksc',                                          unit:'ลบ.ม.', qty:163,  unitPrice:3500, total:570500,  note:'40 ต้น × 5 ชั้น' },
      { group:'column', code:'C-FM',  description:'แบบหล่อคอนกรีตเสา (ไม้อัด+โครงเหล็ก)',                            unit:'ตร.ม.', qty:1360, unitPrice:420,  total:571200,  note:'' },
      { group:'column', code:'C-R09', description:'เหล็กเสริม SR24-RB9 (ปลอกเสา)',                                    unit:'กก.',   qty:1800, unitPrice:28,   total:50400,   note:'' },
      { group:'column', code:'C-D25', description:'เหล็กเสริม SD40-DB25 (เหล็กยืน)',                                   unit:'กก.',   qty:8200, unitPrice:29.5, total:241900,  note:'' },
      { group:'column', code:'C-D32', description:'เหล็กเสริม SD40-DB32 (เหล็กยืนเสาใหญ่)',                            unit:'กก.',   qty:4500, unitPrice:30,   total:135000,  note:'' },
      { group:'column', code:'C-TW',  description:'ลวดผูกเหล็ก #18',                                                  unit:'กก.',   qty:140,  unitPrice:55,   total:7700,    note:'' },
      { group:'column', code:'C-NL',  description:'ตะปู (รวมทุกขนาด)',                                                unit:'กก.',   qty:60,   unitPrice:48,   total:2880,    note:'' },

      /* ========== หมวด 3: งานคาน (Beam) ========== */
      { group:'beam', code:'B-CC',  description:'คอนกรีตคาน fc=280 ksc',                                            unit:'ลบ.ม.', qty:142,  unitPrice:3250, total:461500,  note:'5 ชั้น' },
      { group:'beam', code:'B-FM',  description:'แบบหล่อคอนกรีตคาน (ไม้อัด+ค้ำยัน)',                                  unit:'ตร.ม.', qty:1980, unitPrice:450,  total:891000,  note:'' },
      { group:'beam', code:'B-R09', description:'เหล็กเสริม SR24-RB9 (ปลอกคาน)',                                       unit:'กก.',   qty:2400, unitPrice:28,   total:67200,   note:'' },
      { group:'beam', code:'B-D12', description:'เหล็กเสริม SD40-DB12 (เหล็กรับแรงเฉือน)',                              unit:'กก.',   qty:3800, unitPrice:29,   total:110200,  note:'' },
      { group:'beam', code:'B-D20', description:'เหล็กเสริม SD40-DB20 (เหล็กเอกคาน)',                                   unit:'กก.',   qty:8500, unitPrice:29,   total:246500,  note:'' },
      { group:'beam', code:'B-TW',  description:'ลวดผูกเหล็ก #18',                                                    unit:'กก.',   qty:180,  unitPrice:55,   total:9900,    note:'' },
      { group:'beam', code:'B-NL',  description:'ตะปู (รวมทุกขนาด)',                                                  unit:'กก.',   qty:75,   unitPrice:48,   total:3600,    note:'' },

      /* ========== หมวด 4: งานพื้น (Slab) — พื้นชั้น 1 ติดดิน ต้องมี Lean Concrete ========== */
      { group:'slab', code:'S-LC', description:'คอนกรีตหยาบ (Lean Concrete) fc=140 ksc หนา 5 ซม. รองพื้นชั้น 1',     unit:'ลบ.ม.', qty:24,   unitPrice:2400, total:57600,   note:'เฉพาะชั้น 1 ติดดิน' },
      { group:'slab', code:'S-CC', description:'คอนกรีตพื้น fc=240 ksc หนา 12 ซม.',                                  unit:'ลบ.ม.', qty:288,  unitPrice:2950, total:849600,  note:'5 ชั้น × 480 ตร.ม.' },
      { group:'slab', code:'S-FM', description:'แบบหล่อคอนกรีตพื้น (ไม้อัด+ค้ำยัน) — เฉพาะชั้นบน',                    unit:'ตร.ม.', qty:1920, unitPrice:440,  total:844800,  note:'4 ชั้นบน' },
      { group:'slab', code:'S-R06',description:'เหล็กเสริม SR24-RB6 (เหล็กกระจายขั้นต่ำ)',                            unit:'กก.',   qty:1200, unitPrice:28,   total:33600,   note:'' },
      { group:'slab', code:'S-D10',description:'เหล็กเสริม SD40-DB10 (เหล็กล่าง)',                                    unit:'กก.',   qty:5800, unitPrice:28.5, total:165300,  note:'' },
      { group:'slab', code:'S-D12',description:'เหล็กเสริม SD40-DB12 (เหล็กบน)',                                      unit:'กก.',   qty:9800, unitPrice:29,   total:284200,  note:'' },
      { group:'slab', code:'S-TW', description:'ลวดผูกเหล็ก #18',                                                     unit:'กก.',   qty:240,  unitPrice:55,   total:13200,   note:'' },
      { group:'slab', code:'S-NL', description:'ตะปู (รวมทุกขนาด)',                                                   unit:'กก.',   qty:95,   unitPrice:48,   total:4560,    note:'' },

      /* ========== งานอื่นๆ (ไม่ซ้ำ group) ========== */
      { code:'S-PL', description:'เสาเข็มเจาะ คสล. Ø60 ซม. ลึก 22 ม.',                                              unit:'ต้น',   qty:60,   unitPrice:48500, total:2910000, note:'รวมทดสอบ' },
      { code:'S-WP', description:'งานกันซึมหลังคา + ดาดฟ้า ระบบ Polyurethane',                                      unit:'ตร.ม.', qty:520,  unitPrice:680,   total:353600,  note:'' },
    ]},
    { discipline:'mechanical', items: [
      /* ===== 1. เครื่องปรับอากาศ (AC Equipment) ===== */
      { group:'ac-equip', code:'MA-1', description:'เครื่องปรับอากาศ VRF Outdoor 10HP ระบบเย็น',  unit:'ชุด', qty:8,  unitPrice:285000, total:2280000, note:'รวมคอมเพรสเซอร์' },
      { group:'ac-equip', code:'MA-2', description:'FCU Cassette 4-Way 24,000 BTU (Indoor)',      unit:'ชุด', qty:48, unitPrice:38500,  total:1848000, note:'พื้นที่สำนักงาน' },

      /* ===== 2. ท่อลม + ฉนวน (Ductwork + Insulation) ===== */
      { group:'ductwork', code:'MD-1', description:'ท่อลม Galvanized Steel + ฉนวน Fiberglass หนา 1"', unit:'ตร.ม.', qty:1850, unitPrice:1280, total:2368000, note:'มาตรฐาน SMACNA' },
      { group:'ductwork', code:'MD-2', description:'Flexible Duct + ฉนวน',                            unit:'ม.',    qty:240,  unitPrice:380,  total:91200,   note:'ต่อหัวจ่าย' },

      /* ===== 3. หัวจ่ายลม + Damper (Diffusers + Dampers) ===== */
      { group:'diffuser', code:'MF-1', description:'หัวจ่ายลม 4-Way Square Ceiling Diffuser (4-SCD)',  unit:'ตัว', qty:96, unitPrice:2800, total:268800, note:'' },
      { group:'diffuser', code:'MF-2', description:'หัวจ่ายลมกลม Round Ceiling Diffuser (RD)',         unit:'ตัว', qty:24, unitPrice:1850, total:44400,  note:'' },
      { group:'diffuser', code:'MF-3', description:'Return Air Grille (RG)',                            unit:'ตัว', qty:60, unitPrice:1600, total:96000,  note:'' },
      { group:'diffuser', code:'MF-4', description:'Volume Damper (VD)',                                unit:'ตัว', qty:36, unitPrice:1200, total:43200,  note:'' },
      { group:'diffuser', code:'MF-5', description:'Fire Damper (FD) — ผ่าน Fire-rated Wall',          unit:'ตัว', qty:12, unitPrice:4500, total:54000,  note:'กฎกระทรวง 47' },

      /* ===== 4. ท่อน้ำยาทำความเย็น (Refrigerant Pipe) ===== */
      { group:'refrigerant', code:'MR-1', description:'ท่อทองแดงสารทำความเย็น Ø¼"-1⅛" พร้อมฉนวน', unit:'ม.', qty:780, unitPrice:850, total:663000, note:'รวมข้อต่อ' },

      /* ===== 5. พัดลมระบายอากาศ (Exhaust) ===== */
      { group:'exhaust', code:'MX-1', description:'พัดลมระบายอากาศห้องน้ำ Ceiling Mounted + ดักท์', unit:'ชุด', qty:24, unitPrice:8500,  total:204000, note:'' },
      { group:'exhaust', code:'MX-2', description:'พัดลม Centrifugal ห้องเครื่อง 2HP',             unit:'ชุด', qty:4,  unitPrice:12500, total:50000,  note:'' },

      /* ===== 6. % เพิ่มเติม ===== */
      /* วัสดุรวม = 2280000+1848000 + 2368000+91200 + 268800+44400+96000+43200+54000 + 663000 + 204000+50000 = 8,010,600 */
      { group:'markups', code:'MK-LB', description:'ค่าแรงงานติดตั้ง+เชื่อมท่อ (30% ของค่าวัสดุ)', unit:'งวด', qty:1, unitPrice:2403180, total:2403180, note:'กรมบัญชีกลาง' },
      { group:'markups', code:'MK-TB', description:'ค่า Testing & Balancing (T&B) (5% ของวัสดุ+แรง)', unit:'งวด', qty:1, unitPrice:520689,  total:520689,  note:'ASHRAE 111' },
    ]},
    { discipline:'electrical', items: [
      /* ===== 1. สายไฟ + ท่อร้อยสาย (Wiring + Conduit) ===== */
      { group:'wiring', code:'EW-25', description:'สายไฟ THW 2.5 sq.mm (วงจรไฟ-เต้ารับ)',          unit:'ม.', qty:4800, unitPrice:28,  total:134400, note:'เผื่อ 10%' },
      { group:'wiring', code:'EW-4',  description:'สายไฟ THW 4 sq.mm (วงจรปลั๊ก-ดวงไฟ)',           unit:'ม.', qty:1600, unitPrice:42,  total:67200,  note:'' },
      { group:'wiring', code:'EW-6',  description:'สายไฟ THW 6 sq.mm (วงจรเครื่องใช้ไฟฟ้าใหญ่)',  unit:'ม.', qty:800,  unitPrice:55,  total:44000,  note:'' },
      { group:'wiring', code:'EW-N',  description:'สายไฟ NYY 4×16 sq.mm (สายเมน)',                  unit:'ม.', qty:280,  unitPrice:580, total:162400, note:'' },
      { group:'wiring', code:'EC-P',  description:'ท่อร้อยสาย PVC Conduit Ø¾"',                     unit:'ม.', qty:3200, unitPrice:65,  total:208000, note:'ภายในผนัง/พื้น' },
      { group:'wiring', code:'EC-E',  description:'ท่อร้อยสาย EMT Conduit Ø1"',                     unit:'ม.', qty:1200, unitPrice:120, total:144000, note:'เดินลอย' },
      { group:'wiring', code:'EW-WY', description:'รางวายเวย์ (Wireway) + อุปกรณ์ยึด',              unit:'ม.', qty:220,  unitPrice:850, total:187000, note:'ห้องเครื่อง' },

      /* ===== 2. ดวงไฟ (Lighting) ===== */
      { group:'lighting', code:'EL-1', description:'โคมไฟ LED Panel 60×60 36W (Recessed)',           unit:'ดวง', qty:380, unitPrice:1850, total:703000, note:'พื้นที่สำนักงาน' },
      { group:'lighting', code:'EL-2', description:'โคมไฟ LED Downlight 9W ฝังฝ้า',                  unit:'ดวง', qty:240, unitPrice:680,  total:163200, note:'ทางเดิน' },
      { group:'lighting', code:'EL-3', description:'โคมไฟ LED Tube T8 18W + ราง',                    unit:'ดวง', qty:120, unitPrice:380,  total:45600,  note:'ห้องเครื่อง/ที่จอดรถ' },
      { group:'lighting', code:'EL-4', description:'โคมไฟ LED Floodlight 100W Outdoor IP65',         unit:'ดวง', qty:24,  unitPrice:2800, total:67200,  note:'รอบอาคาร' },

      /* ===== 3. เต้ารับ + สวิตช์ (Outlets & Switches) ===== */
      { group:'outlet-switch', code:'EO-1', description:'เต้ารับคู่ Duplex 16A 250V (Schneider/Panasonic)', unit:'ตัว', qty:280, unitPrice:380, total:106400, note:'' },
      { group:'outlet-switch', code:'EO-2', description:'เต้ารับเดี่ยว 16A 250V WP (พื้นที่ภายนอก)',     unit:'ตัว', qty:60,  unitPrice:480, total:28800,  note:'' },
      { group:'outlet-switch', code:'ES-1', description:'สวิตช์ 1 ทาง 16A',                              unit:'ตัว', qty:180, unitPrice:220, total:39600,  note:'' },
      { group:'outlet-switch', code:'ES-2', description:'สวิตช์ 2 ทาง 16A',                              unit:'ตัว', qty:80,  unitPrice:280, total:22400,  note:'' },

      /* ===== 4. ตู้ MDB + Breakers ===== */
      { group:'mdb', code:'EM-1', description:'ตู้ MDB Main Distribution Board 1600A',          unit:'ใบ', qty:1,  unitPrice:485000, total:485000, note:'' },
      { group:'mdb', code:'EM-2', description:'ตู้ DB ประจำชั้น 100A 24-way',                   unit:'ใบ', qty:10, unitPrice:42000,  total:420000, note:'2 ตู้/ชั้น' },
      { group:'mdb', code:'EM-3', description:'Circuit Breaker MCCB 100A 4P',                   unit:'ตัว', qty:24, unitPrice:4500,  total:108000, note:'' },
      { group:'mdb', code:'EM-4', description:'Circuit Breaker MCB 16A 1P',                     unit:'ตัว', qty:240,unitPrice:320,   total:76800,  note:'' },

      /* ===== 5. Fire Alarm System ===== */
      { group:'fire-alarm', code:'EF-1', description:'ตู้ Fire Alarm Control Panel (FCP) 20-zone', unit:'ตู้', qty:1,   unitPrice:185000, total:185000, note:'' },
      { group:'fire-alarm', code:'EF-2', description:'Smoke Detector (Photoelectric) พร้อม Base', unit:'จุด', qty:120, unitPrice:1250,   total:150000, note:'' },
      { group:'fire-alarm', code:'EF-3', description:'Heat Detector (Fixed Temp 135°F)',           unit:'จุด', qty:48,  unitPrice:880,    total:42240,  note:'ห้องครัว/ห้องเครื่อง' },
      { group:'fire-alarm', code:'EF-4', description:'Manual Pull Station + กล่อง',                unit:'จุด', qty:18,  unitPrice:1450,   total:26100,  note:'' },
      { group:'fire-alarm', code:'EF-5', description:'Alarm Bell 6" สีแดง',                        unit:'จุด', qty:18,  unitPrice:850,    total:15300,  note:'' },

      /* ===== 6. CCTV + Communication ===== */
      { group:'communication', code:'EC-1', description:'CCTV Camera Fixed IP66 4MP',           unit:'กล้อง', qty:32, unitPrice:4800,  total:153600, note:'' },
      { group:'communication', code:'EC-2', description:'NVR 16-channel + HDD 4TB',             unit:'เครื่อง', qty:2, unitPrice:28500, total:57000, note:'' },
      { group:'communication', code:'EC-3', description:'Data Outlet Cat6 RJ45 (Cabling+Tester)', unit:'จุด',  qty:240, unitPrice:580,  total:139200, note:'' },
      { group:'communication', code:'EC-4', description:'Telephone Outlet RJ11',                  unit:'จุด',  qty:60,  unitPrice:380,  total:22800,  note:'' },

      /* ===== 7. Lightning Protection System ===== */
      { group:'lightning', code:'EP-1', description:'หัวล่อฟ้า Early Streamer Emission (ESE)', unit:'ชุด', qty:1, unitPrice:28500, total:28500, note:'รัศมีป้องกัน 50 ม.' },
      { group:'lightning', code:'EP-2', description:'สายตัวนำลง Cu Bare 50 sq.mm',              unit:'ม.',  qty:60,unitPrice:480,   total:28800, note:'' },
      { group:'lightning', code:'EP-3', description:'หลักดิน Cu-Bonded 2.4 ม. + บ่อตรวจสอบ',    unit:'หลัก',qty:6, unitPrice:1850,  total:11100, note:'' },

      /* ===== 8. Generator + ATS ===== */
      { group:'generator', code:'EG-1', description:'เครื่องกำเนิดไฟฟ้าสำรอง 500 kVA Diesel + ห้องเครื่อง', unit:'ชุด', qty:1, unitPrice:1450000, total:1450000, note:'' },
      { group:'generator', code:'EG-2', description:'ATS (Auto Transfer Switch) 1600A',                      unit:'ชุด', qty:1, unitPrice:285000,  total:285000,  note:'' },
      { group:'generator', code:'EG-3', description:'ถังน้ำมัน Diesel 1,000L พร้อมระบบ',                     unit:'ชุด', qty:1, unitPrice:38500,   total:38500,   note:'' },

      /* ===== 9. % เพิ่มเติม ===== */
      /* วัสดุรวม = 947000 + 979000 + 197200 + 1089800 + 418640 + 372600 + 68400 + 1773500 = 5,846,140 */
      { group:'markups', code:'EK-LB', description:'ค่าแรงงานติดตั้ง+เดินสาย+เชื่อม (30% ของค่าวัสดุ)', unit:'งวด', qty:1, unitPrice:1753842, total:1753842, note:'กรมบัญชีกลาง' },
      { group:'markups', code:'EK-TS', description:'ค่าทดสอบระบบไฟฟ้า (5% ของวัสดุ+แรง)',              unit:'งวด', qty:1, unitPrice:379999,  total:379999,  note:'IEC + ว.ส.ท.' },
    ]},
    { discipline:'plumbing', items: [
      /* ===== หมวด 1: ท่อน้ำใช้ (Cold Water) — PVC ชั้นคุณภาพ 13.5 ===== */
      { group:'pipe-cw', code:'PW-12', description:'ท่อ PVC น้ำใช้ Ø½" ชั้นคุณภาพ 13.5 (เข้าสุขภัณฑ์)',         unit:'ม.', qty:288, unitPrice:52,  total:14976, note:'รวมเผื่อ' },
      { group:'pipe-cw', code:'PW-34', description:'ท่อ PVC น้ำใช้ Ø¾" ชั้นคุณภาพ 13.5 (ฟลัชวาล์ว/น้ำอุ่น)',   unit:'ม.', qty:80,  unitPrice:72,  total:5760,  note:'' },
      { group:'pipe-cw', code:'PW-10', description:'ท่อ PVC น้ำใช้ Ø1" ชั้นคุณภาพ 13.5 (เมนแยกแต่ละชั้น)',    unit:'ม.', qty:250, unitPrice:105, total:26250, note:'' },
      { group:'pipe-cw', code:'PW-15', description:'ท่อ PVC น้ำใช้ Ø1½" ชั้นคุณภาพ 13.5 (เมนหลัก)',          unit:'ม.', qty:142, unitPrice:185, total:26270, note:'รวมแนวดิ่ง' },

      /* ===== หมวด 2: ท่อน้ำทิ้ง (Waste) — PVC ชั้นคุณภาพ 8.5 ===== */
      { group:'pipe-w', code:'WW-20', description:'ท่อ PVC น้ำทิ้ง Ø2" ชั้นคุณภาพ 8.5 (จาก FD/อ่างล้างหน้า)', unit:'ม.', qty:200, unitPrice:115, total:23000, note:'' },
      { group:'pipe-w', code:'WW-30', description:'ท่อ PVC น้ำทิ้ง Ø3" ชั้นคุณภาพ 8.5 (เมนรวม)',              unit:'ม.', qty:142, unitPrice:215, total:30530, note:'' },

      /* ===== หมวด 3: ท่อโสโครก (Soil) — PVC ชั้นคุณภาพ 8.5 ===== */
      { group:'pipe-s', code:'SW-40', description:'ท่อ PVC โสโครก Ø4" ชั้นคุณภาพ 8.5 (จากโถส้วม)',            unit:'ม.', qty:122, unitPrice:320, total:39040, note:'' },

      /* ===== หมวด 4: ท่อระบายอากาศ (Vent) — PVC ชั้นคุณภาพ 8.5 ===== */
      { group:'pipe-v', code:'VW-20', description:'ท่อ PVC ระบายอากาศ Ø2" ชั้นคุณภาพ 8.5',                  unit:'ม.', qty:96,   unitPrice:115, total:11040, note:'รวมพ้นหลังคา 1.5 ม.' },
      { group:'pipe-v', code:'VW-30', description:'ท่อ PVC ระบายอากาศ Ø3" ชั้นคุณภาพ 8.5 (เมน)',            unit:'ม.', qty:23.5, unitPrice:215, total:5053,  note:'' },

      /* ===== หมวด 5: ท่อระบายน้ำฝน (Rain Water) — PVC ชั้นคุณภาพ 8.5 ===== */
      { group:'pipe-rw', code:'RW-40', description:'ท่อ PVC ระบายน้ำฝน Ø4" ชั้นคุณภาพ 8.5 (แนวดิ่ง)',          unit:'ม.', qty:88, unitPrice:320, total:28160, note:'รับจากดาดฟ้า' },

      /* ===== หมวด 6: อุปกรณ์ข้อต่อ (Fittings) — แยกชนิด/ขนาด/ชั้นคุณภาพ ===== */
      { group:'fittings', code:'FT-01', description:'ข้องอ 90° PVC Ø½" ชั้นคุณภาพ 13.5',                       unit:'อัน', qty:180, unitPrice:28,  total:5040,  note:'' },
      { group:'fittings', code:'FT-02', description:'ข้องอ 90° PVC Ø¾" ชั้นคุณภาพ 13.5',                       unit:'อัน', qty:32,  unitPrice:42,  total:1344,  note:'' },
      { group:'fittings', code:'FT-03', description:'ข้อต่อสามทาง PVC Ø½" ชั้นคุณภาพ 13.5',                    unit:'อัน', qty:48,  unitPrice:38,  total:1824,  note:'' },
      { group:'fittings', code:'FT-04', description:'ข้อต่อตรง PVC Ø1" ชั้นคุณภาพ 13.5',                       unit:'อัน', qty:24,  unitPrice:45,  total:1080,  note:'' },
      { group:'fittings', code:'FT-05', description:'เกลียวข้อต่อ PVC Ø½"',                                    unit:'อัน', qty:80,  unitPrice:32,  total:2560,  note:'' },
      { group:'fittings', code:'FT-06', description:'ข้องอ 90° PVC Ø2" ชั้นคุณภาพ 8.5',                        unit:'อัน', qty:24,  unitPrice:82,  total:1968,  note:'' },
      { group:'fittings', code:'FT-07', description:'ข้องอ 45° PVC Ø2" ชั้นคุณภาพ 8.5',                        unit:'อัน', qty:36,  unitPrice:78,  total:2808,  note:'' },
      { group:'fittings', code:'FT-08', description:'ข้อต่อสามทางตัววาย PVC Ø2" ชั้นคุณภาพ 8.5',               unit:'อัน', qty:24,  unitPrice:95,  total:2280,  note:'' },
      { group:'fittings', code:'FT-09', description:'ข้องอ 90° PVC Ø3" ชั้นคุณภาพ 8.5',                        unit:'อัน', qty:12,  unitPrice:145, total:1740,  note:'' },
      { group:'fittings', code:'FT-10', description:'ข้องอ 45° PVC Ø4" ชั้นคุณภาพ 8.5',                        unit:'อัน', qty:18,  unitPrice:220, total:3960,  note:'' },
      { group:'fittings', code:'FT-11', description:'ข้อต่ออ่อน PVC Ø4"',                                       unit:'อัน', qty:8,   unitPrice:280, total:2240,  note:'' },

      /* ===== หมวด 7: สุขภัณฑ์ (Fixtures) ===== */
      { group:'fixtures', code:'FX-WC', description:'โถสุขภัณฑ์ชักโครก ฟลัชวาล์ว พร้อมอุปกรณ์',                 unit:'ชุด', qty:20, unitPrice:12500, total:250000, note:'' },
      { group:'fixtures', code:'FX-UR', description:'โถปัสสาวะชาย พร้อมอุปกรณ์',                                unit:'ชุด', qty:12, unitPrice:5800,  total:69600,  note:'' },
      { group:'fixtures', code:'FX-LV', description:'อ่างล้างหน้าแขวนผนัง พร้อมอุปกรณ์',                        unit:'ชุด', qty:24, unitPrice:3800,  total:91200,  note:'' },
      { group:'fixtures', code:'FX-FC', description:'ก๊อกอ่างล้างหน้า',                                          unit:'ชุด', qty:24, unitPrice:1400,  total:33600,  note:'' },
      { group:'fixtures', code:'FX-SP', description:'สายฉีดชำระ',                                                 unit:'ชุด', qty:20, unitPrice:850,   total:17000,  note:'' },
      { group:'fixtures', code:'FX-SH', description:'ฝักบัวสายอ่อน + วาล์ว',                                     unit:'ชุด', qty:6,  unitPrice:2400,  total:14400,  note:'' },
      { group:'fixtures', code:'FX-PH', description:'ที่ใส่กระดาษชำระ',                                          unit:'ชุด', qty:24, unitPrice:380,   total:9120,   note:'' },
      { group:'fixtures', code:'FX-MR', description:'กระจกเงาห้องน้ำ 60×80 ซม.',                                unit:'ชุด', qty:24, unitPrice:850,   total:20400,  note:'' },
      { group:'fixtures', code:'FX-PT', description:'ผนังกั้นห้องน้ำสำเร็จรูป HPL + ประตู',                     unit:'ชุด', qty:24, unitPrice:18500, total:444000, note:'' },
      { group:'fixtures', code:'FX-FD', description:'ฝา Floor Drain (FD) สแตนเลส',                              unit:'ชุด', qty:24, unitPrice:580,   total:13920,  note:'' },
      { group:'fixtures', code:'FX-CO', description:'Floor Clean Out (FCO) สแตนเลส',                            unit:'ชุด', qty:12, unitPrice:720,   total:8640,   note:'' },

      /* ===== หมวด 8: อุปกรณ์ระบบ (System Equipment) ===== */
      { group:'system', code:'SY-GV', description:'ประตูน้ำทองเหลือง Ø1½"',                                     unit:'ชุด',  qty:4, unitPrice:1850,  total:7400,   note:'' },
      { group:'system', code:'SY-WM', description:'มาตรวัดน้ำประปา Ø1"',                                         unit:'ชุด',  qty:1, unitPrice:4500,  total:4500,   note:'' },
      { group:'system', code:'SY-HB', description:'ก๊อกสนาม + วาล์ว',                                            unit:'ชุด',  qty:4, unitPrice:1200,  total:4800,   note:'' },
      { group:'system', code:'SY-PU', description:'ปั๊มน้ำหอยโข่ง 5HP (หลัก+สำรอง)',                              unit:'ชุด',  qty:2, unitPrice:45000, total:90000,  note:'' },
      { group:'system', code:'SY-PT', description:'ถังแรงดัน 200 ลิตร',                                          unit:'ชุด',  qty:1, unitPrice:18500, total:18500,  note:'' },
      { group:'system', code:'SY-UG', description:'ถังเก็บน้ำใต้ดิน 5,000L PE',                                  unit:'ชุด',  qty:2, unitPrice:28000, total:56000,  note:'' },
      { group:'system', code:'SY-RT', description:'ถังเก็บน้ำบนหลังคา 2,000L Stainless',                         unit:'ชุด',  qty:4, unitPrice:22500, total:90000,  note:'' },
      { group:'system', code:'SY-ST', description:'ถังบำบัดน้ำเสียสำเร็จรูป 50,000L',                            unit:'ชุด',  qty:2, unitPrice:185000,total:370000, note:'' },
      { group:'system', code:'SY-GT', description:'บ่อดักไขมัน คสล. สำเร็จรูป',                                  unit:'ชุด',  qty:1, unitPrice:28500, total:28500,  note:'' },
      { group:'system', code:'SY-MH', description:'บ่อพักน้ำ คสล.',                                              unit:'ชุด',  qty:8, unitPrice:4800,  total:38400,  note:'' },

      /* ===== หมวด 9: % เพิ่มเติม ตามเกณฑ์กรมบัญชีกลาง 2550 ===== */
      /* คำนวณจากค่าวัสดุ ท่อ+ข้อต่อ = 73,256+53,530+39,040+16,093+28,160+26,844 = 236,923 */
      { group:'markups', code:'MK-LB', description:'ค่าแรงงานเดินท่อ (30% ของค่าวัสดุท่อ+ข้อต่อ)',               unit:'งวด', qty:1, unitPrice:71077, total:71077, note:'กรมบัญชีกลาง 2550 ข้อ 3' },
      { group:'markups', code:'MK-HG', description:'อุปกรณ์ยึดท่อ (10% ของวัสดุ+แรงงาน)',                       unit:'งวด', qty:1, unitPrice:30800, total:30800, note:'กรมบัญชีกลาง 2550 ข้อ 4' },
      { group:'markups', code:'MK-TS', description:'ค่าทดสอบท่อ + แรงดัน (5% ของวัสดุ+แรงงาน)',                  unit:'งวด', qty:1, unitPrice:15400, total:15400, note:'กรมบัญชีกลาง 2550 ข้อ 5' },
    ]},
    { discipline:'fire', items: [
      { code:'F-SP',  description:'หัวสปริงเกอร์ Concealed Pendent พร้อมท่อ',                            unit:'หัว',   qty:280,  unitPrice:1850,  total:518000,   note:'' },
      { code:'F-FH',  description:'ตู้สายฉีดน้ำดับเพลิง FHC พร้อมอุปกรณ์ครบ',                            unit:'ตู้',    qty:12,   unitPrice:18500, total:222000,   note:'' },
      { code:'F-AL',  description:'ระบบสัญญาณเตือนภัย Smoke Detector + Manual',                          unit:'จุด',    qty:160,  unitPrice:2850,  total:456000,   note:'' },
      { code:'F-PP',  description:'ปั๊มดับเพลิง Electric + Diesel + Jockey',                              unit:'ชุด',    qty:1,    unitPrice:485000,total:485000,   note:'' },
    ]},
    { discipline:'civil', items: [
      { code:'L-LW',  description:'ทางเดินเท้าหินแกรนิตธรรมชาติ + งาน Hardscape',                       unit:'ตร.ม.', qty:380,  unitPrice:2450,  total:931000,   note:'รอบอาคาร' },
      { code:'L-LP',  description:'พื้นที่ปลูกหญ้านวลน้อย + ระบบสปริงเกอร์อัตโนมัติ',                   unit:'ตร.ม.', qty:620,  unitPrice:680,   total:421600,   note:'' },
      { code:'L-TR',  description:'ต้นไม้ใหญ่ประดับ (ความสูง 3-5 ม.) พร้อมค้ำยัน',                       unit:'ต้น',   qty:24,   unitPrice:12500, total:300000,   note:'ปาล์ม/ตะเคียน' },
      { code:'L-PL',  description:'กระบะปลูกไม้พุ่ม คสล. กรุหินทราย + ระบบระบายน้ำ',                    unit:'ม.',    qty:85,   unitPrice:3800,  total:323000,   note:'' },
    ]},
    { discipline:'interior', items: [
      { code:'I-PT',  description:'พาร์ทิชั่นกระจกเทมเปอร์ 10มม. โครงอลูมิเนียม',                       unit:'ตร.ม.', qty:240,  unitPrice:4850,  total:1164000,  note:'ห้องประชุม' },
      { code:'I-DK',  description:'โต๊ะทำงาน Workstation 1.4×1.4 ม. (รวมตู้ลิ้นชัก)',                     unit:'ชุด',   qty:120,  unitPrice:18500, total:2220000,  note:'' },
      { code:'I-CH',  description:'เก้าอี้สำนักงาน Ergonomic พร้อมที่วางแขน',                            unit:'ตัว',   qty:140,  unitPrice:5800,  total:812000,   note:'' },
      { code:'I-MR',  description:'ตกแต่งห้องประชุมใหญ่ + โต๊ะ + อุปกรณ์ AV',                            unit:'เหมา',  qty:1,    unitPrice:1280000,total:1280000,  note:'ชั้น 5' },
    ]},
  ],
};

/* compute grand total */
(function() {
  let g = 0;
  MOCK_BOQ.categories.forEach(c => {
    c.subtotal = c.items.reduce((s,i) => s + (i.total||0), 0);
    g += c.subtotal;
  });
  MOCK_BOQ.grandTotal = g;
})();

/* ---------- MOCK BOQ #2 (slightly different, for Compare) ---------- */
const MOCK_BOQ_2 = JSON.parse(JSON.stringify(MOCK_BOQ));
MOCK_BOQ_2.projectName = 'อาคารสำนักงาน TCM 5 ชั้น (ผู้รับเหมา B)';
MOCK_BOQ_2.client = 'บริษัท ทีซีเอ็ม คอร์ปอเรชั่น จำกัด';
/* tweak prices and add/remove items */
MOCK_BOQ_2.categories.forEach(cat => {
  cat.items.forEach(it => {
    /* random-ish but stable price shift */
    const seed = (it.code.charCodeAt(0) + it.code.charCodeAt(2)) % 11;
    const factor = 1 + (seed - 5) * 0.02; /* ±10% */
    it.unitPrice = Math.round(it.unitPrice * factor);
    it.total = it.qty * it.unitPrice;
  });
});
/* remove one item from architectural */
MOCK_BOQ_2.categories[0].items.splice(2, 1);
/* add one new item to electrical */
MOCK_BOQ_2.categories[3].items.push({
  code:'E-EX', description:'ระบบ Smart Building Automation (BAS)', unit:'ระบบ', qty:1, unitPrice:850000, total:850000, note:'เพิ่ม'
});
/* recompute */
(function() {
  let g = 0;
  MOCK_BOQ_2.categories.forEach(c => {
    c.subtotal = c.items.reduce((s,i) => s + (i.total||0), 0);
    g += c.subtotal;
  });
  MOCK_BOQ_2.grandTotal = g;
})();

/* ---------- MOCK VERIFY ---------- */
const MOCK_VERIFY = {
  overallScore: 88,
  status: 'mostly_complete',
  checks: [
    { t:'แบบสถาปัตยกรรม (A-Series)', s:'ok',   d:'พบ Floor Plan, Elevation, Section ครบทั้ง 5 ชั้น' },
    { t:'แบบโครงสร้าง (S-Series)',   s:'ok',   d:'พบ Foundation Plan, Column Schedule, Beam Schedule ครบ' },
    { t:'แบบงานระบบ M (HVAC)',       s:'ok',   d:'พบ Ducting Layout ทุกชั้น + Equipment Schedule' },
    { t:'แบบงานระบบ E',              s:'ok',   d:'พบ Lighting Plan, Power Plan, Single Line Diagram' },
    { t:'แบบงานระบบ P',              s:'warn', d:'พบ Layout แต่ขาด Riser Diagram บางส่วน' },
    { t:'แบบ Fire Protection',       s:'ok',   d:'พบ Sprinkler Layout + Alarm System ครบ' },
    { t:'แบบภูมิสถาปัตย์ (Landscape)', s:'warn', d:'ขาด Drainage Detail + Landscape Plan ชัดเจน' },
    { t:'รายการประกอบแบบ',           s:'ok',   d:'พบ Specification + Material List ครบ' },
    { t:'มาตราส่วน (Scale)',         s:'ok',   d:'ใช้ 1:100 สถาปัตย์, 1:50 โครงสร้าง — สอดคล้อง' },
  ],
  recommendations: [
    'ขอเพิ่ม Riser Diagram ระบบ Plumbing ทุกชั้นให้ครบ',
    'ขอ Landscape Plan + รายละเอียดการระบายน้ำพื้นภายนอก',
    'ตรวจสอบ Coordination ระหว่างฝ้า E และ Ducting ของ M',
  ],
};

/* ---------- INITIAL QA ---------- */
const QA_INTRO = {
  r:'ai',
  t:'สวัสดีครับ ผมเป็น AI ผู้เชี่ยวชาญด้านการประมาณราคาก่อสร้าง (QS) ของ TCM\n\nผมช่วยคุณเรื่องต่อไปนี้ได้:\n• ตีความรายการ BOQ และมาตรฐาน TCM\n• อธิบายราคาวัสดุ-ค่าแรง ในตลาดปัจจุบัน\n• เปรียบเทียบทางเลือกวัสดุ (เช่น ฝ้า C1 vs C4)\n• ตรวจสอบความถูกต้องของรายการที่ AI ถอดมา\n\nลองถามได้เลยครับ'
};

/* ---------- HELPERS ---------- */
function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function fmtMoneyBaht(n) {
  return '฿ ' + fmtMoney(n);
}
function fmtPct(n, signed=false) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const v = Number(n).toFixed(1);
  return (signed && n > 0 ? '+' : '') + v + '%';
}
function fmtFileSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}

/* expose globally for browser */
window.DISC = DISC;
window.DISC_ORDER = DISC_ORDER;
window.discNorm = discNorm;
window.normDisc = normDisc;
window.LEGAL = LEGAL;
window.MOCK_BOQ = MOCK_BOQ;
window.MOCK_BOQ_2 = MOCK_BOQ_2;
window.MOCK_VERIFY = MOCK_VERIFY;
window.QA_INTRO = QA_INTRO;
window.fmtMoney = fmtMoney;
window.fmtMoneyBaht = fmtMoneyBaht;
window.fmtPct = fmtPct;
window.fmtFileSize = fmtFileSize;

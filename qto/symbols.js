/* ===========================================================
   TCM ConstructAI QTO — SYMBOL KNOWLEDGE BASE (v2 — accurate)
   วาดใหม่ให้ตรงกับ Symbol Legend มาตรฐาน TCM
   - viewBox 60x30 ทุกตัว
   - currentColor + stroke-width 1.2
   =========================================================== */

const _svg = (inner, w=60, h=30) =>
  `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

/* ============================================================
   ARCHITECTURAL  (วาด strip ผนังตามแบบ section cut)
   ============================================================ */
const SYM_ARCH = [
  /* คอนกรีตเสริมเหล็ก — strip + จุด/ขีดสั้นกระจาย */
  { id:'a-rc',
    sym:_svg('<rect x="3" y="10" width="54" height="10"/>'+
      Array.from({length:14}).map((_,i)=>{
        const x = 6 + i*3.7, y = 12 + (i%3)*2.4;
        return `<line x1="${x}" y1="${y}" x2="${x+1.4}" y2="${y}" stroke-width="1"/>`;
      }).join('')+
      Array.from({length:10}).map((_,i)=>{
        const x = 5 + i*5.5, y = 17 - (i%2)*2;
        return `<circle cx="${x}" cy="${y}" r=".5" fill="currentColor" stroke="none"/>`;
      }).join('')
    ),
    th:'คอนกรีตเสริมเหล็ก', en:'Reinforced Concrete', abbr:'RC', disc:'architectural', conf:96 },

  /* ผนังก่ออิฐครึ่งแผ่น — เส้นบาง 2 เส้นบนล่าง มี / hatching ถี่ */
  { id:'a-bk-h',
    sym:_svg('<line x1="3" y1="12" x2="57" y2="12"/><line x1="3" y1="18" x2="57" y2="18"/>'+
      Array.from({length:18}).map((_,i)=>{
        const x = 4 + i*3;
        return `<line x1="${x}" y1="18" x2="${x+3}" y2="12" stroke-width=".7"/>`;
      }).join('')
    ),
    th:'ผนังก่ออิฐครึ่งแผ่น', en:'Half Brick Wall', abbr:'BK-H', disc:'architectural', conf:94 },

  /* ผนังก่ออิฐเต็มแผ่น — strip หนากว่า hatching หนาแน่นกว่า */
  { id:'a-bk-f',
    sym:_svg('<line x1="3" y1="9" x2="57" y2="9"/><line x1="3" y1="21" x2="57" y2="21"/>'+
      Array.from({length:18}).map((_,i)=>{
        const x = 4 + i*3;
        return `<line x1="${x}" y1="21" x2="${x+6}" y2="9" stroke-width=".7"/>`;
      }).join('')
    ),
    th:'ผนังก่ออิฐเต็มแผ่น', en:'Full Brick Wall', abbr:'BK-F', disc:'architectural', conf:91 },

  /* ผนัง คสล. — strip + จุด stippling เหมือน concrete แต่ตั้งเป็นผนัง */
  { id:'a-cwl',
    sym:_svg('<rect x="3" y="10" width="54" height="10"/>'+
      Array.from({length:30}).map((_,i)=>{
        const x = 5 + (i*1.8) % 50, y = 11 + ((i*3.1) % 8);
        return `<circle cx="${x}" cy="${y}" r=".5" fill="currentColor" stroke="none"/>`;
      }).join('')
    ),
    th:'ผนัง คสล. (คอนกรีตเสริมเหล็ก)', en:'RC Wall', abbr:'CW', disc:'architectural', conf:93 },

  /* คอนกรีตบล็อก — strip มีเส้นแบ่งเป็นช่องสี่เหลี่ยม */
  { id:'a-cb',
    sym:_svg('<rect x="3" y="10" width="54" height="10"/>'+
      '<line x1="11" y1="10" x2="11" y2="20"/><line x1="20" y1="10" x2="20" y2="20"/>'+
      '<line x1="29" y1="10" x2="29" y2="20"/><line x1="38" y1="10" x2="38" y2="20"/>'+
      '<line x1="47" y1="10" x2="47" y2="20"/>'+
      '<line x1="3" y1="15" x2="57" y2="15"/>'
    ),
    th:'ผนังคอนกรีตบล็อก', en:'Concrete Block Wall', abbr:'CB', disc:'architectural', conf:88 },

  /* เหล็ก — แท่งทึบ */
  { id:'a-stl',
    sym:_svg('<rect x="6" y="12" width="48" height="6" fill="currentColor"/>'),
    th:'เหล็ก (Steel)', en:'Steel', abbr:'STL', disc:'architectural', conf:95 },

  /* กระจก — เส้นบาง 2 เส้นใกล้กัน */
  { id:'a-glass',
    sym:_svg('<line x1="3" y1="14" x2="57" y2="14"/><line x1="3" y1="16" x2="57" y2="16"/>'),
    th:'กระจก (Glass)', en:'Glass', abbr:'GL', disc:'architectural', conf:92 },

  /* ไม้ไส้แล้ว — แท่งทึบดำ */
  { id:'a-wd-f',
    sym:_svg('<rect x="6" y="12" width="48" height="6" fill="currentColor"/>'),
    th:'ไม้ไส้แล้ว (Finished Wood)', en:'Finished Wood', abbr:'WD-F', disc:'architectural', conf:88 },

  /* ไม้ยังไม่ไส — สี่เหลี่ยมว่างมี X */
  { id:'a-wd-r',
    sym:_svg('<rect x="22" y="8" width="16" height="14"/><line x1="22" y1="8" x2="38" y2="22"/><line x1="38" y1="8" x2="22" y2="22"/>'),
    th:'ไม้ยังไม่ไส', en:'Rough Wood', abbr:'WD-R', disc:'architectural', conf:85 },

  /* ปูกระเบื้องเซรามิค — strip มีเส้นตั้งเล็กถี่ */
  { id:'a-tile',
    sym:_svg('<rect x="3" y="11" width="54" height="8"/>'+
      Array.from({length:18}).map((_,i)=>{
        const x = 5 + i*3;
        return `<line x1="${x}" y1="11" x2="${x}" y2="19" stroke-width=".7"/>`;
      }).join('')
    ),
    th:'ปูกระเบื้องเซรามิค', en:'Ceramic Tile', abbr:'CT', disc:'architectural', conf:90 },

  /* ฉนวน — เส้นหยัก */
  { id:'a-ins',
    sym:_svg('<path d="M3 15 Q7 8 11 15 T19 15 T27 15 T35 15 T43 15 T51 15 T57 15" stroke-width="1"/>'),
    th:'ฉนวน (Insulation)', en:'Insulation', abbr:'INS', disc:'architectural', conf:87 },

  /* ระดับอาคาร ▼±0.00 — สามเหลี่ยมทึบลง + text */
  { id:'a-lvl',
    sym:_svg('<polygon points="14,8 22,8 18,16" fill="currentColor" stroke="none"/><line x1="18" y1="16" x2="18" y2="22"/><text x="26" y="20" font-size="9" fill="currentColor" stroke="none" font-family="monospace">±0.00</text>'),
    th:'แสดงระดับของอาคาร', en:'Floor Level Mark', abbr:'EL', disc:'architectural', conf:97 },

  /* ห้อง — สอง box ซ้อน FOYER/102 */
  { id:'a-rm',
    sym:_svg('<rect x="16" y="4" width="28" height="10"/><text x="30" y="11.5" font-size="6.5" fill="currentColor" stroke="none" text-anchor="middle">FOYER</text><rect x="16" y="14" width="28" height="12"/><text x="30" y="22" font-size="7" fill="currentColor" stroke="none" text-anchor="middle">102</text>'),
    th:'แสดงชื่อห้อง / วัสดุ', en:'Room Name Tag', abbr:'RM', disc:'architectural', conf:96 },

  /* ประตู — circle, WD บน, 2 ล่าง */
  { id:'a-door',
    sym:_svg('<circle cx="30" cy="15" r="9"/><text x="30" y="14" font-size="6.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">WD</text><line x1="22" y1="16" x2="38" y2="16" stroke-width=".6"/><text x="30" y="22" font-size="7" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">2</text>'),
    th:'แสดงหมายเลขประตู', en:'Door Tag', abbr:'DR-T', disc:'architectural', conf:95 },

  /* หน้าต่าง — circle AW/32 */
  { id:'a-win',
    sym:_svg('<circle cx="30" cy="15" r="9"/><text x="30" y="14" font-size="6.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">AW</text><line x1="22" y1="16" x2="38" y2="16" stroke-width=".6"/><text x="30" y="22" font-size="7" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">32</text>'),
    th:'แสดงหมายเลขหน้าต่าง', en:'Window Tag', abbr:'WN-T', disc:'architectural', conf:94 },

  /* ทิศเหนือ N — circle ลูกศรขึ้น + N ล่าง */
  { id:'a-north',
    sym:_svg('<circle cx="30" cy="15" r="11"/><polygon points="30,7 26,15 30,13 34,15" fill="currentColor" stroke="none"/><text x="30" y="24" font-size="7" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">N</text>'),
    th:'ทิศเหนือ', en:'North Arrow', abbr:'N', disc:'architectural', conf:99 },

  /* รูปด้าน — 4 circles cross */
  { id:'a-elv',
    sym:_svg('<circle cx="30" cy="8" r="3.5" stroke-width="1"/><circle cx="22" cy="15" r="3.5" stroke-width="1"/><circle cx="38" cy="15" r="3.5" stroke-width="1"/><circle cx="30" cy="22" r="3.5" stroke-width="1"/><line x1="22" y1="15" x2="38" y2="15" stroke-width=".7"/><line x1="30" y1="8" x2="30" y2="22" stroke-width=".7"/>'),
    th:'แสดงทิศทางการมองรูปด้าน', en:'Elevation Reference', abbr:'ELV', disc:'architectural', conf:90 },

  /* รูปตัด — A1-00 with triangle */
  { id:'a-sec',
    sym:_svg('<polygon points="14,15 20,11 20,19" fill="currentColor" stroke="none"/><circle cx="14" cy="15" r="6"/><text x="14" y="18" font-size="7" fill="currentColor" stroke="none" text-anchor="middle">A</text><line x1="20" y1="15" x2="56" y2="15"/>'),
    th:'แสดงแนวรูปตัด', en:'Section Mark', abbr:'SEC', disc:'architectural', conf:88 },

  /* ระยะ (dimension) — แสดงเส้นวัด + 2.00 */
  { id:'a-dim',
    sym:_svg('<line x1="6" y1="9" x2="6" y2="21"/><line x1="54" y1="9" x2="54" y2="21"/><line x1="6" y1="15" x2="54" y2="15"/><line x1="6" y1="15" x2="11" y2="13"/><line x1="6" y1="15" x2="11" y2="17"/><line x1="54" y1="15" x2="49" y2="13"/><line x1="54" y1="15" x2="49" y2="17"/><text x="30" y="13" font-size="6.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">2.00</text>'),
    th:'ระยะ (Dimension)', en:'Dimension Line', abbr:'DIM', disc:'architectural', conf:97 },

  /* F.D — Floor Drain (circle + cross) */
  { id:'a-fd',
    sym:_svg('<circle cx="14" cy="15" r="5"/><line x1="9" y1="15" x2="19" y2="15"/><line x1="14" y1="10" x2="14" y2="20"/><text x="26" y="18" font-size="8" fill="currentColor" stroke="none" font-family="monospace">F.D</text>'),
    th:'Floor Drain', en:'Floor Drain', abbr:'F.D', disc:'architectural', conf:95 },
];

/* ============================================================
   MECHANICAL / HVAC
   ============================================================ */
const SYM_HVAC = [
  /* FC Ceiling Concealed — กล่องใหญ่ + ขีดล่างเป็นซี่ */
  { id:'m-fc',
    sym:_svg('<rect x="10" y="6" width="40" height="12"/><rect x="14" y="9" width="6" height="6"/><line x1="22" y1="11" x2="22" y2="14"/><line x1="26" y1="11" x2="26" y2="14"/><line x1="30" y1="11" x2="30" y2="14"/>'+
      Array.from({length:18}).map((_,i)=>`<line x1="${12+i*2}" y1="20" x2="${12+i*2}" y2="24" stroke-width=".7"/>`).join('')
    ),
    th:'ชุดแฟนคอยล์ซ่อนในฝ้าเพดาน', en:'Fan Coil (Ceiling Concealed)', abbr:'FC', disc:'mechanical', conf:94 },

  /* CU — กล่องบน + เส้นแกนลง */
  { id:'m-cu',
    sym:_svg('<rect x="14" y="8" width="32" height="7"/><line x1="30" y1="15" x2="30" y2="24"/><line x1="27" y1="20" x2="33" y2="20"/>'),
    th:'คอนเดนซิ่งยูนิต', en:'Condensing Unit', abbr:'CU', disc:'mechanical', conf:96 },

  /* Exhaust Fan Propeller — square + diagonal + arrow ไปขวา */
  { id:'m-ef-p',
    sym:_svg('<rect x="10" y="9" width="14" height="12"/><line x1="10" y1="9" x2="24" y2="21"/><line x1="24" y1="9" x2="10" y2="21"/><line x1="17" y1="15" x2="24" y2="15"/><line x1="24" y1="15" x2="50" y2="15"/><polygon points="50,15 46,13 46,17" fill="currentColor" stroke="none"/>'),
    th:'พัดลมดูดทิ้ง (Propeller)', en:'Exhaust Fan, Propeller', abbr:'EF-P', disc:'mechanical', conf:90 },

  /* Exhaust Fan Ceiling — square X กลาง */
  { id:'m-ef-c',
    sym:_svg('<rect x="20" y="6" width="20" height="18"/><line x1="20" y1="6" x2="40" y2="24"/><line x1="40" y1="6" x2="20" y2="24"/><line x1="40" y1="15" x2="50" y2="15"/>'),
    th:'พัดลมดูดทิ้งติดฝ้าเพดาน', en:'Exhaust Fan, Ceiling Mounted', abbr:'EF-C', disc:'mechanical', conf:90 },

  /* Thermostat T — circle T */
  { id:'m-t',
    sym:_svg('<circle cx="30" cy="15" r="8"/><text x="30" y="19" font-size="11" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">T</text>'),
    th:'เทอร์โมสตัด', en:'Thermostat', abbr:'T', disc:'mechanical', conf:97 },

  /* Switch S — circle S */
  { id:'m-s',
    sym:_svg('<circle cx="30" cy="15" r="8"/><text x="30" y="19" font-size="11" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">S</text>'),
    th:'สวิตช์ (HVAC)', en:'HVAC Switch', abbr:'S', disc:'mechanical', conf:95 },

  /* Refrigerant pipe — line + R */
  { id:'m-r',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17"/><text x="30" y="11" font-size="9" fill="currentColor" stroke="none" text-anchor="middle">R</text>'),
    th:'ท่อน้ำยา (Refrigerant)', en:'Refrigerant Pipe', abbr:'R', disc:'mechanical', conf:92 },

  /* Drain — dashed line + D */
  { id:'m-d',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17" stroke-dasharray="5,3"/><text x="30" y="11" font-size="9" fill="currentColor" stroke="none" text-anchor="middle">D</text>'),
    th:'ท่อน้ำทิ้ง (Drain)', en:'Drain', abbr:'D', disc:'mechanical', conf:91 },

  /* Pipe Run Up — line + ⊙ (target) */
  { id:'m-pup',
    sym:_svg('<line x1="3" y1="15" x2="42" y2="15"/><circle cx="48" cy="15" r="5"/><circle cx="48" cy="15" r="1.5" fill="currentColor" stroke="none"/>'),
    th:'ท่อขึ้น (Pipe Run Up)', en:'Pipe Run Up', abbr:'P-U', disc:'mechanical', conf:90 },

  /* Pipe Run Down — line + ○ (empty circle) */
  { id:'m-pdn',
    sym:_svg('<line x1="3" y1="15" x2="42" y2="15"/><circle cx="48" cy="15" r="5"/>'),
    th:'ท่อลง (Pipe Run Down)', en:'Pipe Run Down', abbr:'P-D', disc:'mechanical', conf:90 },

  /* Volume Damper — duct + diagonal */
  { id:'m-vd',
    sym:_svg('<line x1="6" y1="11" x2="54" y2="11"/><line x1="6" y1="19" x2="54" y2="19"/><line x1="24" y1="9" x2="36" y2="21" stroke-width="1.4"/>'),
    th:'ชุดแผ่นปรับปริมาณลม', en:'Volume Damper', abbr:'VD', disc:'mechanical', conf:90 },

  /* Fire Damper — duct + FD box */
  { id:'m-fd',
    sym:_svg('<line x1="6" y1="11" x2="54" y2="11"/><line x1="6" y1="19" x2="54" y2="19"/><rect x="25" y="8" width="10" height="14"/><text x="30" y="18.5" font-size="6.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">FD</text>'),
    th:'แดมเปอร์กันไฟลาม', en:'Fire Damper', abbr:'FD', disc:'mechanical', conf:92 },

  /* 4-Way Square Ceiling Diffuser — square + X */
  { id:'m-4scd',
    sym:_svg('<rect x="20" y="5" width="20" height="20"/><line x1="20" y1="5" x2="40" y2="25"/><line x1="40" y1="5" x2="20" y2="25"/>'),
    th:'หัวจ่ายลม 4 ทาง ติดเพดาน', en:'4-Way Square Ceiling Diffuser', abbr:'4-SCD', disc:'mechanical', conf:93 },

  /* Round Ceiling Diffuser — concentric circles */
  { id:'m-rd',
    sym:_svg('<circle cx="30" cy="15" r="10"/><circle cx="30" cy="15" r="6"/><circle cx="30" cy="15" r="2"/>'),
    th:'หัวจ่ายลมกลม ติดเพดาน', en:'Round Ceiling Diffuser', abbr:'RD', disc:'mechanical', conf:91 },
];

/* ============================================================
   ELECTRICAL
   ============================================================ */
const SYM_ELEC = [
  /* HV Load Break Switch */
  { id:'e-hvs',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><line x1="22" y1="15" x2="32" y2="7"/><circle cx="22" cy="15" r="1.5" fill="currentColor" stroke="none"/><circle cx="32" cy="7" r="1.5" fill="currentColor" stroke="none"/><line x1="34" y1="15" x2="57" y2="15"/>'),
    th:'HV Load Break Switch', en:'HV Load Break Switch', abbr:'HVS', disc:'electrical', conf:88 },

  /* HV Fuse — line + rectangle */
  { id:'e-fuse',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><rect x="22" y="11" width="16" height="8"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'ฟิวส์แรงสูง', en:'HV Fuse', abbr:'F', disc:'electrical', conf:90 },

  /* Distribution Transformer — two intersecting circles */
  { id:'e-tr',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><circle cx="26" cy="15" r="5"/><circle cx="34" cy="15" r="5"/><line x1="39" y1="15" x2="57" y2="15"/><text x="30" y="29" font-size="6" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">TR</text>'),
    th:'หม้อแปลงไฟฟ้า', en:'Distribution Transformer', abbr:'TR', disc:'electrical', conf:93 },

  /* Circuit Breaker — break with diagonal */
  { id:'e-cb',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><line x1="22" y1="15" x2="34" y2="9"/><line x1="34" y1="15" x2="57" y2="15"/><circle cx="22" cy="15" r="1.5" fill="currentColor" stroke="none"/>'),
    th:'Circuit Breaker', en:'Circuit Breaker', abbr:'CB', disc:'electrical', conf:96 },

  /* Single Outlet — circle with vertical line (plug) */
  { id:'e-out',
    sym:_svg('<circle cx="30" cy="15" r="7"/><line x1="30" y1="15" x2="30" y2="22"/><line x1="30" y1="22" x2="30" y2="27"/>'),
    th:'เต้ารับเดี่ยว 16A', en:'Single Convenient Outlet', abbr:'OUT-S', disc:'electrical', conf:96 },

  /* Duplex Outlet — circle with two prongs */
  { id:'e-dup',
    sym:_svg('<circle cx="30" cy="15" r="7"/><line x1="27" y1="22" x2="27" y2="27"/><line x1="33" y1="22" x2="33" y2="27"/><line x1="27" y1="22" x2="33" y2="22"/>'),
    th:'เต้ารับคู่ 16A', en:'Duplex Convenient Outlet', abbr:'OUT-D', disc:'electrical', conf:95 },

  /* Single Switch — S */
  { id:'e-sw1',
    sym:_svg('<text x="30" y="20" font-size="16" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">S</text>'),
    th:'สวิตช์ทางเดียว 16A', en:'Single Pole Switch', abbr:'S', disc:'electrical', conf:97 },

  /* Two-way Switch — S₂ */
  { id:'e-sw2',
    sym:_svg('<text x="28" y="20" font-size="16" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">S</text><text x="38" y="24" font-size="9" fill="currentColor" stroke="none" font-family="monospace">2</text>'),
    th:'สวิตช์สองทาง 16A', en:'Two-Way Switch', abbr:'S2', disc:'electrical', conf:95 },

  /* Wiring 2 conductors — arc with 2 ticks */
  { id:'e-w2',
    sym:_svg('<path d="M10 24 Q30 -2 50 24"/><line x1="28" y1="11" x2="32" y2="9" stroke-width="1.1"/><line x1="32" y1="11" x2="36" y2="9" stroke-width="1.1"/>'),
    th:'สายไฟ 2 เส้น (1/2" Conduit)', en:'Wiring 2 Conductors', abbr:'W2', disc:'electrical', conf:84 },

  /* FCP — Fire Alarm Panel */
  { id:'e-fcp',
    sym:_svg('<rect x="13" y="6" width="34" height="18"/><text x="30" y="19" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">FCP</text>'),
    th:'ตู้ควบคุมแจ้งเตือนเพลิงไหม้', en:'Fire Alarm Control Panel', abbr:'FCP', disc:'electrical', conf:93 },

  /* Smoke Detector SD */
  { id:'e-sd',
    sym:_svg('<circle cx="30" cy="15" r="9"/><text x="30" y="18.5" font-size="9" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">SD</text>'),
    th:'Smoke Detector (Photoelectric)', en:'Smoke Detector', abbr:'SD', disc:'electrical', conf:96 },

  /* Heat Detector H */
  { id:'e-hd',
    sym:_svg('<circle cx="30" cy="15" r="9"/><text x="30" y="19" font-size="11" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">H</text>'),
    th:'Heat Detector (Fixed Temp)', en:'Heat Detector', abbr:'H', disc:'electrical', conf:95 },

  /* Speaker — square with diagonal cone */
  { id:'e-spk',
    sym:_svg('<polygon points="22,11 26,11 36,5 36,25 26,19 22,19" fill="currentColor" fill-opacity=".25"/><polygon points="22,11 26,11 36,5 36,25 26,19 22,19"/>'),
    th:'ลำโพง (Speaker)', en:'Speaker', abbr:'SP', disc:'electrical', conf:90 },

  /* CCTV Camera */
  { id:'e-cctv',
    sym:_svg('<rect x="14" y="9" width="20" height="12"/><circle cx="22" cy="15" r="3"/><polygon points="34,11 46,7 46,23 34,19" fill="currentColor" fill-opacity=".25"/><polygon points="34,11 46,7 46,23 34,19"/>'),
    th:'กล้อง CCTV (IP66 Fixed)', en:'CCTV Camera', abbr:'CCTV', disc:'electrical', conf:91 },

  /* Junction Box */
  { id:'e-jb',
    sym:_svg('<circle cx="30" cy="15" r="6"/><text x="30" y="18" font-size="8" fill="currentColor" stroke="none" text-anchor="middle" font-family="serif">J</text>'),
    th:'Junction Box (Connecting/Pull)', en:'Junction Box', abbr:'J', disc:'electrical', conf:90 },
];

/* ============================================================
   PLUMBING / SANITARY
   ============================================================ */
const SYM_PLUMB = [
  /* Cold Water — long dashed */
  { id:'p-cw',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17" stroke-dasharray="8,4"/><text x="30" y="11" font-size="7.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">CW</text>'),
    th:'ท่อน้ำเย็น (Cold Water)', en:'Cold Water Pipe', abbr:'CW', disc:'plumbing', conf:96 },

  /* Hot Water — shorter dashes */
  { id:'p-hw',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17" stroke-dasharray="4,3"/><text x="30" y="11" font-size="7.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">HW</text>'),
    th:'ท่อน้ำร้อน (Hot Water)', en:'Hot Water Pipe', abbr:'HW', disc:'plumbing', conf:94 },

  /* Soil Pipe — thick solid */
  { id:'p-s',
    sym:_svg('<line x1="3" y1="16" x2="57" y2="16" stroke-width="2.5"/><text x="30" y="11" font-size="7.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">S</text>'),
    th:'ท่อน้ำโสโครก (Soil)', en:'Soil Pipe', abbr:'S', disc:'plumbing', conf:95 },

  /* Waste Pipe — thin solid */
  { id:'p-w',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17"/><text x="30" y="11" font-size="7.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">W</text>'),
    th:'ท่อน้ำทิ้ง (Waste)', en:'Waste Pipe', abbr:'W', disc:'plumbing', conf:96 },

  /* Vent Pipe — short dashed */
  { id:'p-v',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17" stroke-dasharray="3,3"/><text x="30" y="11" font-size="7.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">V</text>'),
    th:'ท่ออากาศ (Vent)', en:'Vent Pipe', abbr:'V', disc:'plumbing', conf:93 },

  /* Rain Water — line with RW */
  { id:'p-rw',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17"/><text x="30" y="11" font-size="7.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">RW</text>'),
    th:'ท่อระบายน้ำฝน (Rain Water)', en:'Rain Water Pipe', abbr:'RW', disc:'plumbing', conf:94 },

  /* Fire Pipe — line with F */
  { id:'p-f',
    sym:_svg('<line x1="3" y1="17" x2="57" y2="17"/><text x="30" y="11" font-size="7.5" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">F</text>'),
    th:'ท่อดับเพลิง (Fire)', en:'Fire Pipe', abbr:'F', disc:'plumbing', conf:95 },

  /* Floor Drain with P or S trap — box top with trap */
  { id:'p-fd',
    sym:_svg('<rect x="6" y="14" width="9" height="9" stroke-width="1"/><path d="M11 14 L11 9 L17 9 L17 12" stroke-width="1"/><polygon points="17,12 19,9 15,9" fill="currentColor" stroke="none"/><line x1="22" y1="18" x2="34" y2="18" stroke-width=".8"/><circle cx="38" cy="15" r="3"/><path d="M38 12 Q42 12 42 16 Q42 20 38 18" stroke-width="1"/><text x="50" y="20" font-size="7" fill="currentColor" stroke="none" font-family="monospace">FD</text>'),
    th:'Floor Drain (P or S Trap)', en:'Floor Drain with Trap', abbr:'FD', disc:'plumbing', conf:93 },

  /* Roof Drain — concentric circles ⊙ */
  { id:'p-rd',
    sym:_svg('<circle cx="22" cy="15" r="7"/><circle cx="22" cy="15" r="3"/><text x="38" y="18" font-size="8" fill="currentColor" stroke="none" font-family="monospace">RD</text>'),
    th:'Roof Drain / Area Drain', en:'Roof Drain', abbr:'RD', disc:'plumbing', conf:92 },

  /* Cleanout — line with bracket */
  { id:'p-co',
    sym:_svg('<line x1="3" y1="15" x2="38" y2="15"/><line x1="38" y1="11" x2="38" y2="19"/><line x1="36" y1="11" x2="42" y2="11"/><text x="48" y="18" font-size="8" fill="currentColor" stroke="none" font-family="monospace">CO</text>'),
    th:'Cleanout or Plug', en:'Cleanout or Plug', abbr:'CO', disc:'plumbing', conf:91 },

  /* Gate Valve — bowtie with X */
  { id:'p-gv',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><polygon points="22,15 30,9 30,21" stroke-width="1"/><polygon points="38,15 30,9 30,21" stroke-width="1"/><line x1="26" y1="11" x2="34" y2="19" stroke-width=".9"/><line x1="34" y1="11" x2="26" y2="19" stroke-width=".9"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'Gate Valve', en:'Gate Valve', abbr:'GV', disc:'plumbing', conf:95 },

  /* Check Valve — bowtie + arrow direction */
  { id:'p-cv',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><polygon points="22,9 22,21 38,15" fill="currentColor" stroke="none"/><line x1="38" y1="9" x2="38" y2="21" stroke-width="1.5"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'Check Valve', en:'Check Valve', abbr:'CV', disc:'plumbing', conf:95 },

  /* Ball Valve — bowtie + small circle */
  { id:'p-bv',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><polygon points="22,15 30,9 30,21" stroke-width="1"/><polygon points="38,15 30,9 30,21" stroke-width="1"/><circle cx="30" cy="15" r="2.5" fill="currentColor" stroke="none"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'Ball Valve', en:'Ball Valve', abbr:'BV', disc:'plumbing', conf:94 },

  /* Butterfly Valve — bowtie + diagonal */
  { id:'p-bfv',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><polygon points="22,15 30,9 30,21" stroke-width="1"/><polygon points="38,15 30,9 30,21" stroke-width="1"/><line x1="25" y1="20" x2="35" y2="10" stroke-width="1.2"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'Butterfly Valve', en:'Butterfly Valve', abbr:'BFV', disc:'plumbing', conf:92 },

  /* Pump — circle + flow arrow */
  { id:'p-pump',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><circle cx="30" cy="15" r="8"/><polygon points="26,12 36,15 26,18" fill="currentColor" stroke="none"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'ปั๊มน้ำ', en:'Pump', abbr:'PMP', disc:'plumbing', conf:93 },

  /* Water Closet — top view */
  { id:'p-wc',
    sym:_svg('<rect x="14" y="9" width="11" height="12" rx="1"/><ellipse cx="34" cy="15" rx="9" ry="6"/>'),
    th:'โถสุขภัณฑ์ Water Closet', en:'Water Closet', abbr:'WC', disc:'plumbing', conf:97 },

  /* Lavatory — basin */
  { id:'p-lv',
    sym:_svg('<rect x="14" y="6" width="32" height="18" rx="3"/><ellipse cx="30" cy="17" rx="11" ry="5"/>'),
    th:'อ่างล้างหน้า (Lavatory)', en:'Lavatory', abbr:'LV', disc:'plumbing', conf:95 },

  /* Urinal — pear shape top view */
  { id:'p-ur',
    sym:_svg('<path d="M22 6 Q22 6 22 18 Q22 24 30 24 Q38 24 38 18 Q38 6 38 6 Z"/>'),
    th:'โถปัสสาวะชาย (Urinal)', en:'Urinal', abbr:'UR', disc:'plumbing', conf:94 },

  /* Hose Bibb */
  { id:'p-hb',
    sym:_svg('<line x1="3" y1="15" x2="40" y2="15"/><circle cx="44" cy="15" r="3"/><line x1="44" y1="18" x2="44" y2="24"/><text x="52" y="29" font-size="6" fill="currentColor" stroke="none" font-family="monospace">HB</text>'),
    th:'ก๊อกน้ำสนาม (Hose Bibb)', en:'Hose Bibb', abbr:'HB', disc:'plumbing', conf:91 },
];

/* ============================================================
   FIRE PROTECTION
   ============================================================ */
const SYM_FIRE = [
  /* Sprinkler Pendent — circle with dot/plus */
  { id:'f-spp',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><circle cx="30" cy="15" r="4"/><circle cx="30" cy="15" r=".8" fill="currentColor" stroke="none"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'หัวสปริงเกอร์ Pendent 155°F', en:'Sprinkler Pendent', abbr:'SPP', disc:'fire', conf:94 },

  /* Sprinkler Upright — filled red dot */
  { id:'f-spu',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><circle cx="30" cy="15" r="3.5" fill="#E53E3E" stroke="#E53E3E"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'หัวสปริงเกอร์ Upright 155°F', en:'Sprinkler Upright', abbr:'SPU', disc:'fire', conf:93 },

  /* Sprinkler Ceiling Conceal — circle with X */
  { id:'f-spc',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><circle cx="30" cy="15" r="4"/><line x1="27" y1="12" x2="33" y2="18" stroke-width="1"/><line x1="33" y1="12" x2="27" y2="18" stroke-width="1"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'สปริงเกอร์ Ceiling Conceal 155°F', en:'Sprinkler Ceiling Conceal', abbr:'SPC', disc:'fire', conf:90 },

  /* Fire Hydrant — Star/asterisk inside circle */
  { id:'f-fh',
    sym:_svg('<line x1="3" y1="15" x2="20" y2="15"/><circle cx="30" cy="15" r="8"/><line x1="24" y1="9" x2="36" y2="21" stroke-width="1.1"/><line x1="36" y1="9" x2="24" y2="21" stroke-width="1.1"/><line x1="22" y1="15" x2="38" y2="15" stroke-width="1.1"/><line x1="30" y1="7" x2="30" y2="23" stroke-width="1.1"/><line x1="40" y1="15" x2="57" y2="15"/>'),
    th:'หัวจ่ายน้ำดับเพลิง (Fire Hydrant)', en:'Fire Hydrant', abbr:'FH', disc:'fire', conf:95 },

  /* FDC — Y-shape */
  { id:'f-fdc',
    sym:_svg('<line x1="6" y1="9" x2="22" y2="18"/><line x1="6" y1="27" x2="22" y2="18"/><circle cx="6" cy="9" r="2.5"/><circle cx="6" cy="27" r="2.5"/><line x1="22" y1="18" x2="46" y2="18"/><text x="38" y="13" font-size="7" fill="currentColor" stroke="none" font-family="monospace">FDC</text>'),
    th:'Fire Department Connection', en:'Fire Dept Connection', abbr:'FDC', disc:'fire', conf:93 },

  /* FHC — Fire Hose Cabinet */
  { id:'f-fhc',
    sym:_svg('<rect x="14" y="6" width="32" height="18"/><line x1="30" y1="6" x2="30" y2="24"/><polygon points="20,10 26,15 20,20" fill="currentColor" fill-opacity=".25" stroke-width=".7"/><text x="38" y="17" font-size="6" fill="currentColor" stroke="none" text-anchor="middle" font-family="monospace">FHC</text>'),
    th:'ตู้สายฉีดน้ำดับเพลิง', en:'Fire Hose Cabinet', abbr:'FHC', disc:'fire', conf:96 },

  /* Portable Fire Extinguisher */
  { id:'f-ext',
    sym:_svg('<polygon points="20,7 22,7 22,9 26,9 26,11 24,11 24,23 18,23 18,11 16,11 16,9 20,9" fill="currentColor" stroke="none"/><circle cx="40" cy="15" r="5"/><circle cx="40" cy="13" r="1.5" fill="currentColor" stroke="none"/>'),
    th:'ถังดับเพลิงพกพา', en:'Portable Fire Extinguisher', abbr:'EXT', disc:'fire', conf:96 },

  /* Roof Manifold RM */
  { id:'f-rm',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><polygon points="22,15 30,9 30,21" stroke-width=".8"/><polygon points="38,15 30,9 30,21" stroke-width=".8"/><line x1="30" y1="9" x2="30" y2="3"/><circle cx="30" cy="3" r="1.5"/><line x1="38" y1="15" x2="57" y2="15"/><text x="50" y="24" font-size="6" fill="currentColor" stroke="none" font-family="monospace">RM</text>'),
    th:'Roof Manifold', en:'Roof Manifold', abbr:'RM', disc:'fire', conf:89 },

  /* Alarm Valve */
  { id:'f-alv',
    sym:_svg('<line x1="3" y1="15" x2="22" y2="15"/><polygon points="22,15 30,9 30,21" stroke-width=".8"/><polygon points="38,15 30,9 30,21" stroke-width=".8"/><polygon points="30,9 28,4 32,4" stroke-width=".8"/><line x1="38" y1="15" x2="57" y2="15"/>'),
    th:'Alarm Valve', en:'Alarm Valve', abbr:'AV', disc:'fire', conf:88 },

  /* Sprinkler Annunciator Board — bowtie shape solid */
  { id:'f-snp',
    sym:_svg('<polygon points="14,9 26,15 14,21" fill="currentColor" stroke="none"/><polygon points="46,9 34,15 46,21" fill="currentColor" stroke="none"/><line x1="26" y1="15" x2="34" y2="15"/>'),
    th:'Sprinkler Annunciator Board', en:'Sprinkler Annunciator Board', abbr:'SAB', disc:'fire', conf:87 },
];

/* ============================================================
   Combine
   ============================================================ */
window.SYMBOLS_KB = {
  architectural: SYM_ARCH,
  mechanical:    SYM_HVAC,
  electrical:    SYM_ELEC,
  plumbing:      SYM_PLUMB,
  fire:          SYM_FIRE,
};

/* ============================================================
   User Override Storage (Learned Knowledge)
   ============================================================ */
const OVERRIDE_KEY = 'tcm-symbol-overrides';

window.loadSymbolOverrides = function() {
  try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}'); }
  catch { return {}; }
};

window.saveSymbolOverrides = function(o) {
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o));
};

window.getEffectiveSymbols = function() {
  const ov = loadSymbolOverrides();
  const out = {};
  Object.keys(SYMBOLS_KB).forEach(disc => {
    out[disc] = SYMBOLS_KB[disc].map(s => {
      const o = ov[s.id];
      return o ? { ...s, ...o, edited:true } : s;
    });
    Object.values(ov).forEach(o => {
      if (o.disc === disc && o._new && !out[disc].find(x => x.id === o.id)) {
        out[disc].push({ ...o, edited:true });
      }
    });
  });
  return out;
};

/* ===========================================================
   TCM ConstructAI QTO Agent — TABS: TAKEOFF + COMPARE (MAIN)
   =========================================================== */

window.RENDER = window.RENDER || {};

/* ============================================================
   TAB: TAKEOFF — หลัก
   ============================================================ */
window.RENDER.takeoff = function(root) {
  const boq = S.boq;

  root.appendChild(el('div', { class:'page-head' },
    el('div', null,
      el('h2', null,
        el('span', { class:'pg-icon', html: ICN.takeoff }),
        'ถอดปริมาณงาน (Quantity Takeoff)'
      ),
      el('div', { class:'crumbs' }, 'BOQ Form ปร.4 · มาตรฐาน TCM · พร้อมพิมพ์เป็น PDF')
    ),
    el('div', { class:'acts' },
      boq && el('button', { class:'btn btn-ghost', onclick: () => window.print() },
        el('span', { html: ICN.print }), 'พิมพ์ / Save PDF'
      ),
      boq && el('button', { class:'btn btn-ghost', onclick: () => dlXLSX(boq, 'TCM_BOQ.xlsx') },
        el('span', { html: ICN.download }), 'Export Excel'
      ),
      el('button', { class:'btn '+(boq ? 'btn-ghost' : 'btn-accent'),
        onclick: () => runTakeoff()
      },
        el('span', { html: boq ? ICN.refresh : ICN.play }),
        boq ? 'ถอดใหม่' : 'เริ่มถอดปริมาณ'
      ),
    )
  ));

  if (!boq) {
    /* Suggest scanning symbols first if user has files but hasn't reviewed symbols */
    if (S.files.length && !S.symbolsConfirmed) {
      root.appendChild(el('div', { class:'sym-banner' },
        el('div', { class:'ic', html: ICN.bolt }),
        el('div', { class:'body' },
          el('b', null, 'แนะนำ: ตรวจสอบสัญลักษณ์ก่อนถอดปริมาณ'),
          el('p', null, 'ให้ AI สแกนหา Symbol Legend และยืนยันความเข้าใจ — ช่วยให้ผลถอดปริมาณแม่นยำขึ้น'),
        ),
        el('button', { class:'btn btn-accent btn-sm', onclick: () => go('verify') }, 'ไปตรวจสัญลักษณ์ →')
      ));
    }
    root.appendChild(emptyBOQ());
    return;
  }

  /* KPI Row */
  const kpis = el('div', { class:'grid-4', style:{ marginBottom:'18px' } });
  kpis.appendChild(kpiCard('navy', 'พื้นที่รวม (ตร.ม.)', fmtMoney(boq.totalArea), null));
  kpis.appendChild(kpiCard('', 'จำนวนรายการ', boq.categories.reduce((a,c)=>a+c.items.length,0), boq.categories.length+' หมวด'));
  const ratePerSqm = boq.totalArea ? boq.grandTotal / boq.totalArea : 0;
  kpis.appendChild(kpiCard('', 'ต้นทุน/ตร.ม.', fmtMoney(Math.round(ratePerSqm)), 'บาท'));
  kpis.appendChild(kpiCard('green', 'งบประมาณรวม', fmtMoneyBaht(boq.grandTotal), boq.scale));
  root.appendChild(kpis);

  /* BOQ Table — ปร.4 style */
  const wrap = el('div', { class:'boq-wrap', id:'boq-print' });
  const head = el('div', { class:'boq-head' },
    el('div', { class:'ttl' }, 'รายการประมาณราคา (Bill of Quantities) — แบบ ปร.4'),
    el('div', { class:'meta-row' },
      el('span', null, el('b', null, 'โครงการ: '), boq.projectName),
      el('span', null, el('b', null, 'เจ้าของ: '), boq.client || '—'),
      el('span', null, el('b', null, 'พื้นที่: '), fmtMoney(boq.totalArea)+' ตร.ม.'),
      el('span', null, el('b', null, 'มาตราส่วน: '), boq.scale || '—'),
      el('span', null, el('b', null, 'วันที่: '), boq.date || '—'),
    )
  );
  wrap.appendChild(head);

  const tbl = el('table', { class:'boq-table' });
  const thead = el('thead', null,
    el('tr', null,
      el('th', { class:'ctr', style:{width:'42px'} }, 'ลำดับ'),
      el('th', { style:{width:'80px'} }, 'รหัส'),
      el('th', null, 'รายการ'),
      el('th', { class:'ctr', style:{width:'62px'} }, 'หน่วย'),
      el('th', { class:'ctr', style:{width:'70px'} }, 'เผื่อ %'),
      el('th', { class:'num', style:{width:'88px'} }, 'จำนวน'),
      el('th', { class:'num', style:{width:'108px'} }, 'ราคาต่อหน่วย'),
      el('th', { class:'num', style:{width:'128px'} }, 'รวม (บาท)'),
      el('th', { style:{width:'110px'} }, 'หมายเหตุ'),
    )
  );
  tbl.appendChild(thead);

  const tbody = el('tbody');
  let rowNum = 0;
  boq.categories.forEach((cat, ci) => {
    const d = DISC[cat.discipline] || { l:cat.discipline, s:'?', c:'#999' };
    tbody.appendChild(el('tr', { class:'discip' },
      el('td', { colspan:9 },
        el('span', { class:'dpc' },
          el('span', { class:'di', style:{ background:d.c } }, d.s.charAt(0)),
          'หมวด '+(ci+1)+' · '+d.l+' ('+d.s+')'
        )
      )
    ));
    let lastGroup = null;
    let groupSub = 0;
    const groupLabels = {
      /* Structural */
      foundation: '1. งานฐานราก (Foundation)',
      column:     '2. งานเสา (Column)',
      beam:       '3. งานคาน (Beam)',
      slab:       '4. งานพื้น (Slab)',
      /* Architectural */
      ceiling:       '1. งานฝ้าเพดาน (Ceiling)',
      wall:          '2. งานผนัง (Wall)',
      floor:         '3. งานพื้น (Floor)',
      'door-window': '4. งานประตู-หน้าต่าง (Doors & Windows)',
      roof:          '5. งานหลังคา (Roof)',
      misc:          '6. งานเบ็ดเตล็ดและภายนอก (Misc)',
      /* Mechanical / HVAC */
      'ac-equip':    '1. เครื่องปรับอากาศ (AC Equipment)',
      ductwork:      '2. ท่อลม + ฉนวน (Ductwork + Insulation)',
      diffuser:      '3. หัวจ่ายลม + Damper',
      refrigerant:   '4. ท่อน้ำยาทำความเย็น (Refrigerant Pipe)',
      exhaust:       '5. พัดลมระบายอากาศ (Exhaust)',
      /* Electrical */
      wiring:           '1. สายไฟ + ท่อร้อยสาย (Wiring + Conduit)',
      lighting:         '2. ดวงไฟ (Lighting)',
      'outlet-switch':  '3. เต้ารับ + สวิตช์ (Outlets & Switches)',
      mdb:              '4. ตู้ MDB + Breakers',
      'fire-alarm':     '5. Fire Alarm System',
      communication:    '6. CCTV + Communication',
      lightning:        '7. Lightning Protection',
      generator:        '8. Generator + ATS',
      /* Plumbing — ตามมาตรฐานกรมบัญชีกลาง 2550 */
      'pipe-cw':  '1. ท่อน้ำใช้ (Cold Water) — PVC ชั้นคุณภาพ 13.5',
      'pipe-w':   '2. ท่อน้ำทิ้ง (Waste) — PVC ชั้นคุณภาพ 8.5',
      'pipe-s':   '3. ท่อโสโครก (Soil) — PVC ชั้นคุณภาพ 8.5',
      'pipe-v':   '4. ท่อระบายอากาศ (Vent) — PVC ชั้นคุณภาพ 8.5',
      'pipe-rw':  '5. ท่อระบายน้ำฝน (Rain Water)',
      'fittings': '6. อุปกรณ์ข้อต่อ-ข้องอ (Fittings)',
      'fixtures': '7. สุขภัณฑ์ (Fixtures)',
      'system':   '8. อุปกรณ์ระบบ (System Equipment)',
      /* Common */
      'markups':  '9. ค่าใช้จ่ายเพิ่มเติม (กรมบัญชีกลาง 2560)',
    };
    cat.items.forEach((it, i) => {
      /* Sub-group header */
      if (it.group && it.group !== lastGroup) {
        if (lastGroup) {
          /* close prev group with subtotal */
          tbody.appendChild(el('tr', { class:'group-subtot' },
            el('td', { colspan:6, class:'num', style:{textAlign:'right', paddingRight:'12px', fontStyle:'italic'} }, 'รวมหมวด '+(groupLabels[lastGroup]||lastGroup)),
            el('td', { class:'num', style:{fontStyle:'italic'} }, fmtMoney(groupSub)),
            el('td', null, ''),
          ));
          groupSub = 0;
        }
        tbody.appendChild(el('tr', { class:'group-head' },
          el('td', { colspan:9 },
            el('span', { class:'gh' }, '▸ '+(groupLabels[it.group]||it.group))
          )
        ));
        lastGroup = it.group;
      }
      /* if entering items WITHOUT group after having one — close it */
      if (!it.group && lastGroup) {
        tbody.appendChild(el('tr', { class:'group-subtot' },
          el('td', { colspan:7, class:'num', style:{textAlign:'right', paddingRight:'12px', fontStyle:'italic'} }, 'รวมหมวด '+(groupLabels[lastGroup]||lastGroup)),
          el('td', { class:'num', style:{fontStyle:'italic'} }, fmtMoney(groupSub)),
          el('td', null, ''),
        ));
        lastGroup = null;
        groupSub = 0;
      }
      if (it.group) groupSub += (it.total||0);
      rowNum++;
      tbody.appendChild(el('tr', { class: it.group ? 'in-group' : '' },
        el('td', { class:'row-num' }, rowNum),
        el('td', { class:'code' }, it.code),
        el('td', null, it.description),
        el('td', { class:'ctr' }, it.unit),
        wasteCell(it),
        el('td', { class:'num' }, fmtMoney(it.qty)),
        el('td', { class:'num' }, fmtMoney(it.unitPrice)),
        el('td', { class:'num' }, fmtMoney(it.total)),
        el('td', null, it.note || ''),
      ));
    });
    /* close trailing group if any */
    if (lastGroup) {
      tbody.appendChild(el('tr', { class:'group-subtot' },
        el('td', { colspan:7, class:'num', style:{textAlign:'right', paddingRight:'12px', fontStyle:'italic'} }, 'รวมหมวด '+(groupLabels[lastGroup]||lastGroup)),
        el('td', { class:'num', style:{fontStyle:'italic'} }, fmtMoney(groupSub)),
        el('td', null, ''),
      ));
    }
    tbody.appendChild(el('tr', { class:'subtot' },
      el('td', { colspan:7, class:'num', style:{textAlign:'right',paddingRight:'12px'} }, 'รวม '+d.l),
      el('td', { class:'num' }, fmtMoney(cat.subtotal)),
      el('td', null, ''),
    ));
  });
  tbody.appendChild(el('tr', { class:'grand' },
    el('td', { colspan:7, class:'num', style:{textAlign:'right',paddingRight:'14px'} }, 'รวมทั้งสิ้น (Grand Total)'),
    el('td', { class:'num' }, fmtMoneyBaht(boq.grandTotal)),
    el('td', null, ''),
  ));
  tbl.appendChild(tbody);
  wrap.appendChild(tbl);

  /* Footer note */
  wrap.appendChild(el('div', { style:{padding:'14px 22px', borderTop:'1px dashed var(--border)', fontSize:'11px', color:'var(--muted)', display:'flex', justifyContent:'space-between'} },
    el('span', null, 'หมายเหตุ: ราคาดังกล่าวยังไม่รวมภาษีมูลค่าเพิ่ม 7% และค่าดำเนินการ Factor F'),
    el('span', null, 'TCM ConstructAI QTO · '+new Date().toLocaleDateString('th-TH'))
  ));

  root.appendChild(wrap);
};

function emptyBOQ() {
  return el('div', { class:'boq-empty' },
    el('div', { class:'ic', html: ICN.takeoff }),
    el('h3', null, 'ยังไม่มีข้อมูล BOQ'),
    el('p', null, 'อัปโหลดแบบก่อสร้างที่แท็บ "Upload" แล้วกด "เริ่มถอดปริมาณ" เพื่อให้ AI วิเคราะห์'),
    el('div', { style:{ display:'flex', gap:'10px', justifyContent:'center' } },
      el('button', { class:'btn btn-primary', onclick: () => go('upload') },
        el('span', { html: ICN.upload }), 'ไปอัปโหลดแบบ'
      ),
      el('button', { class:'btn btn-ghost', onclick: () => loadMockBOQ() },
        el('span', { html: ICN.bolt }), 'โหลด Demo BOQ (อาคารสำนักงาน TCM)'
      ),
    ),
  );
}

function kpiCard(cls, lbl, val, sub) {
  return el('div', { class:'kpi '+(cls||'') },
    el('div', { class:'lbl' }, lbl),
    el('div', { class:'val' }, String(val), sub && el('span', { class:'unit' }, sub)),
  );
}
window.kpiCard = kpiCard;

/* ============================================================
   WASTE CELL — editable % โดยปรับ qty + total ตาม
   ============================================================ */
function wasteCell(it) {
  /* Markup rows: ไม่ใช้ waste */
  if (it.group === 'markups') {
    return el('td', { class:'ctr', style:{ color:'var(--muted)', fontSize:'12px' } }, '—');
  }
  if (it._baseQty == null) it._baseQty = it.qty;
  if (it.waste == null) it.waste = 0;
  return el('td', { class:'ctr waste-cell' },
    el('div', { class:'waste-wrap' },
      el('input', {
        type:'number',
        step:'0.5',
        min:'0',
        max:'200',
        value: it.waste,
        title:'เผื่อ Waste % — ปรับเปอร์เซ็นต์เพื่อแก้จำนวนอัตโนมัติ',
        onchange: (e) => applyWaste(it, e.target.value),
        oninput: (e) => {
          /* live preview without re-render */
          const w = parseFloat(e.target.value) || 0;
          const newQty = +(it._baseQty * (1 + w/100)).toFixed(2);
          const newTotal = +(newQty * it.unitPrice).toFixed(2);
          const row = e.target.closest('tr');
          if (row) {
            const cells = row.querySelectorAll('td');
            if (cells[5]) cells[5].textContent = fmtMoney(newQty);
            if (cells[7]) cells[7].textContent = fmtMoney(newTotal);
          }
        }
      }),
      el('span', { class:'pct' }, '%'),
    )
  );
}

function applyWaste(it, val) {
  const w = parseFloat(val) || 0;
  it.waste = w;
  it.qty = +(it._baseQty * (1 + w/100)).toFixed(2);
  it.total = +(it.qty * it.unitPrice).toFixed(2);
  /* Recalculate all subtotals + grand total */
  recalcBOQ();
  go('takeoff');
  toast('ปรับ Waste = '+w+'% แล้ว — '+it.code+' จำนวน '+fmtMoney(it.qty)+' '+it.unit, 'g', 2500);
}
window.applyWaste = applyWaste;

function recalcBOQ() {
  if (!S.boq) return;
  let grand = 0;
  S.boq.categories.forEach(c => {
    c.subtotal = c.items.reduce((s,i) => s + (Number(i.total)||0), 0);
    grand += c.subtotal;
  });
  S.boq.grandTotal = grand;
}
window.recalcBOQ = recalcBOQ;

function loadMockBOQ() {
  S.boq = JSON.parse(JSON.stringify(MOCK_BOQ));
  updBdg();
  go('takeoff');
  toast('โหลด Demo BOQ สำเร็จ — อาคารสำนักงาน TCM 5 ชั้น', 'g');
}
window.loadMockBOQ = loadMockBOQ;

async function runTakeoff() {
  if (!S.files.length) {
    toast('กรุณาอัปโหลดแบบก่อสร้างที่แท็บ Upload ก่อน', 'w');
    return;
  }
  if (!S.key) { toast('ไม่มี API Key', 'r'); return; }
  if (!S.disc.length) { toast('กรุณาเลือกหมวดงาน', 'w'); return; }

  ld(true, 'กำลังถอดปริมาณ...', 'AI กำลังอ่านแบบและสร้าง BOQ — ใช้เวลาประมาณ 30-90 วินาที');
  try {
    /* Convert files to base64 */
    const contents = [];
    for (const f of S.files) {
      const b64 = await fileToBase64(f.file);
      if (f.type === 'application/pdf') {
        contents.push({ type:'document', source:{ type:'base64', media_type:'application/pdf', data:b64 } });
      } else if (f.type.startsWith('image/')) {
        contents.push({ type:'image', source:{ type:'base64', media_type:f.type, data:b64 } });
      }
    }
    const userPrompt = `Analyze the attached construction drawing file(s).
Extract quantity takeoff for discipline keys: ${S.disc.join(',')}.

${buildSymbolContext()}

STRUCTURAL TAKEOFF RULES (สำคัญมาก สำหรับ discipline = structural):
แยกเป็น 4 sub-group โดยใส่ field "group" ในแต่ละ item:
  group="foundation" (งานฐานราก)
  group="column"     (งานเสา)
  group="beam"       (งานคาน)
  group="slab"       (งานพื้น)
ในแต่ละ sub-group ต้องมีรายการต่อไปนี้ครบ:
  1) คอนกรีต — unit "ลบ.ม."
  2) แบบหล่อคอนกรีต — unit "ตร.ม."
  3) เหล็กเสริม แยกตามเบอร์ที่ใช้จริง (SR24-RB6 / SR24-RB9 / SD40-DB10 / SD40-DB12 / SD40-DB20 / SD40-DB25 / SD40-DB32) — unit "กก."
  4) ลวดผูกเหล็ก — unit "กก."
  5) ตะปู — unit "กก."
สำคัญ: ถ้าเป็นพื้นชั้น 1, ฐานราก, หรืองานติดดิน → ต้องมี "คอนกรีตหยาบ (Lean Concrete) fc=140" หนาตามแบบ unit "ลบ.ม." เป็นรายการแรกของ group นั้น

ARCHITECTURAL TAKEOFF RULES (สำคัญมาก สำหรับ discipline = architectural):
แยกเป็น 6 sub-group โดยใส่ field "group":
  group="ceiling"      (งานฝ้าเพดาน — ตร.ม.)
  group="wall"         (งานผนัง — ตร.ม.)
  group="floor"        (งานพื้น — ตร.ม.; บัวพื้น — ม.)
  group="door-window"  (ประตู+หน้าต่าง — ชุด)
  group="roof"         (หลังคาแผ่นเหล็ก ตร.ม., ครอบสัน/ครอบข้าง/เชิงชาย ม., สกรู ตัว)
  group="misc"         (จมูกบันได/ราว ม., ตัวอักษรสแตนเลส ชุด)
หลักการ:
- ก่ออิฐมอญครึ่งแผ่น 1 ตร.ม. = 70 ก้อน เผื่อ 3%
- กระเบื้องเผื่อ 5%, สีทา 2 รอบ
- ฉาบปูน 15mm = 0.015 ลบ.ม./ตร.ม.
- ใส่ markup: ค่าแรง 30% ของวัสดุ (group="markups")

MECHANICAL / HVAC TAKEOFF RULES (สำคัญมาก สำหรับ discipline = mechanical):
แยกเป็น 5 sub-group:
  group="ac-equip"    (VRF Outdoor/Indoor, FCU, AHU — ชุด)
  group="ductwork"    (ท่อลม Galvanized + ฉนวน Fiberglass — ตร.ม.; Flexible Duct — ม.)
  group="diffuser"    (4-SCD, RD, RG — ตัว; Damper VD/FD/MD — ตัว)
  group="refrigerant" (ท่อทองแดง Ø¼"-1⅛" — ม.)
  group="exhaust"     (พัดลม Propeller/Ceiling — ชุด)
- ใส่ markup: ค่าแรง 30% + T&B 5% (group="markups")

ELECTRICAL TAKEOFF RULES (สำคัญมาก สำหรับ discipline = electrical):
แยกเป็น 8 sub-group:
  group="wiring"          (THW/NYY แยกขนาด — ม.; Conduit PVC/EMT/IMC — ม.; Wireway — ม.)
  group="lighting"        (LED Panel/Downlight/Tube/Floodlight — ดวง)
  group="outlet-switch"   (Outlet Duplex/Single + Switch 1-way/2-way — ตัว)
  group="mdb"             (ตู้ MDB/DB — ใบ; Breaker MCCB/MCB — ตัว)
  group="fire-alarm"      (FCP — ตู้; Smoke/Heat/Manual/Bell — จุด)
  group="communication"   (CCTV — กล้อง; NVR — เครื่อง; Data/Tel Outlet — จุด)
  group="lightning"       (ESE — ชุด; สายตัวนำลง — ม.; หลักดิน — หลัก)
  group="generator"       (Generator/ATS/ถังน้ำมัน — ชุด)
- ใส่ markup: ค่าแรง 30% + ค่าทดสอบ 5% (group="markups")

PLUMBING TAKEOFF RULES (สำคัญมาก สำหรับ discipline = plumbing — ตามมาตรฐานกรมบัญชีกลาง 2550):
แยกเป็น 9 sub-group โดยใส่ field "group":
  group="pipe-cw"  (ท่อน้ำใช้ Cold Water — PVC ชั้นคุณภาพ 13.5)
  group="pipe-w"   (ท่อน้ำทิ้ง Waste — PVC ชั้นคุณภาพ 8.5)
  group="pipe-s"   (ท่อโสโครก Soil — PVC ชั้นคุณภาพ 8.5)
  group="pipe-v"   (ท่อระบายอากาศ Vent — PVC ชั้นคุณภาพ 8.5)
  group="pipe-rw"  (ท่อระบายน้ำฝน Rain Water)
  group="fittings" (ข้อต่อ-ข้องอ)
  group="fixtures" (สุขภัณฑ์)
  group="system"   (อุปกรณ์ระบบ)
  group="markups"  (ค่าใช้จ่ายเพิ่มเติม %)
หลักการ:
- ท่อ: นับเป็น "ม." แยกตามขนาด Ø + ชั้นคุณภาพ (8.5 / 13.5)
  ขนาดท่อน้ำใช้: ½", ¾", 1", 1½"
  ขนาดท่อน้ำทิ้ง: 2", 3"
  ขนาดท่อโสโครก: 4"
  ขนาดท่อระบายอากาศ: 2", 3"
- ข้อต่อ/ข้องอ: นับเป็น "อัน" แยกชนิด (90°, 45°, สามทาง, ตัววาย, ตรง, อ่อน, เกลียว) + ขนาด + ชั้นคุณภาพ
- สุขภัณฑ์: นับเป็น "ชุด" (WC, UR, LV, ก๊อก, ฝักบัว, FD, FCO, ที่ใส่กระดาษ, กระจกเงา, partition)
- อุปกรณ์ระบบ: นับเป็น "ชุด" (ประตูน้ำ, มาตรวัดน้ำ, ปั๊ม, ถังเก็บน้ำ, ถังบำบัด, บ่อดักไขมัน, บ่อพักน้ำ)
- เผื่อความยาวท่อตามตารางกรมบัญชีกลาง 2550 (เผื่อเข้า WC = 1.00 ม., เข้าฝักบัว = 1.50-2.00 ม., เข้าอ่างล้างหน้า = 0.70-1.00 ม. ฯลฯ)
- markups (เพิ่ม 3 รายการสุดท้ายของหมวด):
  • "ค่าแรงงานเดินท่อ" = 30% ของค่าวัสดุ (ท่อ+ข้อต่อ) — unit "งวด" qty 1
  • "อุปกรณ์ยึดท่อ" = 10% ของ (วัสดุ + แรงงาน) — unit "งวด" qty 1
  • "ค่าทดสอบท่อ" = 5% ของ (วัสดุ + แรงงาน) — unit "งวด" qty 1

IMPORTANT TO AVOID TRUNCATION:
- Keep description under 60 chars each
- Keep note under 40 chars each
- Include max 8 items per discipline
- Use short Thai/English descriptions

REQUIRED SCHEMA:
{
  "projectName": "...",
  "totalArea": 0,
  "scale": "1:100",
  "client": "...",
  "date": "YYYY-MM-DD",
  "categories": [
    {
      "discipline": "architectural",
      "items": [
        { "code":"A-001", "description":"...", "unit":"ตร.ม.", "qty":0, "unitPrice":0, "total":0, "note":"", "group":"foundation|column|beam|slab|null" }
      ]
    }
  ],
  "grandTotal": 0,
  "legalFlags": ["..."],
  "readingNotes": "..."
}`;
    contents.push({ type:'text', text: userPrompt });

    const res = await ai(PROMPT.SYS_TAKEOFF, contents, 8000);
    const parsed = pJSON(res.text);
    if (!parsed) throw new Error('AI returned invalid JSON');

    /* normalize */
    (parsed.categories || []).forEach(c => {
      c.discipline = normDisc(c.discipline);
      c.subtotal = (c.items||[]).reduce((s,i)=>s+(Number(i.total)||0), 0);
    });
    parsed.grandTotal = parsed.grandTotal || parsed.categories.reduce((s,c)=>s+c.subtotal, 0);

    S.boq = parsed;
    S.flags = parsed.legalFlags || [];
    updBdg();
    go('takeoff');
    toast('ถอดปริมาณสำเร็จ — '+parsed.categories.reduce((a,c)=>a+c.items.length,0)+' รายการ', 'g');
  } catch (e) {
    console.error(e);
    toast('Error: '+e.message, 'r', 5000);
  } finally {
    ld(false);
  }
}
window.runTakeoff = runTakeoff;

/* ---- Build symbol context for AI prompt ---- */
function buildSymbolContext() {
  if (!S.symbols) return '';
  const lines = ['SYMBOL LEGEND (user-confirmed reference for this project):'];
  Object.keys(S.symbols).forEach(disc => {
    const arr = S.symbols[disc] || [];
    if (!arr.length) return;
    lines.push(`[${disc}]`);
    arr.forEach(s => {
      lines.push(`  ${s.abbr} = ${s.en} / ${s.th}${s.edited?' (USER CONFIRMED)':''}`);
    });
  });
  lines.push('Use these abbreviations and descriptions consistently in the BOQ output.');
  return lines.join('\n');
}
window.buildSymbolContext = buildSymbolContext;

/* ============================================================
   TAB: COMPARE
   ============================================================ */
window.RENDER.compare = function(root) {
  root.appendChild(el('div', { class:'page-head' },
    el('div', null,
      el('h2', null,
        el('span', { class:'pg-icon', html: ICN.compare }),
        'เปรียบเทียบ BOQ'
      ),
      el('div', { class:'crumbs' }, 'BOQ vs BOQ · ตรวจส่วนต่าง %, รายการเพิ่ม/ลด, ความเสี่ยง')
    ),
    el('div', { class:'acts' })
  ));

  if (!S.cmp.res) {
    root.appendChild(renderCompareSetup());
    return;
  }
  root.appendChild(renderCompareResult());
};

function renderCompareSetup() {
  const wrap = el('div');
  const card = el('div', { class:'card' },
    el('div', { class:'card-head' }, el('h3', null, el('span', { html: ICN.swap }), 'อัปโหลด BOQ 2 ฉบับเพื่อเปรียบเทียบ')),
    el('div', { class:'card-body' },
      cmpSlots2(),
      el('div', { style:{display:'flex', gap:'10px', justifyContent:'space-between', marginTop:'18px', alignItems:'center'} },
        el('div', { style:{color:'var(--muted)', fontSize:'12px'} }, 'รองรับ PDF/Image · ใช้ Claude vision วิเคราะห์'),
        el('div', { style:{display:'flex', gap:'8px'} },
          el('button', { class:'btn btn-ghost', onclick: () => loadMockCompare() }, el('span', { html: ICN.bolt }), 'โหลด Demo'),
          el('button', { class:'btn btn-accent', onclick: () => runCompare() }, el('span', { html: ICN.play }), 'เริ่มวิเคราะห์'),
        ),
      ),
    )
  );
  wrap.appendChild(card);
  return wrap;
}

function cmpSlot(key, label, accept) {
  const f = S.cmp[key];
  return el('div', { class:'card', style:{ background:'var(--elev)' } },
    el('div', { class:'card-body' },
      el('div', { style:{display:'flex', alignItems:'center', gap:'12px'} },
        el('div', { style:{width:'48px', height:'48px', borderRadius:'10px', background: f ? 'var(--steel)' : 'var(--border-2)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}, html: f ? ICN.file : ICN.upload }),
        el('div', { style:{flex:1, minWidth:0} },
          el('b', { style:{fontSize:'13px', display:'block'} }, label),
          el('small', { style:{color:'var(--muted)', fontFamily:'var(--f-mono)', fontSize:'11px'} }, f ? f.name+' · '+fmtFileSize(f.size) : 'ยังไม่ได้เลือกไฟล์'),
        ),
        el('label', { class:'btn btn-ghost btn-sm' },
          f ? 'เปลี่ยน' : 'เลือกไฟล์',
          el('input', { type:'file', accept: accept || '.pdf,image/*', style:{display:'none'}, onchange: (e) => {
            const file = e.target.files[0]; if (!file) return;
            S.cmp[key] = { name:file.name, size:file.size, type:file.type, file };
            go('compare');
          }})
        ),
      ),
    )
  );
}

function cmpSlots2() {
  return el('div', { class:'grid-2' },
    cmpSlot('f1', 'BOQ ฉบับที่ 1 (เช่น ผู้รับเหมา A)'),
    cmpSlot('f2', 'BOQ ฉบับที่ 2 (เช่น ผู้รับเหมา B)'),
  );
}

function loadMockCompare() {
  /* Build mock comparison result */
  const a = MOCK_BOQ, b = MOCK_BOQ_2;
  const items = [];
  const allCodes = new Set();
  const mapA = {}, mapB = {};
  a.categories.forEach(c => c.items.forEach(i => { mapA[i.code] = { ...i, category:c.discipline }; allCodes.add(i.code); }));
  b.categories.forEach(c => c.items.forEach(i => { mapB[i.code] = { ...i, category:c.discipline }; allCodes.add(i.code); }));
  const onlyInA = [], onlyInB = [];
  /* group by category */
  DISC_ORDER.forEach(disc => {
    const codes = [...allCodes].filter(c => (mapA[c]?.category||mapB[c]?.category) === disc);
    if (!codes.length) return;
    items.push({ category: DISC[disc].l, isHeader: true });
    codes.forEach(code => {
      const ai = mapA[code], bi = mapB[code];
      if (ai && !bi) {
        onlyInA.push(code+' — '+ai.description);
        items.push({ category: disc, code, description:ai.description, boq1Value:ai.total, boq2Value:0, diff:-ai.total, diffPercent:-100, remark:'มีเฉพาะใน BOQ ฉบับที่ 1', status:'rem' });
      } else if (!ai && bi) {
        onlyInB.push(code+' — '+bi.description);
        items.push({ category: disc, code, description:bi.description, boq1Value:0, boq2Value:bi.total, diff:bi.total, diffPercent:100, remark:'มีเฉพาะใน BOQ ฉบับที่ 2', status:'add' });
      } else {
        const d = bi.total - ai.total;
        items.push({ category: disc, code, description:ai.description, boq1Value:ai.total, boq2Value:bi.total, diff:d, diffPercent: ai.total ? (d/ai.total*100) : 0, remark: Math.abs(d)<1 ? '' : 'ราคาต่างกัน', status:'chg' });
      }
    });
  });
  S.cmp.res = {
    mode:'bb',
    boq1Name: a.projectName,
    boq2Name: b.projectName,
    boq1Total: a.grandTotal,
    boq2Total: b.grandTotal,
    difference: b.grandTotal - a.grandTotal,
    differencePercent: ((b.grandTotal - a.grandTotal) / a.grandTotal) * 100,
    winner: b.grandTotal < a.grandTotal ? 'boq2' : 'boq1',
    winnerReason: b.grandTotal < a.grandTotal ? 'BOQ #2 ราคาต่ำกว่า ประหยัดงบประมาณ' : 'BOQ #1 ราคาต่ำกว่า แต่ตรวจรายการเพิ่ม/ลดประกอบ',
    summary: 'BOQ ฉบับที่ 2 มีรายการเพิ่ม Smart Building Automation (BAS) มูลค่า 850,000 บาท แต่ขาดรายการฝ้า Aluminium Cell Ceiling',
    items,
    onlyInBoq1: onlyInA,
    onlyInBoq2: onlyInB,
    risks: [
      'BOQ ฉบับที่ 2 ขาดฝ้า Aluminium Cell Ceiling — ตรวจสอบว่าเป็นการ Value Engineering หรือลืม',
      'รายการ Smart BAS ใน BOQ #2 เป็นงานเพิ่มเติม — ต้องยืนยันขอบเขตงานกับเจ้าของโครงการ',
      'ราคาเหล็กเสริม SD40 ต่างกันมากกว่า 10% — ตรวจมาตรฐานวัสดุ',
    ],
    recommendation: 'แนะนำให้เลือก BOQ ฉบับที่ 1 หากเจ้าของโครงการต้องการความครบถ้วนของงานสถาปัตยกรรม แต่ถ้าต้องการระบบอัตโนมัติเพิ่มเติม BOQ #2 มีความน่าสนใจ',
  };
  toast('โหลด Demo Compare สำเร็จ', 'g');
  go('compare');
}
window.loadMockCompare = loadMockCompare;


function renderCompareResult() {
  const r = S.cmp.res;
  const wrap = el('div');

  /* Summary Card */
  const winner1 = r.winner === 'boq1';
  const winner2 = r.winner === 'boq2';
  const sum = el('div', { class:'cmp-summary' },
    el('div', { class:'side '+(winner1 ? 'win':'') },
      el('div', { class:'nm' }, 'BOQ #1'),
      el('div', { class:'val' }, fmtMoney(r.boq1Total)),
      el('div', { style:{fontSize:'11px', color:'rgba(255,255,255,.6)', marginTop:'4px'} }, r.boq1Name),
    ),
    el('div', { class:'vs' }, 'VS'),
    el('div', { class:'diff-box' },
      el('div', { class:'lbl' }, 'ส่วนต่าง'),
      el('div', { class:'v', style:{ color: r.difference<0 ? 'var(--green-3)' : '#FF9F7F' } }, (r.difference>0?'+':'')+fmtMoneyBaht(r.difference)),
      el('div', { class:'p' }, fmtPct(r.differencePercent, true)),
    ),
    el('div', { class:'vs' }, 'VS'),
    el('div', { class:'side '+(winner2 ? 'win':'') },
      el('div', { class:'nm' }, 'BOQ #2'),
      el('div', { class:'val' }, fmtMoney(r.boq2Total)),
      el('div', { style:{fontSize:'11px', color:'rgba(255,255,255,.6)', marginTop:'4px'} }, r.boq2Name),
    ),
  );
  wrap.appendChild(sum);

  /* Action bar */
  wrap.appendChild(el('div', { style:{display:'flex', justifyContent:'space-between', alignItems:'center', margin:'8px 0 14px'} },
    el('div', { style:{fontSize:'13px', color:'var(--muted)'} },
      el('b', { style:{color:'var(--ink)'} }, 'สรุป: '),
      r.summary
    ),
    el('div', { style:{display:'flex', gap:'8px'} },
      el('button', { class:'btn btn-ghost btn-sm', onclick: () => { S.cmp.res = null; S.cmp.f1=null; S.cmp.f2=null; go('compare'); } },
        el('span', { html: ICN.refresh }), 'เริ่มใหม่'
      ),
      el('button', { class:'btn btn-ghost btn-sm', onclick: () => window.print() }, el('span', { html: ICN.print }), 'พิมพ์'),
    ),
  ));

  /* Chart */
  wrap.appendChild(renderCompareChart(r));

  /* Compare Table */
  wrap.appendChild(renderCompareTable(r));

  /* Risks + Recommendation */
  wrap.appendChild(el('div', { class:'grid-2', style:{marginTop:'16px'} },
    el('div', { class:'card' },
      el('div', { class:'card-head' }, el('h3', null, el('span', { html: ICN.warn }), 'ความเสี่ยง & ข้อสังเกต')),
      el('div', { class:'card-body' },
        el('ul', { style:{margin:0, paddingLeft:'18px', fontSize:'13px', lineHeight:'1.7', color:'var(--ink-2)'} },
          ...(r.risks||[]).map(rk => el('li', null, rk))
        )
      )
    ),
    el('div', { class:'card' },
      el('div', { class:'card-head' }, el('h3', null, el('span', { html: ICN.check }), 'คำแนะนำ')),
      el('div', { class:'card-body' },
        el('p', { style:{margin:0, fontSize:'13px', lineHeight:'1.7', color:'var(--ink-2)'} }, r.recommendation)
      )
    )
  ));

  return wrap;
}

function renderCompareChart(r) {
  /* Build per-category totals */
  const cats = {};
  (r.items||[]).forEach(i => {
    if (i.isHeader) return;
    const k = DISC[i.category]?.l || i.category;
    if (!cats[k]) cats[k] = { a:0, b:0 };
    cats[k].a += i.boq1Value || 0;
    cats[k].b += i.boq2Value || 0;
  });
  const entries = Object.entries(cats);
  const maxV = Math.max(...entries.map(([,v]) => Math.max(v.a, v.b)), 1);

  const card = el('div', { class:'card' },
    el('div', { class:'card-head' }, el('h3', null, el('span', { html: ICN.takeoff }), 'เปรียบเทียบราคาแต่ละหมวด (Bar Chart)')),
    el('div', { class:'card-body' },
      el('div', { class:'chart' },
        ...entries.map(([k,v]) => el('div', { class:'bar-row' },
          el('div', { class:'nm' }, k),
          el('div', { class:'bars' },
            el('div', { class:'bar', style:{ width: (v.a/maxV*100)+'%' } }, el('span', { class:'lbl' }, fmtMoney(v.a))),
            el('div', { class:'bar b2', style:{ width: (v.b/maxV*100)+'%' } }, el('span', { class:'lbl' }, fmtMoney(v.b))),
          ),
          el('div', { style:{textAlign:'right', fontFamily:'var(--f-mono)', fontSize:'11px', color: v.b>v.a ? 'var(--err)' : 'var(--ok)'} },
            (v.b-v.a>=0?'+':'')+fmtMoney(v.b-v.a)
          ),
        )),
        el('div', { class:'legend' },
          el('span', null, el('i', null), 'BOQ #1'),
          el('span', null, el('i', { class:'g' }), 'BOQ #2'),
        )
      )
    )
  );
  return card;
}

function renderCompareTable(r) {
  const card = el('div', { class:'card', style:{marginTop:'16px'} },
    el('div', { class:'card-head' },
      el('h3', null, el('span', { html: ICN.takeoff }), 'ตารางเปรียบเทียบรายการ ('+(r.items.filter(i=>!i.isHeader).length)+' รายการ)'),
      el('div', { class:'acts' },
        el('span', { style:{fontSize:'11px', color:'var(--muted)'} },
          el('span', { class:'pill add', style:{marginRight:'6px'} }, '+ เพิ่ม'),
          el('span', { class:'pill rem', style:{marginRight:'6px'} }, '− ลด'),
          el('span', { class:'pill eq' }, '= เท่า'),
        )
      )
    ),
    el('div', { class:'card-body tight' },
      (() => {
        const t = el('table', { class:'cmp-table' });
        t.appendChild(el('thead', null,
          el('tr', null,
            el('th', { style:{width:'80px'} }, 'รหัส'),
            el('th', null, 'รายการ'),
            el('th', { class:'num', style:{width:'140px'} }, 'BOQ #1 (บาท)'),
            el('th', { class:'num', style:{width:'140px'} }, 'BOQ #2 (บาท)'),
            el('th', { class:'num', style:{width:'120px'} }, 'ส่วนต่าง'),
            el('th', { class:'num', style:{width:'80px'} }, '%'),
            el('th', null, 'หมายเหตุ'),
          )
        ));
        const tb = el('tbody');
        r.items.forEach(it => {
          if (it.isHeader) {
            tb.appendChild(el('tr', { class:'cat' }, el('td', { colspan:7 }, '◆ '+it.category)));
            return;
          }
          const rowCls  = it.status === 'add' ? 'add' : it.status === 'rem' ? 'rem' : '';
          const pillCls = it.status === 'add' ? 'add' : it.status === 'rem' ? 'rem' : (it.diff > 0 ? 'up' : it.diff < 0 ? 'dn' : 'eq');
          const pillSign = it.status === 'add' ? '+ ใหม่' : it.status === 'rem' ? '− หาย' : fmtPct(it.diffPercent, true);
          const diffColor = it.diff > 0 ? 'var(--err)' : it.diff < 0 ? 'var(--ok)' : 'var(--muted)';
          tb.appendChild(el('tr', { class: rowCls },
            el('td', { class:'code', style:{fontFamily:'var(--f-mono)', fontWeight:'600'} }, it.code),
            el('td', null, it.description),
            el('td', { class:'num' }, fmtMoney(it.boq1Value)),
            el('td', { class:'num' }, fmtMoney(it.boq2Value)),
            el('td', { class:'num', style:{color:diffColor, fontWeight:600} }, (it.diff > 0 ? '+' : '') + fmtMoney(it.diff)),
            el('td', { class:'num' }, el('span', { class:'pill '+pillCls }, pillSign)),
            el('td', { style:{color:'var(--muted)', fontSize:'11px'} }, it.remark || ''),
          ));
        });
        t.appendChild(tb);
        return t;
      })()
    )
  );
  return card;
}

async function runCompare() {
  if (!S.cmp.f1 || !S.cmp.f2) { toast('กรุณาเลือกไฟล์ BOQ ทั้ง 2 ฉบับ', 'w'); return; }
  if (!S.key) { toast('ไม่มี API Key', 'r'); return; }

  ld(true, 'กำลังเปรียบเทียบ BOQ...', 'AI กำลังวิเคราะห์ส่วนต่าง — 30-60 วินาที');
  try {
    const a = S.cmp.f1;
    const b = S.cmp.f2;
    const b64A = await fileToBase64(a.file);
    const b64B = await fileToBase64(b.file);
    const mk = (f, b64) => f.type === 'application/pdf'
      ? { type:'document', source:{ type:'base64', media_type:'application/pdf', data:b64 } }
      : { type:'image', source:{ type:'base64', media_type:f.type, data:b64 } };
    const contents = [ mk(a, b64A), mk(b, b64B) ];
    const userPrompt = `Compare the 2 BOQ documents. Use Thai baht prices. Output ONLY raw JSON starting with {:
{"mode":"bb","boq1Name":"...","boq2Name":"...","boq1Total":0,"boq2Total":0,"difference":0,"differencePercent":0.0,"winner":"boq1","winnerReason":"...","summary":"...","items":[{"category":"...","description":"...","boq1Value":0,"boq2Value":0,"diff":0,"diffPercent":0.0,"remark":"..."}],"onlyInBoq1":["..."],"onlyInBoq2":["..."],"risks":["..."],"recommendation":"..."}`;
    contents.push({ type:'text', text:userPrompt });

    const res = await ai(PROMPT.SYS_COMPARE, contents, 6000);
    const parsed = pJSON(res.text);
    if (!parsed) throw new Error('AI returned invalid JSON');
    S.cmp.res = parsed;
    go('compare');
    toast('เปรียบเทียบสำเร็จ', 'g');
  } catch (e) {
    console.error(e);
    toast('Error: '+e.message, 'r', 5000);
  } finally {
    ld(false);
  }
}
window.runCompare = runCompare;

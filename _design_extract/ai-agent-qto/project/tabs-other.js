/* ===========================================================
   TCM ConstructAI QTO Agent — TABS: OTHER
   Upload · Verify · Measure · Legal · QA · Export
   =========================================================== */

window.RENDER = window.RENDER || {};

/* ============================================================
   TAB: UPLOAD
   ============================================================ */
window.RENDER.upload = function(root) {
  root.appendChild(el('div', { class:'page-head' },
    el('div', null,
      el('h2', null, el('span', { class:'pg-icon', html: ICN.upload }), 'อัปโหลดแบบก่อสร้าง'),
      el('div', { class:'crumbs' }, 'ลากไฟล์ PDF หรือ Image · เลือกหมวดงานที่ต้องการให้ AI ถอดปริมาณ')
    ),
    el('div', { class:'acts' },
      el('button', { class:'btn btn-ghost', onclick: () => { S.files = []; updBdg(); go('upload'); } }, el('span', { html: ICN.trash }), 'ล้างทั้งหมด'),
      el('button', { class:'btn btn-accent', onclick: () => go('takeoff') }, el('span', { html: ICN.play }), 'ไปถอดปริมาณ'),
    )
  ));

  /* Dropzone */
  const dz = el('div', { class:'dropzone',
    onclick: () => $('file-in').click(),
    ondragover: (e) => { e.preventDefault(); dz.classList.add('over'); },
    ondragleave: () => dz.classList.remove('over'),
    ondrop: (e) => { e.preventDefault(); dz.classList.remove('over'); addF(e.dataTransfer.files); }
  },
    el('div', { class:'icon', html: ICN.upload }),
    el('h3', null, 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก'),
    el('p', null, 'รองรับไฟล์ PDF, JPG, PNG · หลายไฟล์ได้ในครั้งเดียว'),
    el('div', { class:'hint' }, 'PDF • JPG • PNG • สูงสุด 150 MB ต่อไฟล์'),
    el('input', { id:'file-in', type:'file', multiple:true, accept:'.pdf,image/*', style:{display:'none'},
      onchange: (e) => addF(e.target.files)
    }),
  );
  root.appendChild(dz);

  /* File List */
  root.appendChild(el('h3', { style:{fontSize:'14px', margin:'24px 0 10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em'} }, 'ไฟล์ที่อัปโหลด ('+S.files.length+')'));
  const fl = el('div', { class:'file-list' });
  if (!S.files.length) {
    fl.appendChild(el('div', { class:'empty', style:{padding:'24px', background:'var(--surface)', border:'1px dashed var(--border)', borderRadius:'8px'} },
      el('p', null, 'ยังไม่มีไฟล์ — เริ่มจากการลากไฟล์มาวางในกล่องด้านบน'),
      el('button', { class:'btn btn-ghost btn-sm', onclick: () => loadDemoFiles() }, el('span', { html: ICN.bolt }), 'หรือ ใส่ไฟล์ Demo')
    ));
  } else {
    S.files.forEach(f => fl.appendChild(renderFileItem(f)));
  }
  root.appendChild(fl);

  /* Discipline Selector */
  root.appendChild(el('h3', { style:{fontSize:'14px', margin:'28px 0 10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em'} }, 'หมวดงานที่จะให้ AI ถอดปริมาณ ('+S.disc.length+'/8)'));
  const dg = el('div', { class:'disc-grid' });
  DISC_ORDER.forEach(k => {
    const d = DISC[k];
    const on = S.disc.includes(k);
    dg.appendChild(el('div', { class:'disc-chip '+(on?'on':''), onclick: () => toggleD(k) },
      el('div', { class:'ic', style:{ background: on ? d.c : '' } }, d.i),
      el('div', { class:'lbl' }, d.l, el('small', null, d.s)),
      el('div', { class:'ck' }),
    ));
  });
  root.appendChild(dg);
};

function addF(files) {
  for (const f of files) {
    if (f.size > 150*1024*1024) { toast('ไฟล์ '+f.name+' ใหญ่เกิน 150MB', 'w'); continue; }
    S.files.push({
      id: 'f'+Date.now()+Math.random().toString(36).slice(2,6),
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      file: f,
      disc: guessDisc(f.name),
    });
  }
  updBdg();
  go('upload');
  toast('เพิ่มไฟล์ '+files.length+' ไฟล์', 'g');
}
window.addF = addF;

function guessDisc(name) {
  const n = name.toLowerCase();
  if (/^(a|arch|สถาป)/i.test(n)) return 'architectural';
  if (/^(s|str|โครง)/i.test(n)) return 'structural';
  if (/^(m|mech|hvac)/i.test(n)) return 'mechanical';
  if (/^(e|elec|ระบบไฟ)/i.test(n)) return 'electrical';
  if (/^(p|plumb|san)/i.test(n)) return 'plumbing';
  if (/^(f|fire)/i.test(n)) return 'fire';
  if (/^(c|civil|landscape)/i.test(n)) return 'civil';
  if (/^(i|int|interior)/i.test(n)) return 'interior';
  return 'architectural';
}

function toggleD(k) {
  const i = S.disc.indexOf(k);
  if (i >= 0) S.disc.splice(i, 1);
  else S.disc.push(k);
  updBdg();
  go('upload');
}
window.toggleD = toggleD;

function renderFileItem(f) {
  const isPdf = f.type === 'application/pdf';
  const isImg = f.type.startsWith('image/');
  const fic = isPdf ? 'pdf' : isImg ? 'img' : '';
  const ic  = isPdf ? ICN.pdf : isImg ? ICN.img : ICN.file;
  return el('div', { class:'file-item' },
    el('div', { class:'fic '+fic, html: ic }),
    el('div', { class:'meta' },
      el('b', null, f.name),
      el('small', null, fmtFileSize(f.size)+' · '+f.type),
    ),
    (() => {
      const s = el('select', { onchange: (e) => { f.disc = e.target.value; } });
      DISC_ORDER.forEach(k => {
        const o = el('option', { value: k }, DISC[k].l);
        if (f.disc === k) o.setAttribute('selected', 'true');
        s.appendChild(o);
      });
      return s;
    })(),
    el('button', { class:'rmv', onclick: () => { S.files = S.files.filter(x => x.id !== f.id); updBdg(); go('upload'); }, html: ICN.trash }),
  );
}

function loadDemoFiles() {
  /* fake file entries so user can see flow without real files */
  S.files = [
    { id:'d1', name:'TCM_Architectural_A-01_to_A-12.pdf', size:4_512_300, type:'application/pdf', file:null, disc:'architectural', demo:true },
    { id:'d2', name:'TCM_Structural_S-01_to_S-08.pdf',    size:3_124_800, type:'application/pdf', file:null, disc:'structural',    demo:true },
    { id:'d3', name:'TCM_MEP_M-01_E-01_P-01.pdf',         size:5_843_200, type:'application/pdf', file:null, disc:'mechanical',    demo:true },
    { id:'d4', name:'TCM_FloorPlan_Lvl5.jpg',             size:1_205_600, type:'image/jpeg',      file:null, disc:'architectural', demo:true },
  ];
  updBdg();
  go('upload');
  toast('โหลด Demo Files สำเร็จ', 'g');
}
window.loadDemoFiles = loadDemoFiles;

/* ============================================================
   TAB: VERIFY — ตรวจครบถ้วน + Symbol Recognition
   ============================================================ */
let SYM_TAB = 'architectural';

window.RENDER.verify = function(root) {
  root.appendChild(el('div', { class:'page-head' },
    el('div', null,
      el('h2', null, el('span', { class:'pg-icon', html: ICN.verify }), 'ตรวจสอบแบบ & สัญลักษณ์'),
      el('div', { class:'crumbs' }, 'AI ตรวจหาสัญลักษณ์ในแบบ → ผู้ใช้ยืนยัน/แก้ไข → AI เรียนรู้เพื่อใช้ครั้งต่อไป')
    ),
    el('div', { class:'acts' },
      el('button', { class:'btn btn-ghost', onclick: () => loadMockVerify() }, el('span', { html: ICN.bolt }), 'โหลด Demo'),
      el('button', { class:'btn btn-accent', onclick: () => runVerify() }, el('span', { html: ICN.play }), 'สแกนสัญลักษณ์ในแบบ'),
    )
  ));

  /* Empty state */
  if (!S.verify && !S.symbols) {
    root.appendChild(el('div', { class:'empty', style:{padding:'60px 24px', background:'var(--surface)', border:'1px dashed var(--border)', borderRadius:'12px', textAlign:'center'} },
      el('div', { style:{fontSize:'56px', marginBottom:'12px', color:'var(--steel)', display:'flex', justifyContent:'center'}, html: ICN.verify }),
      el('h3', { style:{margin:'0 0 6px', fontSize:'17px'} }, 'ยังไม่มีผลการตรวจสอบ'),
      el('p', { style:{margin:'0 0 16px', color:'var(--muted)'} }, 'อัปโหลดแบบก่อสร้างที่แท็บ Upload แล้วกด "สแกนสัญลักษณ์ในแบบ" เพื่อให้ AI หา Symbol Legend และเรียนรู้สัญลักษณ์ที่ใช้ในโครงการ'),
      el('div', { style:{display:'flex', gap:'10px', justifyContent:'center'} },
        el('button', { class:'btn btn-primary', onclick: () => go('upload') }, el('span', { html: ICN.upload }), 'ไปอัปโหลดแบบ'),
        el('button', { class:'btn btn-ghost', onclick: () => { loadMockVerify(); loadMockSymbols(); } }, el('span', { html: ICN.bolt }), 'โหลด Demo ทั้งหมด'),
      ),
    ));
    return;
  }

  /* ---------- 1. Verification Score Card ---------- */
  if (S.verify) {
    const v = S.verify;
    root.appendChild(el('div', { class:'grid-4', style:{marginBottom:'18px'} },
      el('div', { class:'kpi navy' },
        el('div', { class:'lbl' }, 'คะแนนรวม'),
        el('div', { class:'val' }, v.overallScore, el('span', { class:'unit' }, '/100')),
        el('div', { class:'delta '+(v.overallScore>=80?'up':'dn') }, v.overallScore>=80 ? 'พร้อมประมาณราคา' : 'ควรขอแบบเพิ่ม')
      ),
      el('div', { class:'kpi green' },
        el('div', { class:'lbl' }, 'ครบถ้วน'),
        el('div', { class:'val' }, v.checks.filter(c=>c.s==='ok').length),
        el('div', { style:{fontSize:'11px', color:'var(--muted)'} }, 'จาก '+v.checks.length+' รายการ'),
      ),
      el('div', { class:'kpi warn' },
        el('div', { class:'lbl' }, 'ควรตรวจเพิ่ม'),
        el('div', { class:'val' }, v.checks.filter(c=>c.s!=='ok').length),
      ),
      el('div', { class:'kpi' },
        el('div', { class:'lbl' }, 'สัญลักษณ์ที่เรียนรู้'),
        el('div', { class:'val' }, (() => {
          if (!S.symbols) return 0;
          return Object.values(S.symbols).reduce((a,arr)=>a+arr.length, 0);
        })()),
        el('div', { style:{fontSize:'11px', color:'var(--muted)'} }, Object.keys(loadSymbolOverrides()).length+' แก้ไขโดยผู้ใช้'),
      ),
    ));
  }

  /* ---------- 2. Symbol Recognition Panel — หลัก ---------- */
  if (S.symbols) {
    root.appendChild(renderSymbolPanel());
  }

  /* ---------- 3. Checklist (พับลง) ---------- */
  if (S.verify) {
    root.appendChild(el('div', { class:'card', style:{marginTop:'16px'} },
      el('div', { class:'card-head' }, el('h3', null, el('span', { html: ICN.verify }), 'รายการตรวจสอบความครบถ้วน (Checklist)')),
      el('div', { class:'card-body' },
        el('div', { class:'check-list' },
          ...S.verify.checks.map(c => el('div', { class:'check-item '+c.s },
            el('div', { class:'ic', html: c.s==='ok'?ICN.check:c.s==='warn'?ICN.warn:ICN.err }),
            el('b', null, c.t),
            el('small', null, c.d),
          )),
        )
      )
    ));
  }
};

/* ---------- Symbol Recognition Panel ---------- */
function renderSymbolPanel() {
  const overrides = loadSymbolOverrides();
  const card = el('div', { class:'card sym-panel' },
    el('div', { class:'card-head', style:{display:'flex', justifyContent:'space-between'} },
      el('h3', null, el('span', { html: ICN.bolt }), 'การรับรู้สัญลักษณ์ของ AI (Symbol Recognition)'),
      el('div', { class:'acts' },
        el('span', { class:'learn-pill' },
          el('span', { class:'dot' }),
          'AI เรียนรู้แล้ว '+Object.keys(overrides).length+' สัญลักษณ์'
        ),
        S.symbolsConfirmed
          ? el('button', { class:'btn btn-ghost btn-sm', onclick: () => { S.symbolsConfirmed=false; go('verify'); } },
              el('span', { html: ICN.refresh }), 'แก้ไขใหม่'
            )
          : el('button', { class:'btn btn-accent btn-sm', onclick: () => confirmSymbols() },
              el('span', { html: ICN.check }), 'ยืนยันความเข้าใจ → ไป Takeoff'
            ),
      )
    ),
    el('div', { class:'sym-intro' },
      el('span', { html: ICN.info }),
      el('span', null, 'AI ตรวจพบหน้า Symbol Legend ในแบบและสกัดสัญลักษณ์ออกมาตามด้านล่าง ',
        el('b', null, 'ตรวจสอบให้ครบ'),
        ' — ถ้าสัญลักษณ์ใดเข้าใจผิด ',
        el('b', null, 'กดแก้ไข'),
        ' AI จะจดจำและใช้ความเข้าใจใหม่ในการถอดปริมาณ'
      )
    ),
    renderSymbolTabs(),
    renderSymbolTable(),
  );
  return card;
}

function renderSymbolTabs() {
  const labels = {
    architectural:'สถาปัตยกรรม', mechanical:'HVAC',
    electrical:'ไฟฟ้า', plumbing:'สุขาภิบาล', fire:'ดับเพลิง'
  };
  const wrap = el('div', { class:'sym-tabs' });
  Object.keys(labels).forEach(k => {
    const arr = (S.symbols && S.symbols[k]) || [];
    wrap.appendChild(el('button', {
      class: 'sym-tab '+(SYM_TAB===k?'on':''),
      onclick: () => { SYM_TAB = k; go('verify'); }
    },
      labels[k],
      el('span', { class:'ct' }, arr.length),
    ));
  });
  return wrap;
}

function renderSymbolTable() {
  const list = (S.symbols && S.symbols[SYM_TAB]) || [];
  const tbl = el('table', { class:'sym-table' });
  tbl.appendChild(el('thead', null,
    el('tr', null,
      el('th', { style:{width:'92px'} }, 'สัญลักษณ์'),
      el('th', null, 'คำอธิบาย (ไทย)'),
      el('th', null, 'Description (EN)'),
      el('th', { style:{width:'88px'} }, 'คำย่อ'),
      el('th', { style:{width:'105px'}, class:'ctr' }, 'ความมั่นใจ'),
      el('th', { style:{width:'140px'}, class:'ctr' }, ' '),
    )
  ));
  const tb = el('tbody');
  list.forEach(s => tb.appendChild(renderSymbolRow(s)));
  /* add-new row */
  tb.appendChild(el('tr', { class:'sym-add' },
    el('td', { colspan:6, class:'ctr' },
      el('button', { class:'btn btn-ghost btn-sm', onclick: () => addNewSymbol() },
        el('span', { html: ICN.bolt }), '+ เพิ่มสัญลักษณ์ที่ AI ลืม'
      )
    )
  ));
  tbl.appendChild(tb);
  return tbl;
}

function renderSymbolRow(s) {
  const editing = s._editing;
  const confClass = s.conf >= 90 ? 'hi' : s.conf >= 75 ? 'mid' : 'lo';
  const row = el('tr', { class: (s.edited?'edited':'') + (editing?' editing':'') });

  /* Symbol cell */
  row.appendChild(el('td', { class:'sym-cell' },
    el('div', { class:'sym-box', html: s.sym }),
  ));

  /* TH */
  row.appendChild(el('td', null,
    editing
      ? el('input', { class:'sym-in', value:s.th, oninput:(e)=>{ s.th=e.target.value; } })
      : el('span', { class:'th' }, s.th)
  ));

  /* EN */
  row.appendChild(el('td', null,
    editing
      ? el('input', { class:'sym-in', value:s.en, oninput:(e)=>{ s.en=e.target.value; } })
      : el('span', { class:'en' }, s.en)
  ));

  /* Abbr */
  row.appendChild(el('td', null,
    editing
      ? el('input', { class:'sym-in mono', value:s.abbr, oninput:(e)=>{ s.abbr=e.target.value; } })
      : el('span', { class:'abbr' }, s.abbr)
  ));

  /* Confidence */
  row.appendChild(el('td', { class:'ctr' },
    el('div', { class:'conf-pill '+confClass },
      el('div', { class:'bar' }, el('span', { style:{ width: s.conf+'%' } })),
      el('div', { class:'pct' }, s.conf+'%'),
    )
  ));

  /* Actions */
  const acts = el('td', { class:'ctr sym-acts' });
  if (editing) {
    acts.appendChild(el('button', { class:'sym-btn save', onclick: () => saveSymbolEdit(s), title:'บันทึก', html: ICN.check }));
    acts.appendChild(el('button', { class:'sym-btn', onclick: () => { delete s._editing; go('verify'); }, title:'ยกเลิก' }, '✕'));
  } else {
    acts.appendChild(el('button', { class:'sym-btn', onclick: () => { s._editing=true; go('verify'); }, title:'แก้ไข', html: ICN.edit }));
    acts.appendChild(el('button', { class:'sym-btn del', onclick: () => removeSymbol(s), title:'ลบ', html: ICN.trash }));
  }
  row.appendChild(acts);

  return row;
}

function saveSymbolEdit(s) {
  delete s._editing;
  s.edited = true;
  s.conf = Math.min(100, Math.max(s.conf, 95));  /* user edits = high confidence */
  /* persist override */
  const ov = loadSymbolOverrides();
  ov[s.id] = { id:s.id, th:s.th, en:s.en, abbr:s.abbr, conf:s.conf, disc:s.disc, _new: s._new };
  saveSymbolOverrides(ov);
  toast('บันทึก & AI เรียนรู้แล้ว — "'+s.th+'"', 'g');
  go('verify');
}

function removeSymbol(s) {
  if (!confirm('ลบสัญลักษณ์ "'+s.th+'" ออกจากรายการ?')) return;
  S.symbols[SYM_TAB] = S.symbols[SYM_TAB].filter(x => x.id !== s.id);
  /* mark as user-removed */
  const ov = loadSymbolOverrides();
  ov['_removed_'+s.id] = { _removed:true };
  saveSymbolOverrides(ov);
  toast('ลบเรียบร้อย', 'b');
  go('verify');
}

function addNewSymbol() {
  const id = 'usr-'+Date.now().toString(36);
  const newSym = {
    id,
    sym: '<svg viewBox="0 0 60 30" stroke="currentColor" fill="none" stroke-width="1.3"><rect x="10" y="6" width="40" height="18" rx="2" stroke-dasharray="3,2"/><text x="30" y="20" font-size="9" fill="currentColor" stroke="none" text-anchor="middle">?</text></svg>',
    th:'(สัญลักษณ์ใหม่)', en:'(new symbol)', abbr:'?',
    disc:SYM_TAB, conf:100, _new:true, _editing:true, edited:true,
  };
  S.symbols[SYM_TAB].push(newSym);
  go('verify');
}

function confirmSymbols() {
  S.symbolsConfirmed = true;
  toast('ยืนยันความเข้าใจสัญลักษณ์เรียบร้อย — กำลังไป Takeoff', 'g');
  setTimeout(()=>go('takeoff'), 700);
}

function loadMockSymbols() {
  /* deep copy from KB + apply user overrides */
  S.symbols = {};
  Object.keys(SYMBOLS_KB).forEach(disc => {
    S.symbols[disc] = SYMBOLS_KB[disc].map(s => ({ ...s }));
  });
  /* apply existing overrides */
  const ov = loadSymbolOverrides();
  Object.entries(ov).forEach(([k, v]) => {
    if (v._removed) return;
    Object.keys(S.symbols).forEach(d => {
      const i = S.symbols[d].findIndex(x => x.id === v.id);
      if (i >= 0) Object.assign(S.symbols[d][i], v, { edited:true });
    });
  });
  S.symbolsConfirmed = false;
  updBdg && updBdg();
}
window.loadMockSymbols = loadMockSymbols;

function loadMockVerify() {
  S.verify = JSON.parse(JSON.stringify(MOCK_VERIFY));
  loadMockSymbols();
  go('verify');
  toast('โหลด Demo สำเร็จ — ตรวจสอบ + สัญลักษณ์ '+Object.values(S.symbols).reduce((a,arr)=>a+arr.length,0)+' รายการ', 'g');
}
window.loadMockVerify = loadMockVerify;

async function runVerify() {
  if (!S.files.length) { toast('กรุณาอัปโหลดแบบก่อนตรวจสอบ', 'w'); return; }
  if (!S.key) {
    /* No API key — fallback to mock for demo */
    toast('ไม่มี API Key — ใช้ Mock Symbols (Demo)', 'b');
    loadMockVerify();
    return;
  }
  ld(true, 'กำลังสแกนสัญลักษณ์...', 'AI กำลังค้นหา Symbol Legend ในแบบ');
  try {
    const contents = [];
    for (const f of S.files) {
      if (!f.file) continue;
      const b64 = await fileToBase64(f.file);
      if (f.type === 'application/pdf') contents.push({ type:'document', source:{ type:'base64', media_type:'application/pdf', data:b64 } });
      else if (f.type.startsWith('image/')) contents.push({ type:'image', source:{ type:'base64', media_type:f.type, data:b64 } });
    }
    contents.push({ type:'text', text:'Find the Symbol Legend / Abbreviation pages in the drawings and extract all symbols. Also do a completeness check. Output JSON only.' });
    const res = await ai(PROMPT.SYS_VERIFY, contents, 4000);
    const p = pJSON(res.text);
    if (!p) throw new Error('Invalid JSON');
    S.verify = p.verify || p;
    /* merge symbols with KB defaults */
    loadMockSymbols();
    if (p.symbols) {
      Object.keys(p.symbols).forEach(d => {
        if (S.symbols[d]) S.symbols[d] = p.symbols[d];
      });
    }
    go('verify');
    toast('สแกนสำเร็จ', 'g');
  } catch (e) {
    console.error(e);
    toast('Error: '+e.message+' — ใช้ Mock', 'r', 4000);
    loadMockVerify();
  } finally { ld(false); }
}
window.runVerify = runVerify;

/* ============================================================
   TAB: LEGAL
   ============================================================ */
window.RENDER.legal = function(root) {
  root.appendChild(el('div', { class:'page-head' },
    el('div', null,
      el('h2', null, el('span', { class:'pg-icon', html: ICN.legal }), 'ตรวจสอบทางกฎหมาย'),
      el('div', { class:'crumbs' }, 'พ.ร.บ.ควบคุมอาคาร · กฎกระทรวง · มาตรฐาน วสท. · ระเบียบผังเมือง')
    ),
    el('div', { class:'acts' })
  ));

  /* KPI */
  const ok = LEGAL.filter(l=>l.s==='ok').length;
  const wn = LEGAL.filter(l=>l.s==='warn').length;
  root.appendChild(el('div', { class:'grid-3', style:{marginBottom:'18px'} },
    el('div', { class:'kpi navy' }, el('div',{class:'lbl'},'ข้อกฎหมายที่ตรวจ'), el('div',{class:'val'}, LEGAL.length)),
    el('div', { class:'kpi green' }, el('div',{class:'lbl'},'ผ่าน'), el('div',{class:'val'}, ok)),
    el('div', { class:'kpi warn' }, el('div',{class:'lbl'},'ควรตรวจสอบเพิ่ม'), el('div',{class:'val'}, wn)),
  ));

  root.appendChild(el('div', { class:'card' },
    el('div', { class:'card-head' }, el('h3', null, el('span', { html: ICN.legal }), 'รายการกฎหมายที่ตรวจสอบ')),
    el('div', { class:'card-body' },
      el('div', { class:'legal-list' },
        ...LEGAL.map(l => el('div', { class:'legal-item '+(l.s==='ok'?'ok':'') },
          el('div', { class:'ic', html: l.s==='ok'?ICN.check:ICN.warn }),
          el('div', { class:'body' },
            el('b', null, l.t),
            el('p', null, l.d),
          )
        ))
      )
    )
  ));
};

/* ============================================================
   TAB: QA
   ============================================================ */
window.RENDER.qa = function(root) {
  if (!S.qa.length) S.qa = [QA_INTRO];
  root.appendChild(el('div', { class:'page-head' },
    el('div', null,
      el('h2', null, el('span', { class:'pg-icon', html: ICN.qa }), 'ถาม-ตอบกับ AI QS'),
      el('div', { class:'crumbs' }, 'ปรึกษาเรื่องราคา BOQ มาตรฐาน TCM ทางเลือกวัสดุ — ตอบในภาษาไทย')
    ),
    el('div', { class:'acts' },
      el('button', { class:'btn btn-ghost', onclick: () => { S.qa = [QA_INTRO]; go('qa'); } }, el('span', { html: ICN.trash }), 'ล้างประวัติ'),
    )
  ));

  const card = el('div', { class:'card', style:{display:'flex', flexDirection:'column', height:'calc(100vh - 240px)'} },
    el('div', { id:'chat-scroll', style:{flex:1, overflowY:'auto', padding:'18px'} },
      el('div', { class:'chat' },
        ...S.qa.map(m => el('div', { class:'msg '+m.r },
          el('div', { class:'av' }, m.r==='ai' ? 'AI' : 'U'),
          el('div', { class:'bubble' }, m.t)
        ))
      )
    ),
    el('div', { style:{borderTop:'1px solid var(--border)', padding:'12px 14px', background:'var(--elev)', display:'flex', gap:'8px'} },
      el('input', {
        id:'qa-in',
        type:'text',
        placeholder:'พิมพ์คำถาม เช่น "ฝ้า C1 กับ C4 ต่างกันยังไง?"',
        style:{flex:1, padding:'10px 14px', border:'1px solid var(--border-2)', borderRadius:'8px', background:'var(--surface)', fontSize:'13px'},
        onkeydown: (e) => { if (e.key === 'Enter') qaQ(); }
      }),
      el('button', { class:'btn btn-accent', onclick: () => qaQ() }, el('span', { html: ICN.send }), 'ส่ง'),
    )
  );
  root.appendChild(card);

  /* Quick prompts */
  if (S.qa.length === 1) {
    const qs = [
      'ฝ้า C1 กับ C4 ต่างกันอย่างไร และเหมาะกับงานแบบไหน?',
      'ราคาเหล็กเสริม SD40 ปัจจุบันประมาณเท่าไร?',
      'อาคารสำนักงาน 2,000 ตร.ม. ต้นทุนต่อ ตร.ม. ควรอยู่ที่เท่าไร?',
      'Value Engineering ลดต้นทุนได้อย่างไรบ้าง?',
    ];
    const qp = el('div', { style:{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'14px'} },
      ...qs.map(q => el('button', { class:'btn btn-ghost btn-sm', onclick: () => { $('qa-in').value = q; qaQ(); } }, q))
    );
    root.appendChild(qp);
  }

  setTimeout(() => { const sc = $('chat-scroll'); if (sc) sc.scrollTop = sc.scrollHeight; }, 50);
};

async function qaQ() {
  const inp = $('qa-in');
  const q = (inp.value||'').trim();
  if (!q) return;
  S.qa.push({ r:'user', t:q });
  inp.value = '';
  go('qa');

  if (!S.key) {
    setTimeout(() => {
      S.qa.push({ r:'ai', t:'ต้องการ API Key เพื่อตอบ — นี่คือคำตอบ Demo:\n\n'+mockAnswer(q) });
      go('qa');
    }, 500);
    return;
  }

  const placeholderIdx = S.qa.length;
  S.qa.push({ r:'ai', t:'…' });
  go('qa');
  try {
    const msgs = S.qa.slice(0,-1).filter(m => m.t && m.t !== '…').map(m => ({ role: m.r==='ai'?'assistant':'user', content: m.t }));
    /* call API */
    const body = {
      model:'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: PROMPT.SYS_QA,
      messages: msgs,
    };
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key': S.key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error('API '+resp.status);
    const data = await resp.json();
    const text = (data.content||[]).map(c=>c.text).join('\n');
    S.qa[placeholderIdx] = { r:'ai', t: text };
    go('qa');
  } catch (e) {
    S.qa[placeholderIdx] = { r:'ai', t:'เกิดข้อผิดพลาด: '+e.message };
    go('qa');
  }
}
window.qaQ = qaQ;

function mockAnswer(q) {
  return 'จากประสบการณ์ TCM Standard:\n\n• ฝ้า C1 (Gypsum 9mm + โครงเหล็กชุบสังกะสี + ทาสีพลาสติก) ราคาประมาณ 480-550 บาท/ตร.ม. เหมาะกับพื้นที่ทั่วไป\n• ฝ้า C4 (Acoustic + ระบบซ่อนโครง) ราคาประมาณ 1,200-1,500 บาท/ตร.ม. เหมาะกับห้องที่ต้องการดูดซับเสียง เช่น ห้องประชุม\n\nสำหรับอาคารสำนักงานทั่วไป ต้นทุนต่อ ตร.ม. ควรอยู่ที่ 14,000-18,000 บาท (ไม่รวมตกแต่ง)';
}

/* ============================================================
   TAB: EXPORT
   ============================================================ */
window.RENDER.export = function(root) {
  root.appendChild(el('div', { class:'page-head' },
    el('div', null,
      el('h2', null, el('span', { class:'pg-icon', html: ICN.export }), 'Export ผลงาน'),
      el('div', { class:'crumbs' }, 'ดาวน์โหลด BOQ เป็น Excel, CSV, JSON หรือ พิมพ์เป็น PDF')
    ),
    el('div', { class:'acts' })
  ));

  if (!S.boq) {
    root.appendChild(el('div', { class:'empty', style:{padding:'80px 24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px'} },
      el('h3', null, 'ยังไม่มี BOQ ให้ Export'),
      el('p', null, 'ไปทำการถอดปริมาณก่อน หรือโหลด Demo'),
      el('button', { class:'btn btn-primary', onclick: () => go('takeoff') }, 'ไปที่ Takeoff'),
    ));
    return;
  }

  /* Summary */
  const itemCount = S.boq.categories.reduce((a,c)=>a+c.items.length,0);
  root.appendChild(el('div', { class:'card', style:{marginBottom:'18px'} },
    el('div', { class:'card-head' }, el('h3', null, el('span', { html: ICN.takeoff }), 'BOQ ที่จะ Export')),
    el('div', { class:'card-body' },
      el('div', { class:'grid-4' },
        kpiCard('navy', 'โครงการ', S.boq.projectName.length > 24 ? S.boq.projectName.slice(0,24)+'…' : S.boq.projectName, null),
        kpiCard('', 'รายการ', itemCount, S.boq.categories.length+' หมวด'),
        kpiCard('', 'พื้นที่', fmtMoney(S.boq.totalArea), 'ตร.ม.'),
        kpiCard('green', 'รวม', fmtMoneyBaht(S.boq.grandTotal), null),
      )
    )
  ));

  /* Export buttons */
  root.appendChild(el('div', { class:'export-grid' },
    el('div', { class:'exp-card', onclick: () => dlXLSX(S.boq, 'TCM_BOQ.xlsx') },
      el('div', { class:'ic xlsx', html: ICN.xlsx }),
      el('h4', null, 'Excel (.xlsx)'),
      el('p', null, 'รูปแบบมาตรฐาน · แก้ไขได้ใน Excel'),
    ),
    el('div', { class:'exp-card', onclick: () => dlCSV(S.boq, 'TCM_BOQ.csv') },
      el('div', { class:'ic csv', html: ICN.csv }),
      el('h4', null, 'CSV (.csv)'),
      el('p', null, 'UTF-8 BOM · รองรับภาษาไทย'),
    ),
    el('div', { class:'exp-card', onclick: () => dlJSON(S.boq, 'TCM_BOQ.json') },
      el('div', { class:'ic json', html: ICN.json }),
      el('h4', null, 'JSON (.json)'),
      el('p', null, 'สำหรับ Backup / ใช้ใน System อื่น'),
    ),
    el('div', { class:'exp-card', onclick: () => { go('takeoff'); setTimeout(()=>window.print(), 300); } },
      el('div', { class:'ic pdf', html: ICN.pdf }),
      el('h4', null, 'PDF / Print'),
      el('p', null, 'พิมพ์รูปแบบ ปร.4 · A4 Landscape'),
    ),
  ));
};

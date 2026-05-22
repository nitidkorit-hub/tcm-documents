/* ===========================================================
   TCM ConstructAI QTO Agent — CORE (State + Utils + API)
   =========================================================== */

/* ---------- STATE ---------- */
const S = {
  key: '',
  files: [],           // [{id, name, size, file, disc, type, b64?}]
  disc: ['architectural','structural','mechanical','electrical'],
  verify: null,
  boq: null,
  meas: null,
  flags: [],
  qa: [],
  cmp: { f1:null, f2:null, res:null },
  symbols: null,       // detected symbols by discipline { architectural:[...], ... }
  symbolsConfirmed: false,  // user has reviewed and confirmed
  tab: 'upload',
  theme: 'light',
};

window.S = S;

/* ---------- DOM HELPERS ---------- */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const el = (tag, attrs={}, ...kids) => {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]);
    else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    else if (k === 'html') e.innerHTML = attrs[k];
    else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) e.setAttribute(k, attrs[k]);
  }
  kids.flat().forEach(k => {
    if (k === null || k === undefined || k === false) return;
    if (typeof k === 'string' || typeof k === 'number') e.appendChild(document.createTextNode(k));
    else e.appendChild(k);
  });
  return e;
};
window.$ = $; window.$$ = $$; window.el = el;

/* ---------- ICONS (SVG inline) ---------- */
const ICN = {
  upload:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  verify:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  takeoff:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="4" x2="9" y2="20"/></svg>',
  measure:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6L3 18m0-12l18 12"/><circle cx="3" cy="6" r="2"/><circle cx="21" cy="18" r="2"/></svg>',
  compare:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 17 17 7"/><polyline points="7 7 17 7 17 17"/></svg>',
  legal:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/></svg>',
  qa:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  export:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  moon:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>',
  print:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  play:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  refresh:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  check:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  warn:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  err:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  info:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  x:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  trash:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  file:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  pdf:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="7" y="18" font-size="6" font-family="sans-serif" font-weight="700" fill="currentColor" stroke="none">PDF</text></svg>',
  img:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
  xlsx:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>',
  csv:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  json:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H6a2 2 0 0 0-2 2v3M16 3h2a2 2 0 0 1 2 2v3M8 21H6a2 2 0 0 1-2-2v-3M16 21h2a2 2 0 0 0 2-2v-3"/></svg>',
  send:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  building:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="15" y1="14" x2="15" y2="14.01"/></svg>',
  empty:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
  swap:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  download:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  plus:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  bolt:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  edit:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
};
window.ICN = ICN;

/* ---------- TOAST ---------- */
function toast(msg, type='b', dur=3000) {
  const wrap = $('toast');
  if (!wrap) return;
  const icMap = { g:ICN.check, r:ICN.err, b:ICN.info, w:ICN.warn };
  const t = el('div', { class:'toast '+type }, el('span', { class:'ti', html: icMap[type]||ICN.info }), msg);
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = 0; t.style.transform = 'translateX(20px)'; t.style.transition = '.2s'; setTimeout(()=>t.remove(), 220); }, dur);
}
window.toast = toast;

/* ---------- LOADING ---------- */
function ld(on, text, sub) {
  const node = $('ld');
  if (!node) return;
  if (on) {
    node.querySelector('.t').textContent = text || 'กำลังประมวลผล...';
    node.querySelector('.sub').textContent = sub || 'AI กำลังวิเคราะห์';
    node.classList.add('on');
  } else {
    node.classList.remove('on');
  }
}
window.ld = ld;

/* ---------- FILE TO BASE64 ---------- */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
window.fileToBase64 = fileToBase64;

/* ---------- JSON REPAIR ---------- */
function pJSON(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  // strip markdown fences
  s = s.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
  // find first { or [
  const start = s.search(/[{[]/);
  if (start > 0) s = s.slice(start);

  // direct parse
  try { return JSON.parse(s); } catch (e) {}

  // try closing on the fly
  try {
    let depth = 0, inStr = false, esc = false, lastValid = -1;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') { depth--; if (depth === 0) lastValid = i; }
    }
    if (lastValid > 0) {
      return JSON.parse(s.slice(0, lastValid + 1));
    }
  } catch (e) {}

  // try item-by-item recovery for BOQ-shaped data
  try {
    const itemRe = /\{\s*"code"[\s\S]*?"total"\s*:\s*[\d.]+[^{}]*\}/g;
    const matches = [...s.matchAll(itemRe)];
    if (matches.length > 0) {
      const items = matches.map(m => { try { return JSON.parse(m[0]); } catch (e) { return null; } }).filter(Boolean);
      return { categories:[{ discipline:'architectural', items }], grandTotal: items.reduce((a,b)=>a+(b.total||0),0) };
    }
  } catch (e) {}

  return null;
}
window.pJSON = pJSON;

/* ---------- BADGE UPDATE ---------- */
function updBdg() {
  const fb = $('bdg-files'); if (fb) fb.querySelector('b').textContent = S.files.length;
  const db = $('bdg-disc');  if (db) db.querySelector('b').textContent = S.disc.length;
  const bb = $('bdg-boq');
  if (bb) {
    const n = S.boq ? S.boq.categories.reduce((a,c)=>a+c.items.length,0) : 0;
    bb.querySelector('b').textContent = n;
    bb.classList.toggle('on', n > 0);
  }
}
window.updBdg = updBdg;

/* ---------- TAB NAVIGATION ---------- */
function go(tab) {
  S.tab = tab;
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === tab));
  const c = $('content');
  c.innerHTML = '';
  const r = window.RENDER && window.RENDER[tab];
  if (r) r(c);
  else c.innerHTML = '<div class="empty"><h3>Tab "'+tab+'" ยังไม่พร้อม</h3></div>';
  window.scrollTo({ top: 0, behavior: 'instant' });
}
window.go = go;

/* ---------- API ---------- */
async function ai(systemPrompt, content, maxTokens=4000) {
  if (!S.key) throw new Error('No API key');
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role:'user', content }]
  };
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers: {
      'Content-Type':'application/json',
      'x-api-key': S.key,
      'anthropic-version':'2023-06-01',
      'anthropic-dangerous-direct-browser-access':'true',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errTxt = await resp.text().catch(()=> '');
    throw new Error('API '+resp.status+': '+errTxt.slice(0,200));
  }
  const data = await resp.json();
  const text = (data.content || []).map(c => c.text).join('\n');
  return { text, raw: data };
}
window.ai = ai;

/* ---------- PROMPTS ---------- */
const SYS_TAKEOFF = `You are an expert QS for TCM company Thailand. You know TCM standard BOQ items:
Ceiling: C1=Gypsum9mm painted, C2=WaterproofGypsum, C3=AluminiumCell, C4=Acoustic, C5=PlasterPainted, C6=WoodSlat, C7=FinishedEave
Wall: P1=BrickPlasterPaint, P2=BrickCeramic60x60, P3=ConcreteWallCeramic, P4=ConcreteWallPaint, P5=OilPaint, P6=Granite, P7=Gypsum12mm
Floor: F1=Porcelain60x60, F2=WaterproofPorcelain, F3=Granite, F4=WashedGravel, F5=EpoxyCoating, F6=RoughConcrete, F7=Granito60, F8=WaterproofPolyurethane, F9=Granito80, F10=PVCRubber
Doors: FireDoor, WPCDoor(single/double/sliding), AluminiumDoor, SteelDoor, HardwoodDoor
Windows: AluminiumWindow(casement/fixed/sliding/louvre)
Sanitary: FlushValve/SyphonToilet, Urinal, Washbasin(undercounter/wallhung), Faucet, Mirror, ToiletPartition HPL
Output ONLY raw JSON starting with { ending with }. Zero other text.`;

const SYS_COMPARE = `You are an expert BOQ comparison analyst in Thailand. Output ONLY raw JSON. Start with { end with }. Zero other text.`;

const SYS_QA = `You are an expert QS (Quantity Surveyor) for TCM Thailand. Answer in Thai. Be concise, expert, and cite TCM BOQ codes (C1, P2A, F1, etc.) when relevant. Limit answers to ~150 words.`;

const SYS_VERIFY = `You are an expert construction drawing reviewer for TCM Thailand. Check drawing completeness. Output ONLY raw JSON: {"overallScore":0-100,"status":"complete|mostly_complete|incomplete","checks":[{"t":"...","s":"ok|warn|err","d":"..."}],"recommendations":["..."]}`;

const SYS_MEASURE = `You are an expert at reading construction drawings and extracting measurements. Output ONLY raw JSON: {"items":[{"label":"...","value":0,"unit":"m"}]}`;

window.PROMPT = { SYS_TAKEOFF, SYS_COMPARE, SYS_QA, SYS_VERIFY, SYS_MEASURE };

/* ---------- EXCEL EXPORT (uses SheetJS via CDN) ---------- */
function boqToRows(boq) {
  const rows = [['รหัส','รายการ','หน่วย','จำนวน','ราคาต่อหน่วย (บาท)','รวม (บาท)','หมายเหตุ']];
  if (!boq) return rows;
  boq.categories.forEach(cat => {
    rows.push(['','◆ '+(DISC[cat.discipline]?.l||cat.discipline).toUpperCase(),'','','','','']);
    cat.items.forEach(it => rows.push([it.code, it.description, it.unit, it.qty, it.unitPrice, it.total, it.note||'']));
    rows.push(['','รวม '+(DISC[cat.discipline]?.l||cat.discipline),'','','', cat.subtotal,'']);
    rows.push(['','','','','','','']);
  });
  rows.push(['','รวมทั้งสิ้น','','','', boq.grandTotal,'']);
  return rows;
}

function dlXLSX(boq, fname) {
  if (!window.XLSX) { toast('SheetJS ยังโหลดไม่เสร็จ', 'r'); return; }
  const rows = boqToRows(boq);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:8},{wch:60},{wch:8},{wch:10},{wch:14},{wch:16},{wch:14}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BOQ');
  XLSX.writeFile(wb, fname || 'TCM_BOQ.xlsx');
  toast('Export Excel สำเร็จ', 'g');
}

function dlCSV(boq, fname) {
  const rows = boqToRows(boq);
  const csv = '\ufeff' + rows.map(r => r.map(c => {
    const s = String(c ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  }).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname || 'TCM_BOQ.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Export CSV สำเร็จ', 'g');
}

function dlJSON(obj, fname) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname || 'TCM_BOQ.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Export JSON สำเร็จ', 'g');
}

window.dlXLSX = dlXLSX;
window.dlCSV = dlCSV;
window.dlJSON = dlJSON;
window.boqToRows = boqToRows;

/* ---------- THEME ---------- */
function toggleTheme() {
  S.theme = S.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', S.theme);
  localStorage.setItem('tcm-theme', S.theme);
  const btn = $('theme-btn');
  if (btn) btn.innerHTML = S.theme === 'dark' ? ICN.sun : ICN.moon;
}
window.toggleTheme = toggleTheme;

/* ---------- KEY MASKING ---------- */
function maskKey(k) {
  if (!k) return '';
  if (k.length < 12) return k;
  return k.slice(0,8) + '…' + k.slice(-4);
}
window.maskKey = maskKey;

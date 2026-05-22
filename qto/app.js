/* ===========================================================
   TCM ConstructAI QTO Agent — APP INIT
   =========================================================== */

/* ---------- INIT ---------- */
function init() {
  /* Theme */
  const savedTheme = localStorage.getItem('tcm-theme');
  if (savedTheme === 'dark') {
    S.theme = 'dark';
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  /* Load API Key from localStorage */
  const k = localStorage.getItem('tcm-api-key') || '';
  if (k) {
    S.key = k;
    showApp();
  } else {
    showSetup();
  }
}

function showSetup() {
  $('setup').style.display = 'flex';
  $('app').classList.remove('on');
}

function showApp() {
  $('setup').style.display = 'none';
  $('app').classList.add('on');

  /* update key pill */
  const kp = $('key-pill-text');
  if (kp) kp.textContent = maskKey(S.key) || 'No key';

  /* update theme button */
  const tb = $('theme-btn');
  if (tb) tb.innerHTML = S.theme === 'dark' ? ICN.sun : ICN.moon;

  updBdg();
  go(S.tab || 'takeoff');
}

window.init = init;
window.showSetup = showSetup;
window.showApp = showApp;

/* ---------- SETUP ACTIONS ---------- */
function saveKey() {
  const v = ($('key-input').value || '').trim();
  if (!v.startsWith('sk-ant-')) {
    toast('API Key ต้องขึ้นต้นด้วย sk-ant-', 'r');
    return;
  }
  S.key = v;
  localStorage.setItem('tcm-api-key', v);
  toast('บันทึก API Key เรียบร้อย', 'g');
  showApp();
}

function skipKey() {
  /* demo mode without API key */
  S.key = '';
  localStorage.removeItem('tcm-api-key');
  toast('เข้าโหมด Demo (ไม่มี API Key) — ใช้ Mock Data ได้', 'b', 4000);
  showApp();
}

function clearKey() {
  if (!confirm('ต้องการล้าง API Key ออกจากเครื่องหรือไม่?')) return;
  S.key = '';
  localStorage.removeItem('tcm-api-key');
  toast('ล้าง API Key เรียบร้อย', 'b');
  showSetup();
}

window.saveKey = saveKey;
window.skipKey = skipKey;
window.clearKey = clearKey;

/* ---------- INITIALIZE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  /* Pre-fill setup if there is a key */
  const k = localStorage.getItem('tcm-api-key');
  if (k) $('key-input').value = k;

  /* If still on setup, attach Enter shortcut */
  $('key-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveKey();
  });

  /* Real-use mode: no auto-loaded demo. User must upload + run takeoff or click "โหลด Demo" manually */

  init();
});

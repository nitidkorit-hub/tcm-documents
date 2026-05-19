// Upload Modal + Project Detail Drawer + AI Chat panel + Toast system

// ===== Toast =====
const ToastCtx = React.createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((msg, kind='ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div className={`toast ${t.kind}`} key={t.id}>
            <Icon name={t.kind === 'err' ? 'close' : 'check'} size={16}/>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => React.useContext(ToastCtx);
window.ToastProvider = ToastProvider;
window.useToast = useToast;

// ===== Upload Modal =====
const detectType = (filename) => {
  const f = filename.toLowerCase();
  if (/eia|สิ่งแวดล้อม|environment|impact/.test(f)) return 'EIA';
  if (/แบบ|drawing|plan|dwg|blueprint|สถาปัตย์|โครงสร้าง/.test(f)) return 'แบบ';
  if (/สัญญา|contract|agreement/.test(f)) return 'สัญญา';
  if (/แรงงาน|labor|worker|safety|ปลอดภัย/.test(f)) return 'แรงงาน';
  if (/มยผ|มาตรฐาน|standard|spec/.test(f)) return 'มาตรฐาน';
  if (/mom|minutes|รายงานประชุม|meeting|ประชุม/.test(f)) return 'MOM';
  if (/ราคา|boq|ประมาณการ|cost|budget/.test(f)) return 'ราคา';
  return 'อื่นๆ';
};

const detectVersion = (filename) => {
  const m = filename.match(/(rev\s*\d+|v\d+|\d{4}-\d{2}-\d{2})/i);
  return m ? m[0] : null;
};

const UploadModal = ({ open, onClose, projects, onUpload }) => {
  const [drag, setDrag] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [proj, setProj] = React.useState(projects[0]?.id || '');
  const [type, setType] = React.useState('auto');
  const toast = useToast();

  React.useEffect(() => { if (!open) { setItems([]); setDrag(false); } }, [open]);

  const handleFiles = (files) => {
    const arr = Array.from(files).map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: Math.round(f.size / 1024),
      type: type === 'auto' ? detectType(f.name) : type,
      version: detectVersion(f.name),
      progress: 0,
    }));
    setItems(prev => [...prev, ...arr]);
    // simulate upload progress
    arr.forEach(it => {
      let p = 0;
      const tk = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) { p = 100; clearInterval(tk); }
        setItems(prev => prev.map(x => x.id === it.id ? {...x, progress: p} : x));
      }, 220);
    });
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFiles(e.dataTransfer.files);
  };

  const onSubmit = () => {
    if (!items.length) { toast('กรุณาเลือกไฟล์ก่อน', 'err'); return; }
    if (items.some(i => i.progress < 100)) { toast('กำลังอัปโหลด รอสักครู่...', 'err'); return; }
    onUpload(items.map(i => ({...i, projectId: proj})));
    toast(`อัปโหลด ${items.length} ไฟล์สำเร็จ`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>อัปโหลดเอกสารใหม่</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={18}/></button>
        </div>
        <div className="modal-body">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            <div className="field" style={{marginBottom: 0}}>
              <label>โครงการ</label>
              <select value={proj} onChange={e => setProj(e.target.value)}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field" style={{marginBottom: 0}}>
              <label>ประเภทเอกสาร</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="auto">🤖 จัดประเภทอัตโนมัติ</option>
                <option>EIA</option><option>แบบ</option><option>สัญญา</option>
                <option>แรงงาน</option><option>มาตรฐาน</option><option>MOM</option>
                <option>ราคา</option><option>อื่นๆ</option>
              </select>
            </div>
          </div>

          <div style={{height: 14}}/>

          <label
            className={`dropzone ${drag ? 'drag' : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <input type="file" multiple style={{display: 'none'}} onChange={e => handleFiles(e.target.files)} />
            <div className="ic"><Icon name="upload" size={32}/></div>
            <div className="t">ลากไฟล์มาวางที่นี่ หรือคลิกเลือก</div>
            <div className="s">รองรับ PDF, Word, Excel, JPG, PNG</div>
          </label>

          {items.length > 0 && (
            <div className="upload-list">
              {items.map(it => (
                <div className="upload-item" key={it.id}>
                  <div className={`file-ico dt-${it.type}`} style={{width: 24, height: 24, fontSize: 9}}>
                    {it.type.slice(0,3)}
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, color: 'var(--navy)'}}>
                      {it.name}
                    </div>
                    <div style={{fontSize: 11, color: 'var(--gray-500)'}}>
                      {it.type} {it.version ? `· ${it.version}` : ''} · {fmtSize(it.size)}
                    </div>
                  </div>
                  <div className="bar" style={{width: 80}}>
                    <div className="fill" style={{width: `${it.progress}%`}}/>
                  </div>
                  {it.progress >= 100 && <Icon name="check" size={14} color="#2DBE60" style={{color: 'var(--green)'}}/>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={onSubmit}>
            <Icon name="check" size={14}/> ยืนยันอัปโหลด ({items.length})
          </button>
        </div>
      </div>
    </div>
  );
};

window.UploadModal = UploadModal;

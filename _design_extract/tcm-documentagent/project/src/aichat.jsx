// AI Chat panel — uses window.claude.complete for real responses
// Returns intent JSON to enable download/zip/answer actions in UI.

const buildContextSummary = (data) => {
  const projLine = data.projects.map(p =>
    `- ${p.code}: ${p.name} (${data.files.filter(f => f.projectId === p.id).length} ไฟล์)`
  ).join('\n');
  const latestFiles = data.files.filter(f => f.isLatest)
    .map(f => {
      const p = data.projects.find(x => x.id === f.projectId);
      return `  · [${f.type}] ${f.name} — โครงการ ${p?.code} (${fmtDate(f.date)})`;
    }).join('\n');
  return `รายชื่อโครงการในระบบ:\n${projLine}\n\nไฟล์ Version ล่าสุดในระบบ:\n${latestFiles}`;
};

const AIChat = ({ open, onClose, data, onTriggerDownload, onTriggerZip }) => {
  const [msgs, setMsgs] = React.useState([
    { role: 'bot', text: 'สวัสดีครับ ผมเป็น AI Document Agent ผมช่วยค้นหาเอกสาร, ดาวน์โหลดไฟล์, หรือตอบคำถามเกี่ยวกับโครงการของคุณได้ครับ ลองพิมพ์คำสั่งดูเลย' },
  ]);
  const [input, setInput] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const endRef = React.useRef(null);

  React.useEffect(() => { endRef.current?.scrollTo(0, 99999); }, [msgs, thinking]);

  const suggestions = [
    'หา EIA ล่าสุดของ MRT-PP',
    'รวม Zip โครงการ ABC',
    'มี MOM กี่ฉบับ?',
  ];

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || thinking) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text }]);
    setThinking(true);

    const ctx = buildContextSummary(data);
    const prompt = `คุณเป็น TCM Document Agent — ผู้ช่วย AI สำหรับระบบจัดการเอกสารก่อสร้าง
ตอบเป็นภาษาไทย กระชับ มืออาชีพ ใช้น้ำเสียงเหมาะกับวิศวกร/ผู้จัดการโครงการ

ข้อมูลปัจจุบันในระบบ:
${ctx}

ผู้ใช้ถาม: "${text}"

ตอบกลับเป็น JSON อย่างเดียว (ห้ามมี markdown หรือ codeblock) ตามรูปแบบนี้เท่านั้น:
{
  "intent": "download_single" | "download_zip" | "answer",
  "reply": "ข้อความตอบกลับสั้นๆ ภาษาไทย (1-2 ประโยค)",
  "fileName": "ชื่อไฟล์เต็มถ้า intent คือ download_single ไม่งั้น null",
  "projectCode": "รหัสโครงการเช่น MRT-PP ถ้า intent คือ download_zip ไม่งั้น null"
}`;

    let reply = 'ขออภัย ระบบไม่สามารถตอบได้ในขณะนี้';
    let intent = 'answer';
    let fileName = null;
    let projectCode = null;
    try {
      const out = await window.claude.complete(prompt);
      // strip codeblock if any
      const clean = out.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      reply = parsed.reply || reply;
      intent = parsed.intent || 'answer';
      fileName = parsed.fileName || null;
      projectCode = parsed.projectCode || null;
    } catch (e) {
      // fallback - use raw output
      console.warn('parse fail', e);
    }

    setThinking(false);
    setMsgs(m => [...m, { role: 'bot', text: reply, intent, fileName, projectCode }]);
  };

  if (!open) return null;

  return (
    <div className="chat-panel">
      <div className="chat-head">
        <div className="ico"><Icon name="sparkles" size={18}/></div>
        <div>
          <div className="ttl">ถามหาเอกสาร</div>
          <div className="sub">Claude Haiku 4.5 · พร้อมตอบเสมอ</div>
        </div>
        <button className="close" onClick={onClose}><Icon name="close" size={18}/></button>
      </div>

      <div className="chat-msgs" ref={endRef}>
        {msgs.map((m, i) => (
          <div className={`msg ${m.role}`} key={i}>
            <div className="bubble">
              {m.text}
              {m.intent === 'download_single' && m.fileName && (
                <div className="file-pill" onClick={() => onTriggerDownload(m.fileName)}>
                  <Icon name="download" size={14} color="#2DBE60" style={{color: 'var(--green)'}}/>
                  <span className="nm">ดาวน์โหลด: {m.fileName}</span>
                </div>
              )}
              {m.intent === 'download_zip' && m.projectCode && (
                <div className="file-pill" onClick={() => onTriggerZip(m.projectCode)}>
                  <Icon name="zip" size={14} color="#2DBE60" style={{color: 'var(--green)'}}/>
                  <span className="nm">ดาวน์โหลด Zip: {m.projectCode}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="msg bot">
            <div className="bubble">
              <div className="typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        {msgs.length === 1 && !thinking && (
          <div className="chat-suggest">
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          placeholder="พิมพ์คำถาม เช่น หา BOQ ล่าสุดของ ABC..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={() => send()} disabled={thinking || !input.trim()}>
          <Icon name="send" size={16}/>
        </button>
      </div>
    </div>
  );
};

const ChatFab = ({ onClick }) => (
  <button className="chat-fab" onClick={onClick} title="ถามหาเอกสาร">
    <Icon name="sparkles" size={22}/>
  </button>
);

window.AIChat = AIChat;
window.ChatFab = ChatFab;

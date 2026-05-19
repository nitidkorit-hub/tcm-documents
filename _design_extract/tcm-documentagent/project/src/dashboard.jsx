// Dashboard section: stat cards, recent projects, recent activity, doc type breakdown

const fmtSize = (kb) => {
  if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
  return kb + ' KB';
};
const fmtDate = (d) => {
  const dt = new Date(d);
  const diff = Math.floor((Date.now() - dt) / 86400000);
  if (diff === 0) return 'วันนี้';
  if (diff === 1) return 'เมื่อวาน';
  if (diff < 7) return `${diff} วันก่อน`;
  if (diff < 30) return `${Math.floor(diff/7)} สัปดาห์ก่อน`;
  if (diff < 365) return `${Math.floor(diff/30)} เดือนก่อน`;
  return `${Math.floor(diff/365)} ปีก่อน`;
};
window.fmtSize = fmtSize;
window.fmtDate = fmtDate;

const StatCards = ({ data }) => {
  const proj = data.projects.length;
  const fileCount = data.files.length;
  const latestCount = data.files.filter(f => f.isLatest).length;
  const last7 = data.files.filter(f => {
    return (Date.now() - new Date(f.date)) / 86400000 <= 7;
  }).length;

  const cards = [
    { lbl: 'โครงการทั้งหมด', val: proj, suf: 'โครงการ', trend: '+1 เดือนนี้', icon: 'building', color: '#3A6EA5', bg: 'rgba(58,110,165,0.12)' },
    { lbl: 'ไฟล์ทั้งหมด', val: fileCount, suf: 'ไฟล์', trend: `${latestCount} Latest`, icon: 'file', color: '#2DBE60', bg: 'rgba(45,190,96,0.12)' },
    { lbl: 'เพิ่มใหม่ (7 วัน)', val: last7, suf: 'ไฟล์', trend: '+24% WoW', icon: 'upload', color: '#F5A623', bg: 'rgba(245,166,35,0.14)' },
    { lbl: 'พื้นที่ใช้งาน', val: '2.4', suf: 'GB', trend: 'จาก 10 GB', flat: true, icon: 'layers', color: '#6E56CF', bg: 'rgba(110,86,207,0.12)' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <div className="stat-card" key={i}>
          <div className="lbl">
            <div className="ico" style={{background: c.bg, color: c.color}}>
              <Icon name={c.icon} size={15} />
            </div>
            {c.lbl}
          </div>
          <div className="v">{c.val}<small>{c.suf}</small></div>
          <div className={`trend ${c.flat ? 'flat' : ''}`}>
            <Icon name={c.flat ? 'clock' : 'trend-up'} size={12} />
            {c.trend}
          </div>
        </div>
      ))}
    </div>
  );
};

const ProjectCard = ({ project, fileCount, latestDate, onOpen }) => (
  <div className="proj-card" onClick={onOpen}>
    <div className="proj-thumb" style={{background: project.color}}>
      {project.code.slice(0,3)}
    </div>
    <div className="proj-meta">
      <div className="name">{project.name}</div>
      <div className="info">
        <span><Icon name="file" size={11}/> {fileCount} ไฟล์</span>
        <span><Icon name="clock" size={11}/> อัปเดต {fmtDate(latestDate)}</span>
        <span style={{color: 'var(--steel)'}}>{project.status}</span>
      </div>
    </div>
    <div className="proj-actions">
      <button className="icon-btn" onClick={(e)=>{e.stopPropagation();}} title="Zip ล่าสุด">
        <Icon name="zip" size={15} />
      </button>
      <button className="icon-btn" title="เปิดดู">
        <Icon name="arrow-r" size={15} />
      </button>
    </div>
  </div>
);

const DocTypeChart = ({ files }) => {
  const counts = {};
  files.forEach(f => { counts[f.type] = (counts[f.type] || 0) + 1; });
  const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  const max = Math.max(...entries.map(e => e[1]));
  const colorOf = (t) => {
    const map = {
      'EIA':'#2DBE60','แบบ':'#3A6EA5','สัญญา':'#6E56CF','แรงงาน':'#F5A623',
      'มาตรฐาน':'#0EA5E9','MOM':'#EC4899','ราคา':'#DC2626','อื่นๆ':'#6B7280',
    };
    return map[t] || '#6B7280';
  };
  return (
    <div className="dtype-bar">
      {entries.map(([t, n]) => (
        <div className="dtype-row" key={t}>
          <span className="lab">{t}</span>
          <div className="bar"><div className="fill" style={{width: `${n/max*100}%`, background: colorOf(t)}}/></div>
          <span className="n">{n}</span>
        </div>
      ))}
    </div>
  );
};

const RecentActivity = ({ files, projects }) => {
  const projName = id => projects.find(p => p.id === id)?.name || '';
  const recent = [...files]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
  return (
    <div className="timeline">
      {recent.map(f => (
        <div className="tl-item" key={f.id}>
          <div className="tl-dot" style={f.isLatest ? {background: 'var(--green-50)', color: '#1F8E48'} : null}>
            <Icon name={f.isLatest ? 'sparkles' : 'file'} size={13}/>
          </div>
          <div className="tl-body">
            <div><span className="t">{f.name}</span></div>
            <div style={{color: 'var(--gray-500)', fontSize: 12}}>
              {projName(f.projectId)}
            </div>
            <div className="when">{fmtDate(f.date)} · {fmtSize(f.size)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Dashboard = ({ data, onOpenProject, onOpenUpload }) => {
  // file count per project
  const projInfo = data.projects.map(p => {
    const fs = data.files.filter(f => f.projectId === p.id);
    const latestDate = fs.reduce((a, f) => new Date(f.date) > new Date(a) ? f.date : a, '2000-01-01');
    return { project: p, fileCount: fs.length, latestDate };
  }).sort((a,b) => new Date(b.latestDate) - new Date(a.latestDate));

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="section-title">
            <h2>ภาพรวมระบบ</h2>
            <div className="sub">ข้อมูลล่าสุดของระบบจัดการเอกสาร · อัปเดตทุก {fmtDate(new Date().toISOString().slice(0,10))}</div>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <button className="btn btn-ghost btn-sm"><Icon name="history" size={14}/> ประวัติ</button>
            <button className="btn btn-primary btn-sm" onClick={onOpenUpload}>
              <Icon name="plus" size={14}/> เพิ่มเอกสาร
            </button>
          </div>
        </div>

        <StatCards data={data} />

        <div style={{height: 28}}/>

        <div className="dash-grid">
          <div className="pane">
            <h3>
              <span>โครงการล่าสุด</span>
              <a>ดูทั้งหมด <Icon name="arrow-r" size={12}/></a>
            </h3>
            <div className="proj-list">
              {projInfo.map(({project, fileCount, latestDate}) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  fileCount={fileCount}
                  latestDate={latestDate}
                  onOpen={() => onOpenProject(project.id)}
                />
              ))}
            </div>
          </div>

          <div className="pane">
            <h3>ประเภทเอกสาร</h3>
            <div className="card" style={{padding: 20, marginBottom: 20}}>
              <DocTypeChart files={data.files} />
            </div>
            <h3>กิจกรรมล่าสุด</h3>
            <div className="card" style={{padding: 16}}>
              <RecentActivity files={data.files} projects={data.projects} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

window.Dashboard = Dashboard;

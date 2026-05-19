// Project Detail drawer — shows file list grouped by baseName with versions

const FileRow = ({ file, projectName, onDelete }) => {
  const toast = useToast();
  return (
    <div className="file-row">
      <div className={`file-ico dt-${file.type}`}>
        {file.type.length > 3 ? file.type.slice(0,3) : file.type}
      </div>
      <div className="file-meta">
        <div className="fn">{file.name}</div>
        <div className="info">
          <span>{file.ext.toUpperCase()} · {fmtSize(file.size)}</span>
          <span>{fmtDate(file.date)}</span>
          {file.uploader && <span>โดย {file.uploader}</span>}
        </div>
      </div>
      <div>
        {file.isLatest
          ? <span className="badge badge-latest">ล่าสุด</span>
          : <span className="badge badge-old">เก่า</span>}
      </div>
      <div style={{display: 'flex', gap: 4}}>
        <button className="icon-btn" title="ดูตัวอย่าง" onClick={() => toast('เปิดตัวอย่างไฟล์')}><Icon name="eye" size={15}/></button>
        <button className="icon-btn" title="ดาวน์โหลด" onClick={() => toast(`ดาวน์โหลด ${file.name}`)}><Icon name="download" size={15}/></button>
        <button className="icon-btn danger" title="ลบ" onClick={() => {
          if (window.confirm(`ลบไฟล์ "${file.name}" ?`)) { onDelete(file.id); toast('ลบไฟล์เรียบร้อย'); }
        }}><Icon name="trash" size={15}/></button>
      </div>
    </div>
  );
};

const ProjectDrawer = ({ project, files, onClose, onDeleteFile }) => {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [showLatestOnly, setShowLatestOnly] = React.useState(false);
  const toast = useToast();

  if (!project) return null;
  const projFiles = files.filter(f => f.projectId === project.id);

  // group by baseName + type to form version stacks
  const groups = {};
  projFiles.forEach(f => {
    const k = `${f.type}|${f.baseName}`;
    if (!groups[k]) groups[k] = [];
    groups[k].push(f);
  });
  Object.values(groups).forEach(g => g.sort((a,b) => new Date(b.date) - new Date(a.date)));

  const types = ['all', ...new Set(projFiles.map(f => f.type))];

  const filteredKeys = Object.keys(groups).filter(k => {
    const [type, baseName] = k.split('|');
    if (filter !== 'all' && type !== filter) return false;
    if (search && !baseName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSize = projFiles.reduce((s, f) => s + f.size, 0);

  return (
    <>
      <div className="drawer-bd" onClick={onClose}/>
      <div className="drawer">
        <div className="drawer-head">
          <div className="top">
            <div style={{
              padding: '4px 10px', background: 'rgba(255,255,255,0.18)',
              borderRadius: 999, fontSize: 11, fontFamily: 'Prompt', fontWeight: 500,
              letterSpacing: '0.04em',
            }}>
              {project.code} · {project.status}
            </div>
            <button className="close" onClick={onClose}><Icon name="close" size={20}/></button>
          </div>
          <h2>{project.name}</h2>
          <div className="info">
            <span><Icon name="building" size={13}/> {project.client}</span>
            <span><Icon name="file" size={13}/> {projFiles.length} ไฟล์</span>
            <span><Icon name="layers" size={13}/> {fmtSize(totalSize)}</span>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 14}}>
            <button className="btn btn-sm btn-primary" onClick={() => toast(`ดาวน์โหลด ${project.name} (Zip ทั้งหมด)`)}>
              <Icon name="zip" size={13}/> Zip ทั้งโครงการ
            </button>
            <button className="btn btn-sm" style={{background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)'}}
              onClick={() => toast('Zip เฉพาะ Version ล่าสุด')}>
              <Icon name="bolt" size={13}/> Zip เฉพาะล่าสุด
            </button>
          </div>
        </div>

        <div className="drawer-tools">
          <div className="drawer-search">
            <Icon name="search" size={15} color="#6B7280" style={{color: 'var(--gray-500)'}}/>
            <input
              placeholder="ค้นหาในเอกสาร..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`filter-chip ${showLatestOnly ? 'on' : ''}`}
            onClick={() => setShowLatestOnly(s => !s)}
            title="แสดง Version ล่าสุดเท่านั้น"
          >
            <Icon name="bolt" size={11}/> ล่าสุด
          </button>
        </div>

        <div className="drawer-tools" style={{borderTop: 0, paddingTop: 0, flexWrap: 'wrap'}}>
          {types.map(t => (
            <button key={t} className={`filter-chip ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>
              {t === 'all' ? 'ทั้งหมด' : t}
            </button>
          ))}
        </div>

        <div className="drawer-body">
          {filteredKeys.length === 0 && (
            <div style={{textAlign: 'center', padding: 40, color: 'var(--gray-500)'}}>
              <Icon name="file" size={28}/>
              <div style={{marginTop: 8}}>ไม่พบเอกสารที่ตรงกับเงื่อนไข</div>
            </div>
          )}
          {filteredKeys.map(k => {
            const grp = groups[k];
            const [type, baseName] = k.split('|');
            const shown = showLatestOnly ? grp.slice(0, 1) : grp;
            return (
              <div className="version-group" key={k}>
                <div className="vg-head">
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span className={`badge dt-bg-${type}`} style={{padding: '3px 10px'}}>{type}</span>
                    <span style={{fontFamily: 'Prompt'}}>{baseName}</span>
                  </div>
                  <span style={{color: 'var(--gray-500)', fontSize: 12}}>
                    {grp.length} version{grp.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="vg-body">
                  {shown.map(f => (
                    <FileRow key={f.id} file={f} onDelete={onDeleteFile}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

window.ProjectDrawer = ProjectDrawer;

// Hero section + Topbar
const Topbar = ({ active, onNav, onOpenUpload }) => (
  <header className="topbar">
    <div className="topbar-inner">
      <div className="brand">
        <div className="brand-mark">T</div>
        <div className="brand-text">
          <span className="name">TCM Document Agent</span>
          <span className="sub">v5 · Engineering Edition</span>
        </div>
      </div>
      <nav className="nav">
        <button className={active === 'dashboard' ? 'active' : ''} onClick={() => onNav('dashboard')}>
          <Icon name="layers" size={15} /> ภาพรวม
        </button>
        <button className={active === 'projects' ? 'active' : ''} onClick={() => onNav('projects')}>
          <Icon name="folder" size={15} /> โครงการ
        </button>
        <button className={active === 'ai' ? 'active' : ''} onClick={() => onNav('ai')}>
          <Icon name="sparkles" size={15} /> ถามหาเอกสาร
        </button>
      </nav>
      <button className="btn btn-sm" style={{background: 'var(--gray-100)', color: 'var(--navy)'}}>
        <Icon name="bell" size={15} />
      </button>
      <button className="btn btn-sm btn-navy" onClick={onOpenUpload}>
        <Icon name="upload" size={15} /> อัปโหลด
      </button>
      <div className="user-pill">
        <div className="avatar">นว</div>
        <span className="uname">นภัสวรรณ</span>
      </div>
    </div>
  </header>
);

const Hero = ({ onUpload, onAsk, stats }) => (
  <section className="hero">
    <div className="container">
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">
            <span className="dot"></span>
            CLAUDE HAIKU 4.5 · ONLINE
          </div>
          <h1>
            เอกสารทุกไฟล์ <span className="hl">ทุก Version</span><br/>
            อยู่ในมือคุณเสมอ
          </h1>
          <p className="lead">
            จัดการเอกสารก่อสร้างนับร้อยไฟล์ — EIA, แบบ, สัญญา, BOQ และ MOM —
            ในระบบเดียว AI ช่วยจัดหมวดและติดตาม Version ให้อัตโนมัติ
            แค่พิมพ์คำสั่ง ระบบดึงไฟล์ที่ถูกต้องให้คุณทันที
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onUpload}>
              <Icon name="upload" size={16} /> เริ่มอัปโหลดเอกสาร
            </button>
            <button className="btn btn-secondary" onClick={onAsk}>
              <Icon name="sparkles" size={16} /> ลองถาม AI
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="n">{stats.projects}<small>โครงการ</small></div>
              <div className="l">PROJECTS</div>
            </div>
            <div className="stat">
              <div className="n">{stats.files}<small>ไฟล์</small></div>
              <div className="l">DOCUMENTS</div>
            </div>
            <div className="stat">
              <div className="n">{stats.types}<small>ประเภท</small></div>
              <div className="l">CATEGORIES</div>
            </div>
          </div>
        </div>
        <HeroPreview />
      </div>
    </div>
  </section>
);

const HeroPreview = () => (
  <div className="hero-preview">
    <div className="hero-preview-head">
      <div className="lights"><span></span><span></span><span></span></div>
      <div className="label">/ MRT-PP / EIA</div>
    </div>
    <div className="hero-preview-body">
      <div className="hp-row featured">
        <div className="hp-icon dt-eia">EIA</div>
        <div className="hp-meta">
          <div className="t">EIA_MRT-PP-เตาปูน_Rev3.pdf</div>
          <div className="s">2 วันก่อน · 8.2 MB</div>
        </div>
        <span className="hp-badge latest">ล่าสุด</span>
      </div>
      <div className="hp-row">
        <div className="hp-icon dt-eia">EIA</div>
        <div className="hp-meta">
          <div className="t">EIA_MRT-PP-เตาปูน_Rev2.pdf</div>
          <div className="s">35 วันก่อน · 7.9 MB</div>
        </div>
        <span className="hp-badge old">เก่า</span>
      </div>
      <div className="hp-row">
        <div className="hp-icon dt-eia">EIA</div>
        <div className="hp-meta">
          <div className="t">EIA_MRT-PP-เตาปูน_Rev1.pdf</div>
          <div className="s">92 วันก่อน · 7.8 MB</div>
        </div>
        <span className="hp-badge old">เก่า</span>
      </div>
      <div style={{
        marginTop: 4, padding: '10px 12px',
        background: 'rgba(45,190,96,0.08)',
        border: '1px dashed rgba(45,190,96,0.3)',
        borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.8)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon name="sparkles" size={14} />
        AI: เจอเอกสาร 3 Versions — Rev3 คือล่าสุด
      </div>
    </div>
  </div>
);

window.Topbar = Topbar;
window.Hero = Hero;

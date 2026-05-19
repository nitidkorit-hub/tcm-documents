// Main App
const { useState, useMemo, useCallback } = React;

const App = () => {
  const [data, setData] = useState(() => ({
    projects: window.TCM_DATA.projects,
    files: window.TCM_DATA.files,
  }));
  const [active, setActive] = useState('dashboard');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drawerProj, setDrawerProj] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const toast = useToast();

  const stats = useMemo(() => ({
    projects: data.projects.length,
    files: data.files.length,
    types: new Set(data.files.map(f => f.type)).size,
  }), [data]);

  const handleUpload = useCallback((items) => {
    setData(d => {
      const newFiles = items.map(it => ({
        id: 'u' + Math.random().toString(36).slice(2,7),
        projectId: it.projectId,
        type: it.type,
        baseName: it.name.replace(/\.\w+$/, '').replace(/_(rev\s*\d+|v\d+|\d{4}-\d{2}-\d{2})$/i, ''),
        name: it.name,
        rev: it.version,
        date: new Date().toISOString().slice(0,10),
        ext: (it.name.split('.').pop() || 'pdf').toLowerCase(),
        size: it.size,
        uploader: 'นภัสวรรณ',
        isLatest: false,
      }));
      const allFiles = [...d.files, ...newFiles];
      // recompute isLatest
      const groups = {};
      allFiles.forEach(f => {
        const k = `${f.projectId}|${f.type}|${f.baseName}`;
        if (!groups[k]) groups[k] = [];
        groups[k].push(f);
      });
      Object.values(groups).forEach(g => {
        g.sort((a,b) => new Date(b.date) - new Date(a.date));
        g.forEach((f, i) => { f.isLatest = i === 0; });
      });
      return { ...d, files: allFiles };
    });
  }, []);

  const handleDeleteFile = useCallback((id) => {
    setData(d => ({ ...d, files: d.files.filter(f => f.id !== id) }));
  }, []);

  const handleAIDownload = useCallback((fileName) => {
    toast(`เริ่มดาวน์โหลด: ${fileName}`);
  }, [toast]);

  const handleAIZip = useCallback((projectCode) => {
    toast(`สร้าง Zip โครงการ ${projectCode}...`);
  }, [toast]);

  const currentProject = drawerProj ? data.projects.find(p => p.id === drawerProj) : null;

  return (
    <div className="app">
      <Topbar
        active={active}
        onNav={(v) => {
          setActive(v);
          if (v === 'ai') setChatOpen(true);
        }}
        onOpenUpload={() => setUploadOpen(true)}
      />

      <Hero
        onUpload={() => setUploadOpen(true)}
        onAsk={() => setChatOpen(true)}
        stats={stats}
      />

      <Dashboard
        data={data}
        onOpenProject={setDrawerProj}
        onOpenUpload={() => setUploadOpen(true)}
      />

      <footer className="footer">
        <div className="container">
          <div>TCM Document Agent · v5 Engineering Edition · Powered by Claude Haiku 4.5</div>
          <div style={{fontSize: 12, marginTop: 4, color: 'var(--gray-400)'}}>
            © 2026 TCM · Phase 2: เชื่อม OneDrive (กำลังพัฒนา)
          </div>
        </div>
      </footer>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projects={data.projects}
        onUpload={handleUpload}
      />

      {currentProject && (
        <ProjectDrawer
          project={currentProject}
          files={data.files}
          onClose={() => setDrawerProj(null)}
          onDeleteFile={handleDeleteFile}
        />
      )}

      {!chatOpen && <ChatFab onClick={() => setChatOpen(true)}/>}
      <AIChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        data={data}
        onTriggerDownload={handleAIDownload}
        onTriggerZip={handleAIZip}
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ToastProvider><App/></ToastProvider>);

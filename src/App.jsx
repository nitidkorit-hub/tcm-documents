import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, fetchProjects } from './api/supabase.js'
import { ToastProvider } from './components/Toast.jsx'
import Auth from './components/Auth.jsx'
import Topbar from './components/Topbar.jsx'
import Hero from './components/Hero.jsx'
import Dashboard from './components/Dashboard.jsx'
import ProjectDrawer from './components/ProjectDrawer.jsx'
import UploadModal from './components/UploadModal.jsx'
import NewProjectModal from './components/NewProjectModal.jsx'
import AIChat, { ChatFab } from './components/AIChat.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        setUser(u)
        setAuthLoading(false)
      })
      .catch(() => setAuthLoading(false))

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <ToastProvider>{user ? <MainApp user={user} /> : <Auth />}</ToastProvider>
  )
}

function MainApp({ user }) {
  const [active, setActive] = useState('dashboard')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [drawerProject, setDrawerProject] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [heroStats, setHeroStats] = useState({ projects: 0, files: 0, types: 0 })

  const refresh = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    loadHeroStats()
  }, [refreshKey])

  const loadHeroStats = async () => {
    try {
      const projects = await fetchProjects()
      // Quick aggregate count via single query per project
      const { count: fileCount } = await supabase.from('files').select('id', { count: 'exact', head: true })
      const { data: typesData } = await supabase.from('files').select('type')
      const typeSet = new Set((typesData || []).map((f) => f.type))
      setHeroStats({
        projects: projects.length,
        files: fileCount || 0,
        types: typeSet.size || 8,
      })
    } catch (err) {
      console.error('hero stats:', err)
    }
  }

  const openProjectById = async (projectId) => {
    try {
      const projects = await fetchProjects()
      const found = projects.find((p) => p.id === projectId)
      if (found) setDrawerProject(found)
    } catch (err) {
      console.error('open project:', err)
    }
  }

  return (
    <div className="app">
      <Topbar
        user={user}
        active={active}
        onNav={setActive}
        onOpenUpload={() => setUploadOpen(true)}
        onOpenChat={() => setChatOpen(true)}
      />

      <Hero
        stats={heroStats}
        onUpload={() => setUploadOpen(true)}
        onAsk={() => setChatOpen(true)}
      />

      <Dashboard
        refreshKey={refreshKey}
        onOpenProject={openProjectById}
        onOpenUpload={() => setUploadOpen(true)}
        onNewProject={() => setNewProjectOpen(true)}
      />

      <footer className="footer">
        TCM Document Agent · v5 Engineering Edition · Powered by Claude Haiku 4.5
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gray-400)' }}>
          © {new Date().getFullYear()} TCM
        </div>
      </footer>

      {drawerProject && (
        <ProjectDrawer
          project={drawerProject}
          onClose={() => setDrawerProject(null)}
          onChanged={refresh}
        />
      )}

      {uploadOpen && (
        <UploadModal
          user={user}
          onClose={() => setUploadOpen(false)}
          onUploaded={refresh}
        />
      )}

      {newProjectOpen && (
        <NewProjectModal
          onClose={() => setNewProjectOpen(false)}
          onCreated={refresh}
        />
      )}

      {!chatOpen && <ChatFab onClick={() => setChatOpen(true)} />}
      <AIChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

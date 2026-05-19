import { useState, useEffect } from 'react'
import { supabase, getCurrentUser } from './api/supabase.js'
import Auth from './components/Auth.jsx'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import ProjectDrawer from './components/ProjectDrawer.jsx'
import UploadModal from './components/UploadModal.jsx'
import NewProjectModal from './components/NewProjectModal.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [drawerProject, setDrawerProject] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u)
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const refresh = () => setRefreshKey(k => k + 1)

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="app-container">
      <Header
        user={user}
        onUpload={() => setUploadOpen(true)}
        onNewProject={() => setNewProjectOpen(true)}
      />

      <main className="app-main">
        <Dashboard
          refreshKey={refreshKey}
          onSelectProject={setDrawerProject}
        />
      </main>

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
    </div>
  )
}

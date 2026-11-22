import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/layout/ScrollToTop'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function AppShell() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text)]">
        <LoadingSpinner label="Checking session" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--background)] text-[var(--text)]">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AppShell

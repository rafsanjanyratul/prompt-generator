import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/layout/ScrollToTop'

function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text)]">
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

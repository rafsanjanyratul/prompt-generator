import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import router from './app/routes.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { initializeAnalytics, trackPageView } from './lib/analytics.js'
import './styles/tokens.css'
import './styles/globals.css'

function AppShell() {
  const [toastTheme, setToastTheme] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))

  useEffect(() => {
    const syncTheme = () => {
      setToastTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
    }

    syncTheme()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme') {
          syncTheme()
          break
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={toastTheme}
      />
    </>
  )
}

initializeAnalytics()

const originalLocation = window.location.pathname
trackPageView({
  path: originalLocation,
  title: document.title,
  page_type: originalLocation.startsWith('/styles/') ? 'style_detail' : originalLocation === '/explore' ? 'explore' : 'home',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)

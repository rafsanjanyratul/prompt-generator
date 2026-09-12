import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './app/routes.jsx'
import { initializeAnalytics, trackPageView } from './lib/analytics.js'
import './styles/tokens.css'
import './styles/globals.css'

initializeAnalytics()

const originalLocation = window.location.pathname
trackPageView({
  path: originalLocation,
  title: document.title,
  page_type: originalLocation.startsWith('/styles/') ? 'style_detail' : originalLocation === '/explore' ? 'explore' : 'home',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

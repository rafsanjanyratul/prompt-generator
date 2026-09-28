import { createBrowserRouter } from 'react-router-dom'
import AppShell from './AppShell'
import HomePage from '../pages/HomePage'
import ExplorePage from '../pages/ExplorePage'
import StyleDetailPage from '../pages/StyleDetailPage'
import CreatePage from '../pages/CreatePage'
import VoicePromptPage from '../pages/VoicePromptPage'
import { trackPageView } from '../lib/analytics.js'

const routePageType = (path) => {
  if (path.startsWith('/styles/')) return 'style_detail'
  if (path === '/explore') return 'explore'
  if (path === '/create') return 'create'
  if (path === '/voice-prompt') return 'voice_prompt'
  if (path === '/') return 'home'
  return 'not_found'
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'explore',
        element: <ExplorePage />,
      },
      {
        path: 'styles/:slug',
        element: <StyleDetailPage />,
      },
      {
        path: 'create',
        element: <CreatePage />,
      },
      {
        path: 'voice-prompt',
        element: <VoicePromptPage />,
      },
    ],
  },
])

router.subscribe((state) => {
  const location = state.location
  const pageType = routePageType(location.pathname)

  trackPageView({
    path: location.pathname,
    title: document.title,
    page_type: pageType,
  })
})

export default router

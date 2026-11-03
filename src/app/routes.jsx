import { createBrowserRouter } from 'react-router-dom'
import AppShell from './AppShell'
import AdminProtectedRoute from '../components/auth/AdminProtectedRoute.jsx'
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx'
import HomePage from '../pages/HomePage'
import ExplorePage from '../pages/ExplorePage'
import MyPromptsPage from '../pages/MyPromptsPage.jsx'
import FavoritesPage from '../pages/FavoritesPage.jsx'
import StyleDetailPage from '../pages/StyleDetailPage'
import CreatePage from '../pages/CreatePage'
import VoicePromptPage from '../pages/VoicePromptPage'
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx'
import AdminCreatePromptPage from '../pages/AdminCreatePromptPage.jsx'
import AdminManagePromptsPage from '../pages/AdminManagePromptsPage.jsx'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage.jsx'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx'
import { trackPageView } from '../lib/analytics.js'

const routePageType = (path) => {
  if (path === '/admin' || path.startsWith('/admin/')) return 'admin'
  if (path.startsWith('/styles/')) return 'style_detail'
  if (path === '/explore') return 'explore'
  if (path === '/create') return 'create'
  if (path === '/favorites') return 'favorites'
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
        element: (
          <ProtectedRoute>
            <CreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-prompts',
        element: (
          <ProtectedRoute>
            <MyPromptsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'voice-prompt',
        element: (
          <ProtectedRoute>
            <VoicePromptPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'admin/manage-prompts',
        element: (
          <AdminProtectedRoute>
            <AdminManagePromptsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'admin/prompts/new',
        element: (
          <AdminProtectedRoute>
            <AdminCreatePromptPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
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

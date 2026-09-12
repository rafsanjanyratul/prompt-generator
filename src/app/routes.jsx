import { createBrowserRouter } from 'react-router-dom'
import AppShell from './AppShell'
import HomePage from '../pages/HomePage'
import ExplorePage from '../pages/ExplorePage'

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
        element: <div className="container page-placeholder">Style detail page coming soon.</div>,
      },
    ],
  },
])

export default router

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
        element: (
          <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-16 text-base text-[var(--text-muted)]">
            Style detail page coming soon.
          </div>
        ),
      },
    ],
  },
])

export default router

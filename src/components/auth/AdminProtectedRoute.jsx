import { Navigate, useLocation } from 'react-router-dom'

import LoadingSpinner from '../ui/LoadingSpinner.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <LoadingSpinner label="Checking admin access" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: location.state,
          },
          message: 'You must log in to access this page.',
        }}
      />
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto flex min-h-[50vh] w-[min(var(--container-width),calc(100%-2rem))] items-center justify-center py-12">
        <div className="w-full max-w-xl rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Access denied</p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[var(--text)]">Admin access required</h1>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            This page is restricted to administrator accounts only.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default AdminProtectedRoute

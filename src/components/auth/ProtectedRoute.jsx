import { Navigate, useLocation } from 'react-router-dom'

import LoadingSpinner from '../ui/LoadingSpinner.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <LoadingSpinner label="Checking session" />
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

  return children
}

export default ProtectedRoute

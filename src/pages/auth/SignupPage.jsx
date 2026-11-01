import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, signup } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <LoadingSpinner label="Checking session" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ type: 'idle', message: '' })
    setIsSubmitting(true)

    try {
      await signup(formData)
      toast.success('Signup successful.')
      const redirectFrom = location.state?.from
      const redirectDestination = redirectFrom
        ? `${redirectFrom.pathname}${redirectFrom.search}${redirectFrom.hash}`
        : '/'
      navigate(redirectDestination, { replace: true })
    } catch (error) {
      const errorMessage = error.message || 'Unable to create your account. Please try again.'
      setStatus({
        type: 'error',
        message: errorMessage,
      })
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const redirectMessage = location.state?.message

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-12">
      <div className="w-full rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Create account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[var(--text)]">Sign up</h1>
        </div>

        {redirectMessage ? (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {redirectMessage}
          </div>
        ) : null}

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--text)]">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[var(--focus)]/30"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--text)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[var(--focus)]/30"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--text)]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[var(--focus)]/30"
                placeholder="Minimum 8 characters"
              />
            </div>

            {status.type !== 'idle' ? (
              <div
                className={
                  status.type === 'error'
                    ? 'rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700'
                    : 'rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700'
                }
              >
                {status.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-[var(--background)] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            state={
              location.state?.from
                ? { from: location.state.from, message: location.state.message }
                : undefined
            }
            className="font-semibold text-[var(--brand)]"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage

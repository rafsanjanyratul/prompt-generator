import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import { forgotPassword } from '../../lib/authApi.js'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ type: 'idle', message: '' })

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      const errorMessage = 'Please enter your email address.'
      setStatus({ type: 'error', message: errorMessage })
      toast.error(errorMessage)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await forgotPassword(trimmedEmail)
      const successMessage = result.message || 'If an account exists for this email, a password reset link has been sent.'
      setStatus({ type: 'success', message: successMessage })
      toast.success(successMessage)
    } catch (error) {
      const errorMessage = error.message || 'Unable to process your request right now.'
      setStatus({ type: 'error', message: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-12">
      <div className="w-full rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Account recovery</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[var(--text)]">Forgot password</h1>
        </div>

        {status.type === 'success' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {status.message}
            </div>
            <Link
              to="/login"
              className="block w-full rounded-xl bg-[var(--brand)] px-4 py-3 text-center font-semibold text-white transition hover:brightness-110"
              style={{ color: '#fff' }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-medium text-[var(--text)]">
                Email
              </label>
              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[var(--focus)]/30"
              />
            </div>

            {status.type === 'error' ? (
              <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {status.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-[var(--background)] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-semibold text-[var(--brand)]">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage

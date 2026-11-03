import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { resetPassword } from '../../lib/authApi.js'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'

const MIN_PASSWORD_LENGTH = 8

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Missing reset token. Please use the link from your email.',
      })
    }
  }, [token])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    if (status.type !== 'idle') {
      setStatus({ type: 'idle', message: '' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token) {
      setStatus({
        type: 'error',
        message: 'Missing reset token. Please use the link from your email.',
      })
      return
    }

    const password = formData.password
    const confirmPassword = formData.confirmPassword

    if (!password || !confirmPassword) {
      const errorMessage = 'Please enter and confirm your new password.'
      setStatus({ type: 'error', message: errorMessage })
      toast.error(errorMessage)
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      const errorMessage = 'Password must be at least 8 characters long.'
      setStatus({ type: 'error', message: errorMessage })
      toast.error(errorMessage)
      return
    }

    if (password !== confirmPassword) {
      const errorMessage = 'Passwords do not match.'
      setStatus({ type: 'error', message: errorMessage })
      toast.error(errorMessage)
      return
    }

    setStatus({ type: 'idle', message: '' })
    setIsSubmitting(true)

    try {
      const result = await resetPassword(token, password)
      const successMessage = result.message || 'Password reset successfully.'
      setStatus({ type: 'success', message: successMessage })
      setFormData({ password: '', confirmPassword: '' })
      toast.success(successMessage)
    } catch (error) {
      const errorMessage = error.message || 'Unable to reset your password. Please try again.'
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
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[var(--text)]">Reset password</h1>
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
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!token ? (
              <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {status.message || 'Missing reset token. Please use the link from your email.'}
              </div>
            ) : null}

            {token ? (
              <>
                <div>
                  <label htmlFor="reset-password" className="mb-2 block text-sm font-medium text-[var(--text)]">
                    New password
                  </label>
                  <input
                    id="reset-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[var(--focus)]/30"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[var(--text)]">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[var(--focus)]/30"
                  />
                </div>
              </>
            ) : null}

            {status.type === 'error' && status.message && token ? (
              <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {status.message}
              </div>
            ) : null}

            {token ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-[var(--background)] transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Updating password...' : 'Reset password'}
              </button>
            ) : null}

            <div className="text-center">
              <Link to="/login" className="text-sm font-semibold text-[var(--brand)]">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {status.type === 'idle' && !token ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner label="Checking reset link" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ResetPasswordPage

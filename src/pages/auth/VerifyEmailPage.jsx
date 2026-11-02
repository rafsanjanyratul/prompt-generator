import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { resendVerificationEmail, verifyEmail } from '../../lib/authApi.js'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get('token')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [email, setEmail] = useState(location.state?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Missing verification token. Please use the link from your email.',
      })
      return
    }

    let active = true

    const runVerification = async () => {
      setStatus({ type: 'loading', message: 'Verifying your email...' })

      try {
        await verifyEmail(token)
        if (!active) return
        setStatus({
          type: 'success',
          message: 'Your email has been verified successfully. You can now sign in.',
        })
      } catch (error) {
        if (!active) return
        setStatus({
          type: 'error',
          message:
            error.message ||
            'This verification link is invalid or expired. It may have already been used or may have expired.',
        })
      }
    }

    void runVerification()

    return () => {
      active = false
    }
  }, [token])

  const handleResendVerification = async (event) => {
    event.preventDefault()

    if (!email) {
      setStatus({ type: 'error', message: 'Please enter the email address to resend the verification link.' })
      toast.error('Please enter your email address to resend the verification link.')
      return
    }

    setIsSubmitting(true)

    try {
      await resendVerificationEmail(email)
      const genericMessage =
        'If this email belongs to an unverified account, a verification email may be sent. Please check your inbox.'
      setStatus({
        type: 'success',
        message: genericMessage,
      })
      toast.success(genericMessage)
    } catch (error) {
      const errorMessage = error.message || 'Unable to resend the verification email.'
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Email verification</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[var(--text)]">Verify your account</h1>
        </div>

        {status.type === 'loading' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <LoadingSpinner label="Verifying email" />
            <p className="text-sm text-[var(--text-muted)]">{status.message}</p>
          </div>
        ) : null}

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
        ) : null}

        {status.type === 'error' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {status.message}
            </div>

            <Link
              to="/login"
              className="block w-full rounded-xl bg-[var(--brand)] px-4 py-3 text-center font-semibold text-white transition hover:brightness-110"
              style={{ color: '#fff' }}
            >
              Back to Login
            </Link>

            <form onSubmit={handleResendVerification} className="space-y-3">
              <div>
                <label htmlFor="verification-email" className="mb-2 block text-sm font-medium text-[var(--text)]">
                  Email address
                </label>
                <input
                  id="verification-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[var(--focus)]/30"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-[var(--brand)] px-4 py-3 font-medium text-[var(--brand)] transition hover:bg-[var(--brand)]/5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : 'Resend verification email'}
              </button>
            </form>

            <Link
              to="/login"
              className="block text-center text-sm font-semibold text-[var(--brand)]"
            >
              Back to login
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default VerifyEmailPage

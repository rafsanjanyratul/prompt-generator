import { useEffect, useState } from 'react'
import { CreditCard, TrendingUp, History, LogOut, ArrowUpRight, Calendar } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import {
  getCurrentSubscription,
  getCreditBalance,
  getPlans,
  getPaymentHistory,
} from '../lib/billingApi.js'

function BillingPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const navigate = useNavigate()

  const [subscription, setSubscription] = useState(null)
  const [creditBalance, setCreditBalance] = useState(null)
  const [plans, setPlans] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])

  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(true)

  const [subscriptionError, setSubscriptionError] = useState('')
  const [creditsError, setCreditsError] = useState('')
  const [paymentsError, setPaymentsError] = useState('')

  useDocumentMeta({
    title: 'Billing Dashboard — PromptTouch AI',
    description: 'Manage your subscription, credits, and billing information.',
    robots: 'noindex,nofollow',
  })

  // Load subscription
  useEffect(() => {
    let isMounted = true

    async function loadSubscription() {
      try {
        setSubscriptionLoading(true)
        setSubscriptionError('')

        const sub = await getCurrentSubscription()
        if (isMounted) {
          setSubscription(sub)
        }
      } catch (error) {
        if (isMounted) {
          setSubscriptionError(error.message || 'Failed to load subscription.')
        }
      } finally {
        if (isMounted) {
          setSubscriptionLoading(false)
        }
      }
    }

    if (user) {
      loadSubscription()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  // Load credit balance
  useEffect(() => {
    let isMounted = true

    async function loadCredits() {
      try {
        setCreditsLoading(true)
        setCreditsError('')

        const balance = await getCreditBalance()
        if (isMounted) {
          setCreditBalance(balance)
        }
      } catch (error) {
        if (isMounted) {
          setCreditsError(error.message || 'Failed to load credit balance.')
        }
      } finally {
        if (isMounted) {
          setCreditsLoading(false)
        }
      }
    }

    if (user) {
      loadCredits()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  // Load plans (for showing plan names)
  useEffect(() => {
    let isMounted = true

    async function loadPlans() {
      try {
        const fetchedPlans = await getPlans()
        if (isMounted) {
          setPlans(Array.isArray(fetchedPlans) ? fetchedPlans : [])
        }
      } catch (error) {
        // Silently fail; plans are only used for reference
        if (isMounted) {
          console.error('Failed to load plans:', error)
        }
      }
    }

    loadPlans()

    return () => {
      isMounted = false
    }
  }, [])

  // Load payment history
  useEffect(() => {
    let isMounted = true

    async function loadPayments() {
      try {
        setPaymentsLoading(true)
        setPaymentsError('')

        const payments = await getPaymentHistory()
        if (isMounted) {
          setPaymentHistory(Array.isArray(payments) ? payments : [])
        }
      } catch (error) {
        if (isMounted) {
          setPaymentsError(error.message || 'Failed to load payment history.')
        }
      } finally {
        if (isMounted) {
          setPaymentsLoading(false)
        }
      }
    }

    if (user) {
      loadPayments()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  const handleRetryCredits = () => {
    setCreditsLoading(true)
    setCreditsError('')
    getCreditBalance()
      .then((balance) => {
        setCreditBalance(balance)
        setCreditsLoading(false)
      })
      .catch((error) => {
        setCreditsError(error.message || 'Failed to load credit balance.')
        setCreditsLoading(false)
      })
  }

  const handleRetryPayments = () => {
    setPaymentsLoading(true)
    setPaymentsError('')
    getPaymentHistory()
      .then((payments) => {
        setPaymentHistory(Array.isArray(payments) ? payments : [])
        setPaymentsLoading(false)
      })
      .catch((error) => {
        setPaymentsError(error.message || 'Failed to load payment history.')
        setPaymentsLoading(false)
      })
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  if (isAuthLoading) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] flex min-h-[60vh] items-center justify-center py-16">
        <LoadingSpinner label="Loading dashboard..." size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-12 pb-20">
      {/* Header */}
      <div className="mb-12">
        <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-5xl">
          Billing Dashboard
        </h1>
        {user && (
          <p className="m-0 mt-2 text-[var(--text-muted)]">
            Welcome, <span className="font-semibold text-[var(--text)]">{user.name}</span>
          </p>
        )}
      </div>

      {/* Top Section: Credits & Subscription Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Credit Overview Card */}
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Credit Balance</h2>
            <div className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)]">
              <CreditCard className="size-5 text-[var(--brand)]" />
            </div>
          </div>

          {creditsError ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-[rgba(245,85,85,0.1)] p-3">
                <p className="m-0 text-sm text-[var(--error)]">{creditsError}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRetryCredits}
                className="w-full"
              >
                Retry
              </Button>
            </div>
          ) : creditsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner label="Loading..." size="sm" />
            </div>
          ) : creditBalance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-[var(--surface-elevated)] p-4 text-center">
                  <p className="m-0 text-sm text-[var(--text-muted)] mb-1">Available</p>
                  <p className="m-0 text-3xl font-bold text-[var(--text)]">
                    {creditBalance.availableCredits}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--surface-elevated)] p-4 text-center">
                  <p className="m-0 text-sm text-[var(--text-muted)] mb-1">Reserved</p>
                  <p className="m-0 text-3xl font-bold text-[var(--brand-accent)]">
                    {creditBalance.reservedCredits}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--surface-elevated)] p-4 text-center">
                  <p className="m-0 text-sm text-[var(--text-muted)] mb-1">Total</p>
                  <p className="m-0 text-3xl font-bold text-[var(--success)]">
                    {creditBalance.totalCredits}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-muted)]">
                <p className="m-0">
                  <span className="font-semibold text-[var(--text)]">Available:</span> Credits ready to use
                </p>
                <p className="m-0 mt-1">
                  <span className="font-semibold text-[var(--text)]">Reserved:</span> Credits held for in-flight requests
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Current Subscription Card */}
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Subscription</h2>
            <div className="flex size-10 items-center justify-center rounded-full bg-[var(--surface-muted)]">
              <TrendingUp className="size-5 text-[var(--brand)]" />
            </div>
          </div>

          {subscriptionError ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-[rgba(245,85,85,0.1)] p-3">
                <p className="m-0 text-sm text-[var(--error)]">{subscriptionError}</p>
              </div>
            </div>
          ) : subscriptionLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner label="Loading..." size="sm" />
            </div>
          ) : subscription ? (
            <div className="space-y-4">
              <div>
                <p className="m-0 text-sm text-[var(--text-muted)] mb-1">Plan</p>
                <p className="m-0 text-2xl font-semibold text-[var(--text)]">{subscription.planName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                  <p className="m-0 text-xs text-[var(--text-muted)] mb-1">Status</p>
                  <Badge
                    tone={subscription.status === 'active' ? 'success' : 'neutral'}
                    className="capitalize"
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                  <p className="m-0 text-xs text-[var(--text-muted)] mb-1">Credits</p>
                  <p className="m-0 text-lg font-bold text-[var(--success)]">
                    {subscription.creditEntitlement}
                  </p>
                </div>
              </div>
              {subscription.currentPeriodStart && (
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="mt-0.5 size-4 flex-shrink-0 text-[var(--text-muted)]" />
                  <div>
                    <p className="m-0 text-[var(--text-muted)]">
                      Started {formatDate(subscription.currentPeriodStart)}
                    </p>
                    {subscription.currentPeriodEnd && (
                      <p className="m-0 text-[var(--text-muted)]">
                        Expires {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <Link to="/pricing" className="inline-block w-full mt-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Browse Plans
                </Button>
              </Link>
            </div>
          ) : (
            <EmptyState
              title="No Active Subscription"
              description="Upgrade to get more AI enhancement credits."
              action={
                <Link to="/pricing">
                  <Button size="sm">View Plans</Button>
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <h2 className="m-0 mb-4 text-lg font-semibold text-[var(--text)]">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Link to="/pricing">
            <Button variant="secondary" size="md" className="w-full justify-center">
              <ArrowUpRight className="mr-2 size-4" />
              Browse Plans
            </Button>
          </Link>
          <Link to="/ai-enhancer">
            <Button variant="secondary" size="md" className="w-full justify-center">
              <TrendingUp className="mr-2 size-4" />
              AI Enhancer
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="secondary" size="md" className="w-full justify-center">
              <History className="mr-2 size-4" />
              Usage History
            </Button>
          </Link>
          <button
            onClick={() => {
              // Scroll to payment history
              const element = document.getElementById('payment-history')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-semibold text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <History className="mr-2 size-4" />
            Payments
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div id="payment-history" className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <h2 className="m-0 mb-6 text-lg font-semibold text-[var(--text)]">Payment History</h2>

        {paymentsError ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-[rgba(245,85,85,0.1)] p-3">
              <p className="m-0 text-sm text-[var(--error)]">{paymentsError}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRetryPayments}
              className="w-full"
            >
              Retry
            </Button>
          </div>
        ) : paymentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner label="Loading..." size="sm" />
          </div>
        ) : paymentHistory && paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                    Plan
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <td className="px-4 py-4 text-[var(--text)]">{payment.planName}</td>
                    <td className="px-4 py-4 text-[var(--text)]">
                      ${parseFloat(payment.amount).toFixed(2)} {payment.currency}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        tone={
                          payment.status === 'succeeded'
                            ? 'success'
                            : payment.status === 'failed'
                              ? 'neutral'
                              : 'brand'
                        }
                        className="capitalize text-xs"
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-muted)]">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paymentHistory.length > 0 && (
              <div className="mt-4 rounded-lg bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--text-muted)]">
                <p className="m-0">
                  Showing {paymentHistory.length} transaction{paymentHistory.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No Payment History"
            description="You haven't made any payments yet."
            action={
              <Link to="/pricing">
                <Button size="sm">View Plans</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}

export default BillingPage

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, BookOpen, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

import Button from '../components/ui/Button.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { getAIUsageHistory, getCreditHistory } from '../lib/billingApi.js'

const TAB_TYPES = {
  USAGE: 'usage',
  CREDITS: 'credits',
}

function HistoryPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(TAB_TYPES.USAGE)
  const [usageHistory, setUsageHistory] = useState([])
  const [creditHistory, setCreditHistory] = useState([])

  const [usageLoading, setUsageLoading] = useState(true)
  const [creditsLoading, setCreditsLoading] = useState(true)

  const [usageError, setUsageError] = useState('')
  const [creditsError, setCreditsError] = useState('')

  useDocumentMeta({
    title: 'Usage & Credit History — PromptMuse',
    description: 'View your AI usage and credit transaction history.',
  })

  // Load AI usage history
  useEffect(() => {
    let isMounted = true

    async function loadUsageHistory() {
      try {
        setUsageLoading(true)
        setUsageError('')

        const usage = await getAIUsageHistory()
        if (isMounted) {
          setUsageHistory(Array.isArray(usage) ? usage : [])
        }
      } catch (error) {
        if (isMounted) {
          setUsageError(error.message || 'Failed to load AI usage history.')
        }
      } finally {
        if (isMounted) {
          setUsageLoading(false)
        }
      }
    }

    if (user) {
      loadUsageHistory()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  // Load credit history
  useEffect(() => {
    let isMounted = true

    async function loadCreditHistory() {
      try {
        setCreditsLoading(true)
        setCreditsError('')

        const credits = await getCreditHistory()
        if (isMounted) {
          setCreditHistory(Array.isArray(credits) ? credits : [])
        }
      } catch (error) {
        if (isMounted) {
          setCreditsError(error.message || 'Failed to load credit history.')
        }
      } finally {
        if (isMounted) {
          setCreditsLoading(false)
        }
      }
    }

    if (user) {
      loadCreditHistory()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  const handleRetryUsage = () => {
    setUsageLoading(true)
    setUsageError('')
    getAIUsageHistory()
      .then((usage) => {
        setUsageHistory(Array.isArray(usage) ? usage : [])
        setUsageLoading(false)
      })
      .catch((error) => {
        setUsageError(error.message || 'Failed to load AI usage history.')
        setUsageLoading(false)
      })
  }

  const handleRetryCredits = () => {
    setCreditsLoading(true)
    setCreditsError('')
    getCreditHistory()
      .then((credits) => {
        setCreditHistory(Array.isArray(credits) ? credits : [])
        setCreditsLoading(false)
      })
      .catch((error) => {
        setCreditsError(error.message || 'Failed to load credit history.')
        setCreditsLoading(false)
      })
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  const formatEventType = (eventType) => {
    const types = {
      grant: 'Credits Granted',
      purchase: 'Purchase',
      reserve: 'Credits Reserved',
      consume: 'Credits Consumed',
      release: 'Credits Released',
      refund: 'Refund',
      expiration: 'Credits Expired',
    }
    return types[eventType] || eventType
  }

  const getEventTypeBadgeClass = (eventType) => {
    const classes = {
      grant: 'text-[var(--success)] bg-[rgba(34,197,94,0.1)]',
      purchase: 'text-[var(--brand)] bg-[rgba(59,130,246,0.1)]',
      reserve: 'text-[var(--brand-accent)] bg-[rgba(139,92,246,0.1)]',
      consume: 'text-[var(--text)] bg-[var(--surface-muted)]',
      release: 'text-[var(--success)] bg-[rgba(34,197,94,0.1)]',
      refund: 'text-[var(--brand)] bg-[rgba(59,130,246,0.1)]',
      expiration: 'text-[var(--error)] bg-[rgba(245,85,85,0.1)]',
    }
    return classes[eventType] || 'text-[var(--text-muted)] bg-[var(--surface-muted)]'
  }

  const formatUsageStatus = (status) => {
    const statuses = {
      completed: 'Completed',
      failed: 'Failed',
      pending: 'Pending',
    }
    return statuses[status] || status
  }

  const getUsageStatusBadgeClass = (status) => {
    const classes = {
      completed: 'text-[var(--success)] bg-[rgba(34,197,94,0.1)]',
      failed: 'text-[var(--error)] bg-[rgba(245,85,85,0.1)]',
      pending: 'text-[var(--brand-accent)] bg-[rgba(139,92,246,0.1)]',
    }
    return classes[status] || 'text-[var(--text-muted)] bg-[var(--surface-muted)]'
  }

  if (isAuthLoading) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] flex min-h-[60vh] items-center justify-center py-16">
        <LoadingSpinner label="Loading..." size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-12 pb-20">
      {/* Header with Back Button */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-5xl">
            Usage & Credit History
          </h1>
          <p className="m-0 mt-2 text-[var(--text-muted)]">
            View your AI enhancement usage and credit transactions
          </p>
        </div>
        <button
          onClick={() => navigate('/billing')}
          className="hidden flex-shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:flex"
        >
          <ArrowLeft className="size-4" />
          Back to Billing
        </button>
      </div>

      {/* Mobile Back Button */}
      <div className="mb-6 flex sm:hidden">
        <button
          onClick={() => navigate('/billing')}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-3 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab(TAB_TYPES.USAGE)}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition-all duration-200 ${
            activeTab === TAB_TYPES.USAGE
              ? 'border-[var(--brand)] text-[var(--brand)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <TrendingUp className="size-5" />
          <span>AI Usage History</span>
        </button>
        <button
          onClick={() => setActiveTab(TAB_TYPES.CREDITS)}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 font-semibold transition-all duration-200 ${
            activeTab === TAB_TYPES.CREDITS
              ? 'border-[var(--brand)] text-[var(--brand)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <BookOpen className="size-5" />
          <span>Credit Transactions</span>
        </button>
      </div>

      {/* AI Usage History Tab */}
      {activeTab === TAB_TYPES.USAGE && (
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <h2 className="m-0 mb-6 text-lg font-semibold text-[var(--text)]">AI Enhancement Usage</h2>

          {usageError ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-[rgba(245,85,85,0.1)] p-4">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-[var(--error)]" />
                  <div>
                    <p className="m-0 font-semibold text-[var(--error)]">Error Loading History</p>
                    <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">{usageError}</p>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRetryUsage}
                className="w-full"
              >
                Retry
              </Button>
            </div>
          ) : usageLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner label="Loading usage history..." size="sm" />
            </div>
          ) : usageHistory && usageHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Model
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Reserved
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Consumed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usageHistory.map((usage) => (
                    <tr
                      key={usage.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      <td className="px-4 py-4 text-[var(--text)]">
                        {formatDate(usage.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-[var(--text)]">
                        {usage.modelId || 'GPT-4'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getUsageStatusBadgeClass(
                            usage.status,
                          )}`}
                        >
                          {formatUsageStatus(usage.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-[var(--text)]">
                        {usage.reservedCredits}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-[var(--text)]">
                        {usage.consumedCredits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 rounded-lg bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--text-muted)]">
                <p className="m-0">
                  Showing {usageHistory.length} usage record{usageHistory.length !== 1 ? 's' : ''}
                  {usageHistory.length >= 50 ? ' (limited to last 50)' : ''}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No AI Usage"
              description="You haven't used any AI enhancements yet. Start with the AI Enhancer to see your usage history here."
            />
          )}
        </div>
      )}

      {/* Credit History Tab */}
      {activeTab === TAB_TYPES.CREDITS && (
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <h2 className="m-0 mb-6 text-lg font-semibold text-[var(--text)]">Credit Transactions</h2>

          {creditsError ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-[rgba(245,85,85,0.1)] p-4">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-[var(--error)]" />
                  <div>
                    <p className="m-0 font-semibold text-[var(--error)]">Error Loading History</p>
                    <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">{creditsError}</p>
                  </div>
                </div>
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
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner label="Loading credit history..." size="sm" />
            </div>
          ) : creditHistory && creditHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Event Type
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.map((credit) => (
                    <tr
                      key={credit.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      <td className="px-4 py-4 text-[var(--text)]">
                        {formatDate(credit.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEventTypeBadgeClass(
                            credit.eventType,
                          )}`}
                        >
                          {formatEventType(credit.eventType)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            credit.amount > 0
                              ? 'text-[var(--success)]'
                              : 'text-[var(--error)]'
                          }`}
                        >
                          {credit.amount > 0 ? '+' : ''}{credit.amount}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[var(--text-muted)] text-xs">
                        {credit.metadata?.description || credit.metadata?.reason || 'Transaction'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 rounded-lg bg-[var(--surface-muted)] px-4 py-2 text-xs text-[var(--text-muted)]">
                <p className="m-0">
                  Showing {creditHistory.length} transaction{creditHistory.length !== 1 ? 's' : ''}
                  {creditHistory.length >= 50 ? ' (limited to last 50)' : ''}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Credit Transactions"
              description="Your credit transaction history will appear here when you purchase or use credits."
            />
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage

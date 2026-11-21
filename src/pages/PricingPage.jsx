import { useEffect, useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { getPlans, activateFreeSubscription, getCurrentSubscription } from '../lib/billingApi.js'

function PricingPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [activatingPlanId, setActivatingPlanId] = useState(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)

  useDocumentMeta({
    title: 'Pricing — PromptTouch AI',
    description: 'Unlock AI-powered prompt enhancement with flexible pricing plans.',
    ogTitle: 'PromptTouch AI Pricing',
    ogDescription: 'Free, Starter, and Pro plans to enhance your creativity.',
  })

  // Load plans on mount
  useEffect(() => {
    let isMounted = true

    async function loadPlans() {
      try {
        setIsLoading(true)
        setError('')

        const fetchedPlans = await getPlans()

        if (isMounted) {
          const planOrder = ['free', 'starter', 'pro']
          const sortedPlans = Array.isArray(fetchedPlans)
            ? [...fetchedPlans].sort((a, b) => {
                const aIndex = planOrder.indexOf(a.key)
                const bIndex = planOrder.indexOf(b.key)
                if (aIndex === -1 && bIndex === -1) return 0
                if (aIndex === -1) return 1
                if (bIndex === -1) return -1
                return aIndex - bIndex
              })
            : []
          setPlans(sortedPlans)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load pricing plans.')
          setPlans([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPlans()

    return () => {
      isMounted = false
    }
  }, [])

  // Load current subscription if user is authenticated
  useEffect(() => {
    let isMounted = true

    async function loadSubscription() {
      if (!user) {
        setCurrentSubscription(null)
        return
      }

      try {
        setLoadingSubscription(true)
        const subscription = await getCurrentSubscription()

        if (isMounted) {
          setCurrentSubscription(subscription)
        }
      } catch (subError) {
        if (isMounted) {
          // Silently handle subscription fetch errors; don't block page
          console.error('Failed to load subscription:', subError)
        }
      } finally {
        if (isMounted) {
          setLoadingSubscription(false)
        }
      }
    }

    loadSubscription()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleFreePlanActivation = async (planId) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/pricing',
          },
          message: 'Log in to activate the Free plan.',
        },
      })
      return
    }

    if (currentSubscription) {
      toast.info('You already have an active subscription.')
      return
    }

    setActivatingPlanId(planId)

    try {
      await activateFreeSubscription(planId)
      toast.success('Free plan activated successfully!')

      // Refresh subscription info
      const subscription = await getCurrentSubscription()
      setCurrentSubscription(subscription)

      // Notify Header to refresh credit balance
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('creditBalanceUpdated'))
      }
    } catch (activationError) {
      toast.error(activationError.message || 'Failed to activate free plan.')
    } finally {
      setActivatingPlanId(null)
    }
  }

  const handlePaidPlanCheckout = (planId, planName) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/pricing',
          },
          message: 'Log in to proceed with checkout.',
        },
      })
      return
    }

    // Navigate to checkout with plan ID
    navigate(`/checkout?plan=${planId}`, {
      state: {
        planId,
        planName,
      },
    })
  }

  const isFreePlan = (plan) => plan.planType === 'free' || plan.purchaseType === 'free'
  const isPaidPlan = (plan) => plan.planType === 'paid'

  // Check if user has the current plan
  const hasCurrentPlan = (plan) => {
    if (!currentSubscription) return false
    return currentSubscription.planId === plan._id
  }

  // Retry loading
  const handleRetry = () => {
    setError('')
    setIsLoading(true)
    // Trigger reload by calling getPlans again
    getPlans()
      .then((fetchedPlans) => {
        setPlans(Array.isArray(fetchedPlans) ? fetchedPlans : [])
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Unable to load pricing plans.')
        setIsLoading(false)
      })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] flex min-h-[60vh] items-center justify-center py-16">
        <LoadingSpinner label="Loading pricing plans..." size="lg" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-16">
        <div className="flex flex-col items-center justify-center gap-6 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <div>
            <h2 className="m-0 text-2xl font-semibold text-[var(--text)]">Unable to Load Pricing</h2>
            <p className="m-0 mt-2 text-sm text-[var(--text-muted)]">{error}</p>
          </div>
          <Button onClick={handleRetry} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!plans || plans.length === 0) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-16">
        <div className="flex flex-col items-center justify-center gap-6 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <div>
            <h2 className="m-0 text-2xl font-semibold text-[var(--text)]">No Plans Available</h2>
            <p className="m-0 mt-2 text-sm text-[var(--text-muted)]">
              Pricing plans are not currently available. Please try again later.
            </p>
          </div>
          <Button onClick={handleRetry} variant="primary">
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-12 pb-20">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="m-0 mt-4 max-w-2xl text-base text-[var(--text-muted)] sm:text-lg mx-auto">
          Choose the perfect plan to enhance your creativity with AI-powered prompts.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isFree = isFreePlan(plan)
          const isPaid = isPaidPlan(plan)
          const isActive = hasCurrentPlan(plan)
          const isActivating = activatingPlanId === plan._id

          return (
            <div
              key={plan._id}
              className={`relative flex flex-col gap-6 rounded-[22px] border transition-all duration-200 p-6 sm:p-8 ${
                isActive
                  ? 'border-[var(--brand)] bg-[var(--surface)] shadow-[0_8px_32px_rgba(23,23,23,0.12)]'
                  : 'border-[var(--border)] bg-[var(--surface)]'
              }`}
            >
              {/* Current Plan Badge */}
              {isActive && (
                <div className="absolute -top-3 left-6">
                  <Badge tone="brand">Current Plan</Badge>
                </div>
              )}

              {/* Plan Info */}
              <div>
                <h3 className="m-0 text-xl font-semibold text-[var(--text)]">{plan.name}</h3>
                <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="border-t border-[var(--border)] pt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--text)]">
                    ${parseFloat(plan.priceAmount).toFixed(2)}
                  </span>
                  {!isFree && <span className="text-sm text-[var(--text-muted)]">one-time</span>}
                </div>
                <p className="m-0 mt-2 text-sm font-semibold text-[var(--brand)]">
                  {plan.creditEntitlement} Credits
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 border-t border-[var(--border)] pt-6">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 flex-shrink-0 text-[var(--success)]" />
                  <span className="text-sm text-[var(--text)]">
                    {plan.creditEntitlement > 0
                      ? `${plan.creditEntitlement} AI enhancement credits`
                      : 'Limited AI enhancements'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 flex-shrink-0 text-[var(--success)]" />
                  <span className="text-sm text-[var(--text)]">
                    {plan.creditExpirationPolicy === 'never' ? 'Credits never expire' : 'Credits expire monthly'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 flex-shrink-0 text-[var(--success)]" />
                  <span className="text-sm text-[var(--text)]">Full prompt enhancement features</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="border-t border-[var(--border)] pt-6">
                {isActive ? (
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    className="w-full justify-center"
                  >
                    Active Plan
                  </Button>
                ) : isFree ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleFreePlanActivation(plan._id)}
                    disabled={isAuthLoading || isActivating || loadingSubscription}
                    className="w-full justify-center"
                  >
                    {isActivating ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-flex size-4 rounded-full border-2 border-[color:var(--background)] border-t-[color:var(--text)] animate-spin" />
                        Activating...
                      </span>
                    ) : (
                      'Activate Free Plan'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handlePaidPlanCheckout(plan._id, plan.name)}
                    disabled={isAuthLoading}
                    className="w-full justify-center gap-2"
                  >
                    Get {plan.name}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>

              {/* Demo Badge for Paid Plans */}
              {isPaid && (
                <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-center">
                  <p className="m-0 text-xs font-semibold text-[var(--text-muted)]">DEMO PAYMENT</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-16 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h2 className="m-0 text-2xl font-semibold text-[var(--text)]">Questions about our plans?</h2>
        <p className="m-0 mt-2 text-[var(--text-muted)]">
          We're here to help. Contact our team for more information.
        </p>
      </div>
    </div>
  )
}

export default PricingPage

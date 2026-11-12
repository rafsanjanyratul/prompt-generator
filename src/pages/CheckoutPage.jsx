import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { AlertCircle, CheckCircle, Clock, ArrowRight, Home } from 'lucide-react'
import { toast } from 'react-toastify'

import Button from '../components/ui/Button.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { getPlans, initiateDemoPayment, verifyDemoPayment, getCurrentSubscription } from '../lib/billingApi.js'
import { trackEvent } from '../lib/analytics.js'

const PAYMENT_STATUS = {
  INIT: 'init',
  SELECTING: 'selecting',
  CONFIRMING: 'confirming',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILURE: 'failure',
  ERROR: 'error',
}

function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // State
  const [planId, setPlanId] = useState(null)
  const [plan, setPlan] = useState(null)
  const [status, setStatus] = useState(PAYMENT_STATUS.INIT)
  const [error, setError] = useState('')
  const [paymentId, setPaymentId] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useDocumentMeta({
    title: 'Checkout — PromptMuse',
    description: 'Complete your purchase with demo payment.',
  })

  // Extract and validate plan ID from URL
  useEffect(() => {
    const queryPlanId = searchParams.get('plan')

    if (!queryPlanId) {
      setStatus(PAYMENT_STATUS.ERROR)
      setError('No plan selected. Please select a plan from pricing.')
      return
    }

    setPlanId(queryPlanId)
    setStatus(PAYMENT_STATUS.SELECTING)
  }, [searchParams])

  // Fetch plan details when planId is set
  useEffect(() => {
    if (!planId || status !== PAYMENT_STATUS.SELECTING) return

    let isMounted = true

    async function loadPlan() {
      try {
        const plans = await getPlans()
        if (!isMounted) return

        const selectedPlan = Array.isArray(plans)
          ? plans.find((p) => p._id === planId)
          : null

        if (!selectedPlan) {
          setStatus(PAYMENT_STATUS.ERROR)
          setError('Selected plan not found. Please select a valid plan.')
          return
        }

        setPlan(selectedPlan)
        setStatus(PAYMENT_STATUS.CONFIRMING)
      } catch (err) {
        if (isMounted) {
          setStatus(PAYMENT_STATUS.ERROR)
          setError(err.message || 'Failed to load plan details.')
        }
      }
    }

    loadPlan()

    return () => {
      isMounted = false
    }
  }, [planId, status])

  // Handle checkout confirmation
  const handleConfirmCheckout = useCallback(async () => {
    if (!planId || !plan) {
      setStatus(PAYMENT_STATUS.ERROR)
      setError('Invalid plan. Please try again.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Step 1: Initiate demo payment
      trackEvent('checkout_initiated', {
        plan_id: planId,
        plan_name: plan.planName,
      })

      setStatus(PAYMENT_STATUS.PROCESSING)
      const initiateResponse = await initiateDemoPayment(planId)

      if (!initiateResponse || !initiateResponse.id) {
        throw new Error('Invalid payment response from server.')
      }

      const payId = initiateResponse.id
      setPaymentId(payId)

      // Step 2: Verify demo payment (backend controls outcome)
      // This is where backend determines success/failure
      const verifyResponse = await verifyDemoPayment(payId)

      if (!verifyResponse || !verifyResponse.payment) {
        throw new Error('Invalid verification response from server.')
      }

      const payment = verifyResponse.payment
      const subscription = verifyResponse.subscription || null

      // Step 3: Process result based on backend response
      if (payment.status === 'succeeded') {
        setPaymentResult({
          status: 'success',
          payment,
          subscription,
        })
        setStatus(PAYMENT_STATUS.SUCCESS)

        trackEvent('payment_succeeded', {
          payment_id: payId,
          plan_id: planId,
          plan_name: plan.planName,
        })

        toast.success('Payment successful! Subscription activated.')
      } else if (payment.status === 'failed') {
        setPaymentResult({
          status: 'failed',
          payment,
          subscription: null,
        })
        setStatus(PAYMENT_STATUS.FAILURE)

        trackEvent('payment_failed', {
          payment_id: payId,
          plan_id: planId,
          reason: payment.failureReason || 'Payment verification failed',
        })

        setError(payment.failureReason || 'Payment failed. Please try again.')
      } else if (payment.status === 'pending') {
        setPaymentResult({
          status: 'pending',
          payment,
          subscription: null,
        })
        setStatus(PAYMENT_STATUS.SUCCESS)

        toast.info('Payment is being processed. Please check your billing dashboard.')
      } else {
        throw new Error(`Unknown payment status: ${payment.status}`)
      }
    } catch (err) {
      if (setIsProcessing) {
        setStatus(PAYMENT_STATUS.ERROR)
        setError(err.message || 'An error occurred during checkout.')

        trackEvent('checkout_error', {
          plan_id: planId,
          error_message: err.message,
        })

        toast.error('Checkout failed. Please try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [planId, plan])

  // Render: Loading plan details
  if (status === PAYMENT_STATUS.SELECTING) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] flex min-h-[60vh] items-center justify-center py-16">
        <LoadingSpinner label="Loading plan details..." size="lg" />
      </div>
    )
  }

  // Render: Error loading plan
  if (status === PAYMENT_STATUS.ERROR) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-16">
        <div className="flex flex-col items-center justify-center gap-6 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <AlertCircle className="size-12 text-[var(--error)]" />
          <div>
            <h2 className="m-0 text-2xl font-semibold text-[var(--text)]">Checkout Error</h2>
            <p className="m-0 mt-2 text-sm text-[var(--text-muted)]">{error}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/pricing">
              <Button variant="primary">Back to Pricing</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Render: Successful payment
  if (status === PAYMENT_STATUS.SUCCESS && paymentResult) {
    const payment = paymentResult.payment
    const subscription = paymentResult.subscription

    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-12">
        {/* Success Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[var(--success)] bg-opacity-10 p-4">
              <CheckCircle className="size-16 text-[var(--success)]" />
            </div>
          </div>
          <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-[var(--text)]">
            Payment Successful!
          </h1>
          <p className="m-0 mt-3 text-lg text-[var(--text-muted)]">
            Your subscription is now active. Start enhancing your prompts!
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <h2 className="m-0 mb-6 text-lg font-semibold text-[var(--text)]">Payment Details</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Plan</span>
                <span className="font-semibold text-[var(--text)]">{plan.planName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Amount</span>
                <span className="font-semibold text-[var(--text)]">
                  ${parseFloat(payment.amount).toFixed(2)} {payment.currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Credits</span>
                <span className="font-semibold text-[var(--text)]">
                  {plan.creditEntitlement} credits
                </span>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Transaction ID</span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{payment.id}</span>
                </div>
              </div>

              <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
                <p className="m-0">
                  <strong>Demo Payment:</strong> This is a simulated transaction for testing purposes.
                </p>
              </div>
            </div>
          </div>

          {subscription && (
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <h2 className="m-0 mb-6 text-lg font-semibold text-[var(--text)]">
                Subscription Activated
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="m-0 text-sm text-[var(--text-muted)] mb-1">Plan</p>
                  <p className="m-0 text-2xl font-bold text-[var(--success)]">
                    {subscription.planName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                    <p className="m-0 text-xs text-[var(--text-muted)] mb-1">Credits</p>
                    <p className="m-0 text-lg font-bold text-[var(--success)]">
                      {subscription.creditEntitlement}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-3">
                    <p className="m-0 text-xs text-[var(--text-muted)] mb-1">Status</p>
                    <p className="m-0 text-lg font-bold capitalize text-[var(--brand)]">
                      {subscription.status}
                    </p>
                  </div>
                </div>

                {subscription.currentPeriodStart && (
                  <div className="rounded-lg bg-[var(--surface-muted)] p-3 text-sm">
                    <p className="m-0 text-[var(--text-muted)]">
                      Active from{' '}
                      <span className="font-semibold text-[var(--text)]">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/billing" className="flex-1 sm:flex-none">
            <Button variant="primary" size="md" className="w-full">
              <ArrowRight className="mr-2 size-4" />
              View Billing Dashboard
            </Button>
          </Link>
          <Link to="/ai-enhancer" className="flex-1 sm:flex-none">
            <Button variant="secondary" size="md" className="w-full">
              Start Enhancing
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Render: Failed payment
  if (status === PAYMENT_STATUS.FAILURE && paymentResult) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-12">
        {/* Failure Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[rgba(245,85,85,0.1)] p-4">
              <AlertCircle className="size-16 text-[var(--error)]" />
            </div>
          </div>
          <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-[var(--text)]">
            Payment Failed
          </h1>
          <p className="m-0 mt-3 text-lg text-[var(--text-muted)]">
            {error || 'Your demo payment could not be processed.'}
          </p>
        </div>

        {/* Error Details Card */}
        <div className="mb-8 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="space-y-4">
            <div className="rounded-lg bg-[rgba(245,85,85,0.1)] p-4">
              <p className="m-0 text-sm text-[var(--error)]">
                <strong>Demo Payment Status:</strong> This is a simulated transaction. The 90% success rate
                means sometimes payments intentionally fail for testing.
              </p>
            </div>

            {paymentResult.payment && (
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Transaction ID</span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {paymentResult.payment.id}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setStatus(PAYMENT_STATUS.CONFIRMING)
              setPaymentResult(null)
              setError('')
            }}
            className="flex-1 sm:flex-none"
          >
            Try Again
          </Button>
          <Link to="/pricing" className="flex-1 sm:flex-none">
            <Button variant="secondary" size="md" className="w-full">
              Back to Pricing
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Render: Checkout confirmation page
  if (status === PAYMENT_STATUS.CONFIRMING && plan) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-[var(--text)]">
            Review Your Purchase
          </h1>
          <p className="m-0 mt-3 text-lg text-[var(--text-muted)]">
            Confirm the details below to complete your purchase
          </p>
        </div>

        {/* Main Checkout Card */}
        <div className="mb-8 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="space-y-8">
            {/* Plan Details Section */}
            <div>
              <h2 className="m-0 mb-6 text-2xl font-semibold text-[var(--text)]">
                {plan.planName} Plan
              </h2>

              <div className="space-y-4">
                {/* Price */}
                <div className="rounded-lg bg-[var(--surface-elevated)] p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="m-0 text-sm text-[var(--text-muted)]">Price</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-[var(--text)]">
                          ${parseFloat(plan.price).toFixed(2)}
                        </span>
                        <span className="text-[var(--text-muted)]">{plan.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credits */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-4 text-center">
                    <p className="m-0 text-sm text-[var(--text-muted)] mb-2">Credits Included</p>
                    <p className="m-0 text-4xl font-bold text-[var(--success)]">
                      {plan.creditEntitlement}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-elevated)] p-4 text-center">
                    <p className="m-0 text-sm text-[var(--text-muted)] mb-2">Billing Period</p>
                    <p className="m-0 text-lg font-semibold capitalize text-[var(--text)]">
                      {plan.billingInterval || 'One-time'}
                    </p>
                  </div>
                </div>

                {/* Features list (if available) */}
                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="rounded-lg bg-[var(--surface-muted)] p-4">
                    <p className="m-0 mb-3 text-sm font-semibold text-[var(--text)]">Includes</p>
                    <ul className="m-0 list-inside space-y-2 text-sm text-[var(--text-muted)]">
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Demo Payment Warning */}
            <div className="border-t border-[var(--border)] pt-8">
              <div className="rounded-lg bg-[rgba(59,130,246,0.1)] p-4">
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-5 flex-shrink-0 text-[var(--brand)]" />
                  <div>
                    <p className="m-0 font-semibold text-[var(--brand)]">Demo Payment Mode</p>
                    <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">
                      This is a simulated payment for testing. No real charges will be made.
                      The payment has a 90% chance of success and 10% chance of failure to test
                      error scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="my-8 border-t border-[var(--border)]" />

          {/* Error Display */}
          {error && (
            <div className="mb-6 rounded-lg bg-[rgba(245,85,85,0.1)] p-4">
              <p className="m-0 text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link to="/pricing" className="flex-1">
              <Button variant="secondary" size="md" className="w-full" disabled={isProcessing}>
                Cancel
              </Button>
            </Link>
            <button
              onClick={handleConfirmCheckout}
              disabled={isProcessing}
              className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-full border-0 bg-[var(--brand)] px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 size-4" />
                  Complete Purchase
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center text-sm text-[var(--text-muted)]">
          <p className="m-0">
            By completing this purchase, you agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    )
  }

  // Fallback: Default state
  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] flex min-h-[60vh] items-center justify-center py-16">
      <EmptyState
        title="No Plan Selected"
        description="Please select a plan from the pricing page."
        action={
          <Link to="/pricing">
            <Button>Browse Plans</Button>
          </Link>
        }
      />
    </div>
  )
}

export default CheckoutPage

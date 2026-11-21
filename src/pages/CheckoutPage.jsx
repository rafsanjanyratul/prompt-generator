import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { toast } from 'react-toastify'

import Button from '../components/ui/Button.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { getPaymentStatus, getPlans, initiatePaymentCheckout } from '../lib/billingApi.js'
import { trackEvent } from '../lib/analytics.js'

const PAYMENT_STATUS = {
  INIT: 'init',
  SELECTING: 'selecting',
  CONFIRMING: 'confirming',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  PENDING: 'pending',
  FAILURE: 'failure',
  ERROR: 'error',
}

function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // State
  const [planId, setPlanId] = useState(null)
  const [plan, setPlan] = useState(null)
  const [status, setStatus] = useState(PAYMENT_STATUS.INIT)
  const [error, setError] = useState('')
  const [paymentResult, setPaymentResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    phone: '',
    address: '',
    city: '',
    country: '',
  })

  useDocumentMeta({
    title: 'Checkout — PromptTouch AI',
    description: 'Complete your purchase through secure hosted checkout.',
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
    const returnedPaymentId = searchParams.get('paymentId')

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

        if (returnedPaymentId) {
          const result = await getPaymentStatus(returnedPaymentId)
          if (!isMounted) return

          setPaymentResult(result)
          if (result.payment.status === 'succeeded') {
            setStatus(PAYMENT_STATUS.SUCCESS)
          } else if (['failed', 'canceled'].includes(result.payment.status)) {
            setStatus(PAYMENT_STATUS.FAILURE)
          } else {
            setStatus(PAYMENT_STATUS.PENDING)
          }
        } else {
          setStatus(PAYMENT_STATUS.CONFIRMING)
        }
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
  }, [planId, status, searchParams])

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
      if (Object.values(customerDetails).some((value) => !value.trim())) {
        throw new Error('Complete all billing contact fields to continue.')
      }

      trackEvent('checkout_initiated', {
        plan_id: planId,
        plan_name: plan.name,
      })

      setStatus(PAYMENT_STATUS.PROCESSING)
      const initiateResponse = await initiatePaymentCheckout(planId, customerDetails)

      if (!initiateResponse || !initiateResponse.id || !initiateResponse.checkoutUrl) {
        throw new Error('Invalid payment response from server.')
      }

      window.location.assign(initiateResponse.checkoutUrl)
    } catch (err) {
      setStatus(PAYMENT_STATUS.CONFIRMING)
      setError(err.message || 'An error occurred during checkout.')

      trackEvent('checkout_error', {
        plan_id: planId,
        error_message: err.message,
      })

      toast.error('Checkout failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [planId, plan, customerDetails])

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

  // Render: Successful or pending payment
  if ([PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.PENDING].includes(status) && paymentResult) {
    const payment = paymentResult.payment
    const subscription = paymentResult.subscription
    const isPending = status === PAYMENT_STATUS.PENDING

    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-12">
        {/* Payment Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className={`rounded-full p-4 ${isPending ? 'bg-[var(--surface-muted)]' : 'bg-[var(--success)] bg-opacity-10'}`}>
              {isPending
                ? <Clock className="size-16 text-[var(--brand)]" />
                : <CheckCircle className="size-16 text-[var(--success)]" />}
            </div>
          </div>
          <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-[var(--text)]">
            {isPending ? 'Payment Processing' : 'Payment Successful!'}
          </h1>
          <p className="m-0 mt-3 text-lg text-[var(--text-muted)]">
            {isPending
              ? 'We are waiting for the payment provider to confirm your payment.'
              : 'Your purchase is complete. Start enhancing your prompts!'}
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <h2 className="m-0 mb-6 text-lg font-semibold text-[var(--text)]">Payment Details</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Plan</span>
                <span className="font-semibold text-[var(--text)]">{payment.planName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Amount</span>
                <span className="font-semibold text-[var(--text)]">
                  {payment.amount} {payment.currency}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Credits</span>
                <span className="font-semibold text-[var(--text)]">
                  {payment.creditEntitlement} credits
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
                  <strong>Payment status:</strong> {payment.status}
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
            {error || 'Your payment could not be completed. Please try again.'}
          </p>
        </div>

        {/* Error Details Card */}
        <div className="mb-8 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="space-y-4">
            <div className="rounded-lg bg-[rgba(245,85,85,0.1)] p-4">
              <p className="m-0 text-sm text-[var(--error)]">
                Payment status: {paymentResult.payment?.status || 'failed'}.
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
              navigate(`/checkout?plan=${encodeURIComponent(planId)}`, { replace: true })
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
                {plan.name} Plan
              </h2>

              <div className="space-y-4">
                {/* Price */}
                <div className="rounded-lg bg-[var(--surface-elevated)] p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="m-0 text-sm text-[var(--text-muted)]">Price</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-[var(--text)]">
                          ${parseFloat(plan.priceAmount).toFixed(2)}
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

            {/* Billing details required for hosted payment */}
            <div className="border-t border-[var(--border)] pt-8">
              <div className="rounded-lg bg-[var(--surface-muted)] p-4">
                <p className="m-0 mb-4 font-semibold text-[var(--text)]">Billing details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['phone', 'Phone number', 'tel'],
                    ['address', 'Billing address', 'text'],
                    ['city', 'City', 'text'],
                    ['country', 'Country', 'text'],
                  ].map(([field, label, type]) => (
                    <label key={field} className="block text-sm font-medium text-[var(--text)]">
                      {label}
                      <input
                        type={type}
                        name={field}
                        value={customerDetails[field]}
                        autoComplete={field === 'phone' ? 'tel' : field === 'address' ? 'street-address' : field}
                        onChange={(event) =>
                          setCustomerDetails((details) => ({
                            ...details,
                            [field]: event.target.value,
                          }))
                        }
                        maxLength={field === 'phone' ? 25 : 50}
                        required
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
                      />
                    </label>
                  ))}
                </div>
                <p className="m-0 mt-4 text-sm text-[var(--text-muted)]">
                  You will continue to SSLCommerz hosted checkout to complete your payment.
                </p>
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
              className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-full border-0 bg-[var(--brand)] px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-black active:bg-[var(--brand-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:bg-white focus-visible:text-black disabled:cursor-not-allowed disabled:opacity-60"
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

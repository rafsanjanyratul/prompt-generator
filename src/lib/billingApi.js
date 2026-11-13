import { API_BASE_URL } from './promptsApi.js'

/**
 * Parse billing API response following the standard backend response format.
 * @param {Response} response - Fetch response object
 * @param {string} endpoint - Endpoint name for error messages
 * @returns {Promise<any>} Parsed data from response
 * @throws {Error} If request failed or response format is invalid
 */
async function parseBillingResponse(response, endpoint) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload && payload.message ? payload.message : `Request failed for ${endpoint}`
    const error = new Error(message)
    if (payload && payload.code) {
      error.code = payload.code
    }
    throw error
  }

  if (!payload || payload.success === false) {
    throw new Error(`Billing request failed for ${endpoint}`)
  }

  return payload
}

/**
 * Get authorization header with Bearer token.
 * @returns {Object} Authorization header object or empty object if no token
 * @throws {Error} If authentication is required but token is not available
 */
function getAuthHeader(requireAuth = true) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (requireAuth && !token) {
    throw new Error('Authentication required')
  }

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  return {}
}

// ============================================================================
// PUBLIC ENDPOINTS (No authentication required)
// ============================================================================

/**
 * Fetch all active billing plans (Free, Starter, Pro).
 * @returns {Promise<Object[]>} Array of plan objects with pricing and credit entitlements
 */
export async function getPlans() {
  const response = await fetch(`${API_BASE_URL}/billing/plans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const payload = await parseBillingResponse(response, '/billing/plans')
  return payload.plans
}

// ============================================================================
// SUBSCRIPTION ENDPOINTS (Authentication required)
// ============================================================================

/**
 * Activate the Free plan subscription for the authenticated user.
 * @param {string} planId - MongoDB ID of the free plan
 * @returns {Promise<Object>} Activated subscription details
 */
export async function activateFreeSubscription(planId) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/billing/subscription/activate-free`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  })

  const payload = await parseBillingResponse(response, '/billing/subscription/activate-free')
  return payload.subscription
}

/**
 * Get the current subscription for the authenticated user.
 * @returns {Promise<Object|null>} Current subscription details or null if not subscribed
 */
export async function getCurrentSubscription() {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/billing/subscription/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await parseBillingResponse(response, '/billing/subscription/current')
  return payload.subscription
}

// ============================================================================
// PAYMENT ENDPOINTS (Authentication required)
// ============================================================================

/**
 * Initialize an SSLCommerz hosted checkout for a paid plan.
 * @param {string} planId - MongoDB ID of the paid plan
 * @param {Object} customer - Billing contact and address details
 * @returns {Promise<Object>} Payment transaction details and hosted checkout URL
 */
export async function initiatePaymentCheckout(planId, customer) {
  const response = await fetch(`${API_BASE_URL}/billing/payments/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ planId, customer }),
  })

  const payload = await parseBillingResponse(response, '/billing/payments/checkout')
  return payload.payment
}

/**
 * Retrieve the authenticated user's authoritative payment status after provider return.
 * @param {string} paymentId - MongoDB ID of the payment transaction
 * @returns {Promise<Object>} Payment and optional subscription details
 */
export async function getPaymentStatus(paymentId) {
  const response = await fetch(
    `${API_BASE_URL}/billing/payments/status/${encodeURIComponent(paymentId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    },
  )

  const payload = await parseBillingResponse(response, '/billing/payments/status')
  return {
    payment: payload.payment,
    subscription: payload.subscription || null,
  }
}

/**
 * Get payment transaction history for the authenticated user.
 * @returns {Promise<Object[]>} Array of payment transactions
 */
export async function getPaymentHistory() {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/billing/payments/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await parseBillingResponse(response, '/billing/payments/history')
  return payload.payments
}

// ============================================================================
// CREDIT ENDPOINTS (Authentication required)
// ============================================================================

/**
 * Get current credit balance for the authenticated user.
 * @returns {Promise<Object>} Object with availableCredits, reservedCredits, and totalCredits
 */
export async function getCreditBalance() {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/billing/credits/balance`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await parseBillingResponse(response, '/billing/credits/balance')
  return {
    availableCredits: payload.availableCredits,
    reservedCredits: payload.reservedCredits,
    totalCredits: payload.totalCredits,
  }
}

/**
 * Get credit transaction history for the authenticated user.
 * @param {number} [limit=50] - Maximum number of records to return
 * @returns {Promise<Object[]>} Array of credit ledger entries
 */
export async function getCreditHistory(limit = 50) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/billing/credits/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await parseBillingResponse(response, '/billing/credits/history')
  return payload.history
}

// ============================================================================
// USAGE ENDPOINTS (Authentication required)
// ============================================================================

/**
 * Get AI enhancement usage history for the authenticated user.
 * @param {number} [limit=50] - Maximum number of records to return
 * @returns {Promise<Object[]>} Array of AI usage entries with credit consumption details
 */
export async function getAIUsageHistory(limit = 50) {
  const token = localStorage.getItem('promptmuse-auth-token')

  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_BASE_URL}/billing/usage/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await parseBillingResponse(response, '/billing/usage/history')
  return payload.usage
}

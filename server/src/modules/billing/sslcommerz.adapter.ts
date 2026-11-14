import { env } from '../../config/env.js'

const requestTimeoutMs = 15_000

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

export type SslCommerzMode = 'sandbox' | 'live'

type CheckoutCustomer = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
}

type CheckoutCallbacks = {
  successUrl: string
  failUrl: string
  cancelUrl: string
  ipnUrl: string
}

type ProviderResponse = Record<string, unknown>

export type SslCommerzValidation = {
  status: string
  transactionId: string
  validationId: string
  amount: string
  currency: string
  currencyAmount: string
  currencyType: string
  cardType: string
  bankTransactionId: string
}

export const getSslCommerzMode = (): SslCommerzMode =>
  env.SSLCOMMERZ_IS_SANDBOX ? 'sandbox' : 'live'

const getApiOrigin = (mode: SslCommerzMode) =>
  mode === 'sandbox'
    ? 'https://sandbox.sslcommerz.com'
    : 'https://securepay.sslcommerz.com'

const getCredentials = () => {
  if (!env.SSLCOMMERZ_STORE_ID || !env.SSLCOMMERZ_STORE_PASSWORD) {
    throw createHttpError(503, 'Payment provider is not configured')
  }

  return {
    storeId: env.SSLCOMMERZ_STORE_ID,
    storePassword: env.SSLCOMMERZ_STORE_PASSWORD,
  }
}

export const assertSslCommerzConfigured = () => {
  getCredentials()
}

const requestJson = async (url: string, init: RequestInit): Promise<ProviderResponse> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    if (!response.ok) {
      throw createHttpError(502, 'Payment provider request failed')
    }

    const payload: unknown = await response.json().catch(() => null)
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw createHttpError(502, 'Payment provider returned an invalid response')
    }

    return payload as ProviderResponse
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw createHttpError(504, 'Payment provider request timed out')
    }
    throw createHttpError(502, 'Unable to reach the payment provider')
  } finally {
    clearTimeout(timeout)
  }
}

const getString = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''

export async function initializeSslCommerzCheckout(input: {
  mode: SslCommerzMode
  amount: string
  currency: string
  transactionId: string
  productName: string
  customer: CheckoutCustomer
  callbacks: CheckoutCallbacks
}) {
  const credentials = getCredentials()
  const request = new URLSearchParams({
    store_id: credentials.storeId,
    store_passwd: credentials.storePassword,
    total_amount: input.amount,
    currency: input.currency,
    tran_id: input.transactionId,
    success_url: input.callbacks.successUrl,
    fail_url: input.callbacks.failUrl,
    cancel_url: input.callbacks.cancelUrl,
    ipn_url: input.callbacks.ipnUrl,
    cus_name: input.customer.name,
    cus_email: input.customer.email,
    cus_add1: input.customer.address,
    cus_city: input.customer.city,
    cus_country: input.customer.country,
    cus_phone: input.customer.phone,
    shipping_method: 'NO',
    product_name: input.productName,
    product_category: 'software',
    product_profile: 'non-physical-goods',
    num_of_item: '1',
  })

  const payload = await requestJson(`${getApiOrigin(input.mode)}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: request,
  })

  const checkoutUrl = getString(payload.GatewayPageURL)
  const sessionKey = getString(payload.sessionkey)
  const reportedTransactionId = getString(payload.tran_id)

  if (
    getString(payload.status).toUpperCase() !== 'SUCCESS' ||
    !checkoutUrl ||
    !sessionKey ||
    (reportedTransactionId && reportedTransactionId !== input.transactionId)
  ) {
    throw createHttpError(502, 'Payment provider could not initialize checkout')
  }

  let parsedCheckoutUrl: URL
  try {
    parsedCheckoutUrl = new URL(checkoutUrl)
  } catch {
    throw createHttpError(502, 'Payment provider returned an invalid checkout URL')
  }

  if (
    parsedCheckoutUrl.protocol !== 'https:' ||
    parsedCheckoutUrl.hostname !== new URL(getApiOrigin(input.mode)).hostname
  ) {
    throw createHttpError(502, 'Payment provider returned an invalid checkout URL')
  }

  return { checkoutUrl: parsedCheckoutUrl.toString(), sessionKey }
}

export async function validateSslCommerzTransaction(input: {
  mode: SslCommerzMode
  validationId: string
}): Promise<SslCommerzValidation> {
  const credentials = getCredentials()
  const url = new URL(`${getApiOrigin(input.mode)}/validator/api/validationserverAPI.php`)
  url.search = new URLSearchParams({
    val_id: input.validationId,
    store_id: credentials.storeId,
    store_passwd: credentials.storePassword,
    format: 'json',
  }).toString()

  const payload = await requestJson(url.toString(), { method: 'GET' })

  // The documented validation response can omit store_id; verify it when present.
  if (Object.hasOwn(payload, 'store_id') && getString(payload.store_id) !== credentials.storeId) {
    throw createHttpError(409, 'Payment validation did not match the pending transaction')
  }

  return {
    status: getString(payload.status).toUpperCase(),
    transactionId: getString(payload.tran_id),
    validationId: getString(payload.val_id),
    amount: getString(payload.amount),
    currency: getString(payload.currency).toUpperCase(),
    currencyAmount: getString(payload.currency_amount),
    currencyType: getString(payload.currency_type).toUpperCase(),
    cardType: getString(payload.card_type),
    bankTransactionId: getString(payload.bank_tran_id),
  }
}

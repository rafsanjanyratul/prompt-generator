import assert from 'node:assert/strict'
import test from 'node:test'

Object.assign(process.env, {
  NODE_ENV: 'test',
  API_BASE_URL: 'http://localhost:5000',
  SSLCOMMERZ_IS_SANDBOX: 'true',
  SSLCOMMERZ_STORE_ID: 'test-store',
  SSLCOMMERZ_STORE_PASSWORD: 'test-password',
  MONGODB_URI: 'mongodb://localhost/test',
  GOOGLE_CLIENT_ID: 'test',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '25',
  SMTP_USER: 'test',
  SMTP_PASS: 'test',
  SMTP_FROM: 'test@example.com',
  JWT_SECRET: 'test-secret-with-at-least-32-characters',
  CLOUDINARY_CLOUD_NAME: 'test',
  CLOUDINARY_API_KEY: 'test',
  CLOUDINARY_API_SECRET: 'test',
})

const { env } = await import('../src/config/env.ts')
const { PaymentTransaction } = await import('../src/modules/billing/payment-transaction.model.ts')
const { Subscription } = await import('../src/modules/billing/subscription.model.ts')
const { processSslCommerzNotification } = await import('../src/modules/billing/payment.service.ts')

const transactionId = 'pm-0123456789abcdef01234567'
const validationId = 'validation-test'
const payment = {
  _id: { toString: () => '0123456789abcdef01234567' },
  merchantTransactionRef: transactionId,
  providerSessionRef: 'different-provider-session',
  amount: { toString: () => '9.99' },
  currency: 'USD',
  mode: 'sandbox',
  status: 'succeeded',
}
PaymentTransaction.findOne = async (query) => {
  assert.equal(query.provider, 'sslcommerz')
  assert.equal(query.merchantTransactionRef, transactionId)
  return payment
}
PaymentTransaction.findOneAndUpdate = () => {
  throw new Error('Unexpected database write')
}
Subscription.findOne = async () => null

const baseResponse = {
  status: 'VALID',
  tran_id: transactionId,
  val_id: validationId,
  amount: '1200.00',
  currency: 'BDT',
  currency_amount: '9.99',
  currency_type: 'USD',
  card_type: 'VISA',
}
let response = baseResponse
let calls = 0
globalThis.fetch = async (url, options) => {
  calls++
  const parsed = new URL(url)
  assert.equal(parsed.origin, 'https://sandbox.sslcommerz.com')
  assert.equal(parsed.pathname, '/validator/api/validationserverAPI.php')
  assert.equal(parsed.searchParams.get('store_id'), 'test-store')
  assert.equal(parsed.searchParams.get('store_passwd'), 'test-password')
  assert.equal(parsed.searchParams.get('val_id'), validationId)
  assert.equal(options.method, 'GET')
  return new Response(JSON.stringify(response), { status: 200 })
}

const run = () => processSslCommerzNotification({ transactionId, validationId })
const mismatch = 'Payment validation did not match the pending transaction'

test('validates original currency and retains transaction and merchant checks', async () => {
  response = { ...baseResponse }
  assert.equal((await run()).payment, payment)
  response = { ...baseResponse, status: 'VALIDATED', store_id: 'test-store', currency_type: 'usd' }
  assert.equal((await run()).payment, payment)

  payment.amount = { toString: () => '9.90' }
  response = { ...baseResponse, currency_amount: '9.9' }
  assert.equal((await run()).payment, payment)
  payment.amount = { toString: () => '1200.00' }
  payment.currency = 'BDT'
  response = { ...baseResponse, currency_amount: '1200.00', currency_type: 'BDT' }
  assert.equal((await run()).payment, payment)
  payment.amount = { toString: () => '9.99' }
  payment.currency = 'USD'

  for (const overrides of [
    { currency_amount: '1200.00' },
    { currency_amount: '' },
    { currency_amount: undefined },
    { currency_amount: '9.999' },
    { currency_type: 'BDT' },
    { currency_type: '' },
    { currency_type: undefined },
    { tran_id: 'different-transaction' },
    { val_id: 'different-validation' },
    { store_id: 'different-store' },
    { store_id: '' },
    { store_id: null },
  ]) {
    response = { ...baseResponse, ...overrides }
    await assert.rejects(run, (error) => error.statusCode === 409 && error.message === mismatch)
  }

  response = { ...baseResponse, status: 'INVALID_TRANSACTION' }
  await assert.rejects(run, /Payment provider returned an unverified transaction status/)
  response = { ...baseResponse, card_type: '' }
  await assert.rejects(run, /Payment validation did not include a payment mode/)

  response = { ...baseResponse }
  env.SSLCOMMERZ_IS_SANDBOX = false
  await assert.rejects(run, /Payment validation did not match/)
  env.SSLCOMMERZ_IS_SANDBOX = true
  env.SSLCOMMERZ_STORE_PASSWORD = undefined
  const callsBeforeMissingCredentials = calls
  await assert.rejects(run, (error) => error.statusCode === 503)
  assert.equal(calls, callsBeforeMissingCredentials)
})

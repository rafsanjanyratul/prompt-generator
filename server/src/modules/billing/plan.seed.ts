import { Plan } from './plan.model.js'

const plans = [
  {
    key: 'free',
    version: 1,
    planType: 'free' as const,
    purchaseType: 'free' as const,
    name: 'Free',
    description: 'Get started with free prompt enhancements',
    isActive: true,
    billingInterval: null,
    priceAmount: '0',
    currency: 'USD',
    creditEntitlement: 0,
    creditExpirationPolicy: 'never' as const,
  },
  {
    key: 'starter',
    version: 1,
    planType: 'paid' as const,
    purchaseType: 'one_time' as const,
    name: 'Starter',
    description: 'One-time purchase for 100 credits',
    isActive: true,
    billingInterval: null,
    priceAmount: '9.99',
    currency: 'USD',
    creditEntitlement: 100,
    creditExpirationPolicy: 'never' as const,
  },
  {
    key: 'pro',
    version: 1,
    planType: 'paid' as const,
    purchaseType: 'one_time' as const,
    name: 'Pro',
    description: 'One-time purchase for 500 credits',
    isActive: true,
    billingInterval: null,
    priceAmount: '39.99',
    currency: 'USD',
    creditEntitlement: 500,
    creditExpirationPolicy: 'never' as const,
  },
]

export async function seedDemoPlanIfNotExists() {
  const freePlanExists = await Plan.findOne({ key: 'free', version: 1 })
  if (!freePlanExists) {
    await Plan.insertMany(plans)
    console.log('Demo plans seeded successfully')
  }
}

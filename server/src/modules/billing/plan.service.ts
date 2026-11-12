import { Plan, type PlanFields } from './plan.model.js'

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

export async function getActivePlans() {
  const plans = await Plan.find(
    { isActive: true },
    {
      key: 1,
      version: 1,
      planType: 1,
      purchaseType: 1,
      name: 1,
      description: 1,
      billingInterval: 1,
      priceAmount: 1,
      currency: 1,
      creditEntitlement: 1,
      creditExpirationPolicy: 1,
    },
  )

  return plans
}

export async function getPlanById(planId: string) {
  const plan = await Plan.findById(planId)
    .select(
      'key version planType purchaseType name description billingInterval priceAmount currency creditEntitlement creditExpirationPolicy',
    )

  return plan
}

export async function validatePlanEligibility(planId: string) {
  const plan = await Plan.findById(planId)

  if (!plan) {
    throw createHttpError(404, 'Plan not found')
  }

  if (!plan.isActive) {
    throw createHttpError(400, 'Plan is not available')
  }

  return plan
}

export async function capturePlanSnapshot(plan: any) {
  return {
    key: plan.key,
    version: plan.version,
    planType: plan.planType,
    purchaseType: plan.purchaseType,
    name: plan.name,
    billingInterval: plan.billingInterval ?? null,
    priceAmount: plan.priceAmount,
    currency: plan.currency,
    creditEntitlement: plan.creditEntitlement,
    creditExpirationPolicy: plan.creditExpirationPolicy,
  }
}

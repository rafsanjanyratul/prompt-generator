# Exact Code Changes — Free Plan Race Condition Fix

**Date**: 2026-11-12  
**Validation**: TypeScript EXIT CODE 0 ✅

---

## File 1: subscription.model.ts

**Location**: `server/src/modules/billing/subscription.model.ts`
**Change Type**: Add unique partial index
**Lines Modified**: 118-125 (8 lines added)

### Before
```typescript
subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index(
  { provider: 1, providerMode: 1, providerSubscriptionRef: 1 },
  {
    unique: true,
    partialFilterExpression: { providerSubscriptionRef: { $type: 'string' } },
  },
)
```

### After
```typescript
subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'unique_active_subscription_per_user',
  },
)
subscriptionSchema.index(
  { provider: 1, providerMode: 1, providerSubscriptionRef: 1 },
  {
    unique: true,
    partialFilterExpression: { providerSubscriptionRef: { $type: 'string' } },
  },
)
```

### Diff
```diff
  subscriptionSchema.index({ userId: 1, status: 1 })
+ subscriptionSchema.index(
+   { userId: 1, status: 1 },
+   {
+     unique: true,
+     partialFilterExpression: { status: 'active' },
+     name: 'unique_active_subscription_per_user',
+   },
+ )
  subscriptionSchema.index(
    { provider: 1, providerMode: 1, providerSubscriptionRef: 1 },
```

---

## File 2: subscription.service.ts

**Location**: `server/src/modules/billing/subscription.service.ts`
**Change Type**: Add error handling
**Lines Modified**: 11-12 (helper), 35-88 (function)

### Change 1: Add Helper Function (lines 11-12)

#### Before
```typescript
const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const toObjectId = (value: string) => {
```

#### After
```typescript
const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number }
  error.statusCode = statusCode
  return error
}

const isDuplicateKeyError = (error: unknown) =>
  error instanceof Error && 'code' in error && error.code === 11000

const toObjectId = (value: string) => {
```

#### Diff
```diff
  const createHttpError = (statusCode: number, message: string) => {
    const error = new Error(message) as Error & { statusCode?: number }
    error.statusCode = statusCode
    return error
  }
  
+ const isDuplicateKeyError = (error: unknown) =>
+   error instanceof Error && 'code' in error && error.code === 11000
  
  const toObjectId = (value: string) => {
```

---

### Change 2: Enhance activateFreeSubscription() (lines 35-88)

#### Before
```typescript
export async function activateFreeSubscription(
  userId: string,
  freePlanId: string,
): Promise<HydratedDocument<SubscriptionFields>> {
  const userObjectId = toObjectId(userId)
  const planId = toObjectId(freePlanId)

  const plan = await Plan.findById(planId)
  if (!plan) {
    throw createHttpError(404, 'Free plan not found')
  }

  if (plan.planType !== 'free' || plan.purchaseType !== 'free') {
    throw createHttpError(400, 'Selected plan is not a free plan')
  }

  const existing = await Subscription.findOne({
    userId: userObjectId,
    status: 'active',
  })

  if (existing && existing.status === 'active') {
    return existing
  }

  const now = new Date()
  const subscription = new Subscription({
    userId: userObjectId,
    planId,
    planSnapshot: await capturePlanSnapshot(plan),
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: null,
    autoRenew: false,
    nextBillingAt: null,
  })

  await subscription.save()
  return subscription
}
```

#### After
```typescript
export async function activateFreeSubscription(
  userId: string,
  freePlanId: string,
): Promise<HydratedDocument<SubscriptionFields>> {
  const userObjectId = toObjectId(userId)
  const planId = toObjectId(freePlanId)

  const plan = await Plan.findById(planId)
  if (!plan) {
    throw createHttpError(404, 'Free plan not found')
  }

  if (plan.planType !== 'free' || plan.purchaseType !== 'free') {
    throw createHttpError(400, 'Selected plan is not a free plan')
  }

  const existing = await Subscription.findOne({
    userId: userObjectId,
    status: 'active',
  })

  if (existing && existing.status === 'active') {
    return existing
  }

  const now = new Date()
  const subscription = new Subscription({
    userId: userObjectId,
    planId,
    planSnapshot: await capturePlanSnapshot(plan),
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: null,
    autoRenew: false,
    nextBillingAt: null,
  })

  try {
    await subscription.save()
    return subscription
  } catch (error) {
    // Handle race condition: another concurrent request may have created the active subscription
    if (isDuplicateKeyError(error)) {
      const duplicateSubscription = await Subscription.findOne({
        userId: userObjectId,
        status: 'active',
      })
      if (duplicateSubscription) {
        return duplicateSubscription
      }
    }
    throw error
  }
}
```

#### Diff
```diff
  export async function activateFreeSubscription(
    userId: string,
    freePlanId: string,
  ): Promise<HydratedDocument<SubscriptionFields>> {
    const userObjectId = toObjectId(userId)
    const planId = toObjectId(freePlanId)
  
    const plan = await Plan.findById(planId)
    if (!plan) {
      throw createHttpError(404, 'Free plan not found')
    }
  
    if (plan.planType !== 'free' || plan.purchaseType !== 'free') {
      throw createHttpError(400, 'Selected plan is not a free plan')
    }
  
    const existing = await Subscription.findOne({
      userId: userObjectId,
      status: 'active',
    })
  
    if (existing && existing.status === 'active') {
      return existing
    }
  
    const now = new Date()
    const subscription = new Subscription({
      userId: userObjectId,
      planId,
      planSnapshot: await capturePlanSnapshot(plan),
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: null,
      autoRenew: false,
      nextBillingAt: null,
    })
  
+   try {
      await subscription.save()
      return subscription
+   } catch (error) {
+     // Handle race condition: another concurrent request may have created the active subscription
+     if (isDuplicateKeyError(error)) {
+       const duplicateSubscription = await Subscription.findOne({
+         userId: userObjectId,
+         status: 'active',
+       })
+       if (duplicateSubscription) {
+         return duplicateSubscription
+       }
+     }
+     throw error
+   }
  }
```

---

## Summary

**Total Changes**: 22 lines added across 2 files

| File | Addition | Type |
|------|----------|------|
| `subscription.model.ts` | Unique partial index | Database constraint |
| `subscription.service.ts` | Helper + error handling | Application resilience |

**No deletions or modifications to existing logic** ✅

**Validation**: TypeScript EXIT CODE 0 ✅

---

## Deployment

1. Apply both changes to target codebase
2. Verify no existing duplicate active subscriptions
3. Deploy and verify index creation in MongoDB
4. Test concurrent activation requests
5. Monitor error logs for E11000 handling

---

**Ready for production deployment** ✅

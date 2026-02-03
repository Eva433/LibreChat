# Stripe Integration Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete Stripe payment integration by building React frontend components for recharge functionality, connecting to existing backend APIs, and enabling users to purchase token credits.

**Architecture:** React/TypeScript frontend with TanStack Query for API calls, Stripe Checkout for payment flow, and reusable component design. Backend APIs already implemented at `/api/recharge/*`. Flow: User selects tier → Frontend creates Checkout Session → Redirects to Stripe → Webhook processes payment → User sees updated balance.

**Tech Stack:** React 18, TypeScript, TanStack Query, Tailwind CSS, Stripe.js, Recoil (state management), i18next (translations)

---

## Prerequisites Check

**Before starting:**
- ✅ Backend API routes implemented at `/api/recharge/*`
- ✅ Stripe service and webhook handler created
- ✅ Auto-refill disabled in `librechat.yaml`
- ⚠️ Need Stripe test keys configured in `.env`

---

## Task 1: Create Pricing Tier Type Definitions

**Files:**
- Create: `client/src/types/recharge.ts`

**Step 1: Create TypeScript types for pricing and recharge**

```typescript
// client/src/types/recharge.ts

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number; // in cents
  discount: number; // percentage
}

export interface RechargeHistory {
  id: string;
  credits: number;
  amount: number;
  currency: string;
  tierId: string;
  sessionId: string;
  createdAt: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PricingResponse {
  enabled: boolean;
  tiers: PricingTier[];
}

export interface VerifySessionResponse {
  sessionId: string;
  paymentStatus: string;
  isPaid: boolean;
  credits: number;
  tierId: string;
  amountTotal: number;
}
```

**Step 2: Verify types compile**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add client/src/types/recharge.ts
git commit -m "feat: add TypeScript types for Stripe recharge"
```

---

## Task 2: Create Recharge API Client Hooks

**Files:**
- Create: `client/src/hooks/Recharge/useRechargeQueries.ts`
- Reference: `packages/data-provider/src/api.ts` for API client pattern

**Step 1: Create TanStack Query hooks for recharge APIs**

```typescript
// client/src/hooks/Recharge/useRechargeQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  PricingResponse,
  CreateCheckoutSessionResponse,
  RechargeHistory,
  VerifySessionResponse,
} from '~/types/recharge';

const BASE_URL = '/api/recharge';

// Query keys
export const RechargeKeys = {
  all: ['recharge'] as const,
  pricing: () => [...RechargeKeys.all, 'pricing'] as const,
  history: () => [...RechargeKeys.all, 'history'] as const,
  verifySession: (sessionId: string) =>
    [...RechargeKeys.all, 'verify', sessionId] as const,
};

// Fetch pricing tiers
export const usePricingQuery = () => {
  return useQuery<PricingResponse>({
    queryKey: RechargeKeys.pricing(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/pricing`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pricing');
      }
      return response.json();
    },
  });
};

// Create Stripe Checkout Session
export const useCreateCheckoutSession = () => {
  return useMutation<CreateCheckoutSessionResponse, Error, { tierId: string }>({
    mutationFn: async ({ tierId }) => {
      const response = await fetch(`${BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tierId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }
      return response.json();
    },
  });
};

// Fetch recharge history
export const useRechargeHistoryQuery = (limit = 10) => {
  return useQuery<{ history: RechargeHistory[] }>({
    queryKey: [...RechargeKeys.history(), limit],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/history?limit=${limit}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recharge history');
      }
      return response.json();
    },
  });
};

// Verify payment session
export const useVerifySessionQuery = (sessionId: string | null) => {
  return useQuery<VerifySessionResponse>({
    queryKey: RechargeKeys.verifySession(sessionId || ''),
    queryFn: async () => {
      if (!sessionId) {
        throw new Error('No session ID provided');
      }
      const response = await fetch(`${BASE_URL}/verify-session/${sessionId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to verify session');
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
};
```

**Step 2: Verify hooks compile**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add client/src/hooks/Recharge/useRechargeQueries.ts
git commit -m "feat: add TanStack Query hooks for recharge API"
```

---

## Task 3: Create Pricing Tier Card Component

**Files:**
- Create: `client/src/components/Recharge/PricingCard.tsx`

**Step 1: Create pricing card component**

```typescript
// client/src/components/Recharge/PricingCard.tsx

import React from 'react';
import type { PricingTier } from '~/types/recharge';

interface PricingCardProps {
  tier: PricingTier;
  onSelect: (tierId: string) => void;
  isLoading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  onSelect,
  isLoading = false
}) => {
  const formattedPrice = (tier.price / 100).toFixed(2);
  const formattedCredits = (tier.credits / 1000000).toFixed(1);

  return (
    <div className="relative flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
      {tier.discount > 0 && (
        <div className="absolute -top-3 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
          {tier.discount}% OFF
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {tier.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tier.description}
        </p>
      </div>

      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          ${formattedPrice}
        </span>
      </div>

      <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between">
          <span>Credits:</span>
          <span className="font-semibold">{formattedCredits}M</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(tier.id)}
        disabled={isLoading}
        className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Processing...' : 'Purchase'}
      </button>
    </div>
  );
};
```

**Step 2: Verify component compiles**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add client/src/components/Recharge/PricingCard.tsx
git commit -m "feat: add PricingCard component for tier display"
```

---

## Task 4: Create Main Recharge Page Component

**Files:**
- Create: `client/src/components/Recharge/RechargePage.tsx`

**Step 1: Create main recharge page with pricing grid**

```typescript
// client/src/components/Recharge/RechargePage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingCard } from './PricingCard';
import { usePricingQuery, useCreateCheckoutSession } from '~/hooks/Recharge/useRechargeQueries';
import { useToastContext } from '~/Providers/ToastContext';

export const RechargePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { data, isLoading, error } = usePricingQuery();
  const createCheckoutMutation = useCreateCheckoutSession();

  const handleSelectTier = async (tierId: string) => {
    try {
      const result = await createCheckoutMutation.mutateAsync({ tierId });

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to start payment',
        status: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          Loading pricing...
        </div>
      </div>
    );
  }

  if (error || !data?.enabled) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="text-lg font-semibold text-red-600">
          Payment system is currently unavailable
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recharge Your Credits
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Choose a package to add credits to your account
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {data.tiers.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            onSelect={handleSelectTier}
            isLoading={createCheckoutMutation.isPending}
          />
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Payments are securely processed by Stripe</p>
        <p className="mt-2">
          1,000,000 credits = $1.00 USD • Credits never expire
        </p>
      </div>
    </div>
  );
};
```

**Step 2: Verify component compiles**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add client/src/components/Recharge/RechargePage.tsx
git commit -m "feat: add RechargePage with pricing grid and checkout"
```

---

## Task 5: Create Payment Success Page

**Files:**
- Create: `client/src/components/Recharge/PaymentSuccessPage.tsx`

**Step 1: Create success page component**

```typescript
// client/src/components/Recharge/PaymentSuccessPage.tsx

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifySessionQuery } from '~/hooks/Recharge/useRechargeQueries';
import { useQueryClient } from '@tanstack/react-query';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get('session_id');

  const { data, isLoading, error } = useVerifySessionQuery(sessionId);

  useEffect(() => {
    if (data?.isPaid) {
      // Invalidate balance query to refresh user's credit display
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    }
  }, [data, queryClient]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="text-lg text-gray-600 dark:text-gray-300">
            Verifying your payment...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.isPaid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Verification Failed
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Please contact support if credits were not added to your account.
          </p>
          <button
            onClick={() => navigate('/recharge')}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formattedCredits = (data.credits / 1000000).toFixed(1);
  const formattedAmount = (data.amountTotal / 100).toFixed(2);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
          Payment Successful!
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Your credits have been added to your account
        </p>

        <div className="mt-8 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Credits Added
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formattedCredits}M Credits
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Amount Paid: ${formattedAmount}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-8 w-full rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Start Chatting
        </button>

        <button
          onClick={() => navigate('/recharge/history')}
          className="mt-3 w-full rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          View Recharge History
        </button>
      </div>
    </div>
  );
};
```

**Step 2: Verify component compiles**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add client/src/components/Recharge/PaymentSuccessPage.tsx
git commit -m "feat: add PaymentSuccessPage with verification"
```

---

## Task 6: Create Payment Cancel Page

**Files:**
- Create: `client/src/components/Recharge/PaymentCancelPage.tsx`

**Step 1: Create cancel page component**

```typescript
// client/src/components/Recharge/PaymentCancelPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">❌</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Payment Cancelled
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <button
          onClick={() => navigate('/recharge')}
          className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Try Again
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-3 w-full rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};
```

**Step 2: Verify component compiles**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add client/src/components/Recharge/PaymentCancelPage.tsx
git commit -m "feat: add PaymentCancelPage"
```

---

## Task 7: Create Recharge History Page

**Files:**
- Create: `client/src/components/Recharge/RechargeHistoryPage.tsx`

**Step 1: Create history page component**

```typescript
// client/src/components/Recharge/RechargeHistoryPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRechargeHistoryQuery } from '~/hooks/Recharge/useRechargeQueries';

export const RechargeHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useRechargeHistoryQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          Loading history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="text-lg font-semibold text-red-600">
          Failed to load recharge history
        </div>
        <button
          onClick={() => navigate('/recharge')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Recharge
        </button>
      </div>
    );
  }

  const history = data?.history || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recharge History
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          View your past credit purchases
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            No recharge history yet
          </p>
          <button
            onClick={() => navigate('/recharge')}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Purchase Credits
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Session ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {history.map((item) => {
                const formattedCredits = (item.credits / 1000000).toFixed(1);
                const formattedAmount = (item.amount / 100).toFixed(2);
                const date = new Date(item.createdAt).toLocaleDateString();

                return (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {date}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {formattedCredits}M
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      ${formattedAmount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                      {item.sessionId.slice(0, 20)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => navigate('/recharge')}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Back to Recharge
        </button>
      </div>
    </div>
  );
};
```

**Step 2: Verify component compiles**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add client/src/components/Recharge/RechargeHistoryPage.tsx
git commit -m "feat: add RechargeHistoryPage with transaction table"
```

---

## Task 8: Add Recharge Routes to Router

**Files:**
- Modify: `client/src/routes/Root.tsx`

**Step 1: Import recharge components**

Find the imports section and add:

```typescript
import { RechargePage } from '~/components/Recharge/RechargePage';
import { PaymentSuccessPage } from '~/components/Recharge/PaymentSuccessPage';
import { PaymentCancelPage } from '~/components/Recharge/PaymentCancelPage';
import { RechargeHistoryPage } from '~/components/Recharge/RechargeHistoryPage';
```

**Step 2: Add routes to router configuration**

Find the routes array and add recharge routes (typically after the main chat route):

```typescript
{
  path: 'recharge',
  element: <RechargePage />,
},
{
  path: 'recharge/success',
  element: <PaymentSuccessPage />,
},
{
  path: 'recharge/cancel',
  element: <PaymentCancelPage />,
},
{
  path: 'recharge/history',
  element: <RechargeHistoryPage />,
},
```

**Step 3: Verify routes compile**

Run: `cd client && npm run type-check`
Expected: No TypeScript errors

**Step 4: Test route navigation**

Run: `cd client && npm run dev`
Navigate to: `http://localhost:3090/recharge`
Expected: Recharge page loads (may show error if Stripe keys not configured)

**Step 5: Commit**

```bash
git add client/src/routes/Root.tsx
git commit -m "feat: add recharge routes to router"
```

---

## Task 9: Add Recharge Button to Navigation

**Files:**
- Modify: `client/src/components/Nav/NavLinks.tsx` or similar nav component

**Step 1: Find the balance display component**

Search for where balance/credits are displayed in the navigation bar.

**Step 2: Add recharge button next to balance**

Add this button component near the balance display:

```typescript
<button
  onClick={() => navigate('/recharge')}
  className="ml-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
  title="Add Credits"
>
  + Add Credits
</button>
```

**Step 3: Verify navigation works**

Run: `cd client && npm run dev`
Click the "Add Credits" button in navigation
Expected: Redirects to `/recharge` page

**Step 4: Commit**

```bash
git add client/src/components/Nav/NavLinks.tsx
git commit -m "feat: add recharge button to navigation bar"
```

---

## Task 10: Create Recharge Component Index

**Files:**
- Create: `client/src/components/Recharge/index.ts`

**Step 1: Create barrel export file**

```typescript
// client/src/components/Recharge/index.ts

export { RechargePage } from './RechargePage';
export { PaymentSuccessPage } from './PaymentSuccessPage';
export { PaymentCancelPage } from './PaymentCancelPage';
export { RechargeHistoryPage } from './RechargeHistoryPage';
export { PricingCard } from './PricingCard';
```

**Step 2: Commit**

```bash
git add client/src/components/Recharge/index.ts
git commit -m "chore: add Recharge component barrel export"
```

---

## Task 11: Update Environment Variables Documentation

**Files:**
- Modify: `docs/plans/STRIPE-INTEGRATION-PLAN.md` or create `docs/STRIPE-SETUP.md`

**Step 1: Create Stripe setup guide**

```markdown
# Stripe Integration Setup Guide

## Required Environment Variables

Add these to your `.env` file:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (get from https://dashboard.stripe.com/test/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Setup Steps

### 1. Create Stripe Account
- Sign up at https://dashboard.stripe.com/register
- Activate test mode (use test mode for development)

### 2. Get API Keys
- Go to: https://dashboard.stripe.com/test/apikeys
- Copy "Publishable key" → `STRIPE_PUBLISHABLE_KEY`
- Click "Reveal test key" → Copy "Secret key" → `STRIPE_SECRET_KEY`

### 3. Configure Webhook
- Go to: https://dashboard.stripe.com/test/webhooks
- Click "Add endpoint"
- Endpoint URL: `http://localhost:3080/api/recharge/webhook`
- Events to send: Select `checkout.session.completed`
- Click "Add endpoint"
- Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

### 4. Test Payment Flow
1. Start backend: `npm run backend:dev`
2. Start frontend: `npm run frontend:dev`
3. Navigate to http://localhost:3090/recharge
4. Select a pricing tier
5. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
6. Complete payment
7. Verify credits added to account

## Test Card Numbers

Stripe provides test cards for different scenarios:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

All test cards use:
- Any future expiration date
- Any 3-digit CVC
- Any billing postal code

## Production Deployment

For production:
1. Switch to live mode in Stripe Dashboard
2. Get live API keys (starts with `sk_live_` and `pk_live_`)
3. Update webhook URL to production domain
4. Update `.env` with live keys
5. Never commit API keys to git

## Troubleshooting

**Webhook not receiving events:**
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3080/api/recharge/webhook`
- Check webhook signature is correct
- Verify endpoint is publicly accessible (use ngrok for local testing)

**Payment not adding credits:**
- Check backend logs for webhook errors
- Verify `createTransaction` is working
- Check MongoDB for transaction records
```

**Step 2: Commit**

```bash
git add docs/STRIPE-SETUP.md
git commit -m "docs: add Stripe setup and configuration guide"
```

---

## Task 12: Frontend Testing Preparation

**Files:**
- Create: `client/src/hooks/Recharge/__tests__/useRechargeQueries.test.ts`

**Step 1: Create test file for recharge hooks**

```typescript
// client/src/hooks/Recharge/__tests__/useRechargeQueries.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePricingQuery, useCreateCheckoutSession } from '../useRechargeQueries';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useRechargeQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('usePricingQuery', () => {
    it('should fetch pricing tiers successfully', async () => {
      const mockResponse = {
        enabled: true,
        tiers: [
          { id: 'tier_5', name: '$5', credits: 5000000, price: 500, discount: 0 },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => usePricingQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => usePricingQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useCreateCheckoutSession', () => {
    it('should create checkout session successfully', async () => {
      const mockResponse = {
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useCreateCheckoutSession(), {
        wrapper: createWrapper(),
      });

      const session = await result.current.mutateAsync({ tierId: 'tier_5' });
      expect(session).toEqual(mockResponse);
    });
  });
});
```

**Step 2: Run tests**

Run: `cd client && npm test -- useRechargeQueries.test.ts`
Expected: All tests pass

**Step 3: Commit**

```bash
git add client/src/hooks/Recharge/__tests__/useRechargeQueries.test.ts
git commit -m "test: add unit tests for recharge query hooks"
```

---

## Task 13: Backend API Integration Test

**Files:**
- Create: `api/server/routes/__tests__/recharge.spec.js`

**Step 1: Create backend API tests**

```javascript
// api/server/routes/__tests__/recharge.spec.js

const request = require('supertest');
const express = require('express');
const rechargeRouter = require('../recharge');
const { getStripeService } = require('~/server/services/StripeService');

jest.mock('~/server/services/StripeService');
jest.mock('~/server/middleware', () => ({
  requireJwtAuth: (req, res, next) => {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  },
  checkBan: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/api/recharge', rechargeRouter);

describe('Recharge API Routes', () => {
  let mockStripeService;

  beforeEach(() => {
    mockStripeService = {
      isEnabled: jest.fn().mockReturnValue(true),
      getPricingTiers: jest.fn().mockReturnValue([
        {
          id: 'tier_5',
          name: '$5 套餐',
          credits: 5000000,
          price: 500,
          discount: 0,
        },
      ]),
      createCheckoutSession: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }),
    };

    getStripeService.mockReturnValue(mockStripeService);
  });

  describe('GET /api/recharge/pricing', () => {
    it('should return pricing tiers when Stripe is enabled', async () => {
      const response = await request(app)
        .get('/api/recharge/pricing')
        .expect(200);

      expect(response.body).toEqual({
        enabled: true,
        tiers: expect.arrayContaining([
          expect.objectContaining({
            id: 'tier_5',
            credits: 5000000,
          }),
        ]),
      });
    });

    it('should return 503 when Stripe is not enabled', async () => {
      mockStripeService.isEnabled.mockReturnValue(false);

      const response = await request(app)
        .get('/api/recharge/pricing')
        .expect(503);

      expect(response.body.enabled).toBe(false);
    });
  });

  describe('POST /api/recharge/create-checkout-session', () => {
    it('should create checkout session successfully', async () => {
      mockStripeService.getPricingTierById = jest.fn().mockReturnValue({
        id: 'tier_5',
        credits: 5000000,
      });

      const response = await request(app)
        .post('/api/recharge/create-checkout-session')
        .send({ tierId: 'tier_5' })
        .expect(200);

      expect(response.body).toEqual({
        sessionId: 'cs_test_123',
        url: expect.stringContaining('checkout.stripe.com'),
      });

      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user-id',
          userEmail: 'test@example.com',
          tierId: 'tier_5',
        })
      );
    });

    it('should return 400 when tierId is missing', async () => {
      const response = await request(app)
        .post('/api/recharge/create-checkout-session')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('tierId');
    });

    it('should return 400 when tier is invalid', async () => {
      mockStripeService.getPricingTierById = jest.fn().mockReturnValue(null);

      const response = await request(app)
        .post('/api/recharge/create-checkout-session')
        .send({ tierId: 'invalid_tier' })
        .expect(400);

      expect(response.body.message).toContain('Invalid pricing tier');
    });
  });
});
```

**Step 2: Run backend tests**

Run: `cd api && npm test -- recharge.spec.js`
Expected: All tests pass

**Step 3: Commit**

```bash
git add api/server/routes/__tests__/recharge.spec.js
git commit -m "test: add API integration tests for recharge routes"
```

---

## Task 14: End-to-End Test Preparation

**Files:**
- Create: `e2e/specs/recharge.spec.ts`

**Step 1: Create E2E test for recharge flow**

```typescript
// e2e/specs/recharge.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Recharge Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display pricing tiers on recharge page', async ({ page }) => {
    await page.goto('/recharge');

    // Check page title
    await expect(page.locator('h1')).toContainText('Recharge Your Credits');

    // Check pricing cards are displayed
    const pricingCards = page.locator('[data-testid="pricing-card"]');
    await expect(pricingCards).toHaveCount(5); // 5 tiers

    // Check first tier details
    const firstCard = pricingCards.first();
    await expect(firstCard).toContainText('$5');
    await expect(firstCard).toContainText('Purchase');
  });

  test('should navigate to recharge from navigation button', async ({ page }) => {
    await page.goto('/');

    // Click "Add Credits" button in navigation
    await page.click('button:has-text("Add Credits")');

    // Should redirect to recharge page
    await expect(page).toHaveURL('/recharge');
  });

  test('should show payment cancel message', async ({ page }) => {
    await page.goto('/recharge/cancel');

    await expect(page.locator('h1')).toContainText('Payment Cancelled');
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('should display recharge history', async ({ page }) => {
    await page.goto('/recharge/history');

    await expect(page.locator('h1')).toContainText('Recharge History');

    // Should show empty state or table
    const emptyState = page.locator('text=No recharge history yet');
    const historyTable = page.locator('table');

    expect(await emptyState.isVisible() || await historyTable.isVisible()).toBe(true);
  });
});
```

**Step 2: Add data-testid to PricingCard component**

Update `PricingCard.tsx` to add test ID:

```typescript
<div
  data-testid="pricing-card"
  className="relative flex flex-col rounded-lg border..."
>
```

**Step 3: Run E2E tests (will skip Stripe checkout since it requires real Stripe setup)**

Run: `npm run e2e -- recharge.spec.ts`
Expected: Tests pass (except actual Stripe checkout flow)

**Step 4: Commit**

```bash
git add e2e/specs/recharge.spec.ts client/src/components/Recharge/PricingCard.tsx
git commit -m "test: add E2E tests for recharge user flow"
```

---

## Task 15: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add Stripe integration section**

Add this section to CLAUDE.md after the "New-API Integration" section:

```markdown
## Stripe Payment Integration

Environment variables required in `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_...              # Stripe test/live secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...         # Stripe test/live publishable key
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook signing secret
```

Backend integration:
- **Service**: `api/server/services/StripeService.js` - Stripe API wrapper
- **Routes**: `api/server/routes/recharge.js` - Recharge endpoints
- **Webhook**: `POST /api/recharge/webhook` - Handles `checkout.session.completed` events

Frontend components:
- **Recharge Page**: `client/src/components/Recharge/RechargePage.tsx`
- **Payment Success**: `client/src/components/Recharge/PaymentSuccessPage.tsx`
- **Payment Cancel**: `client/src/components/Recharge/PaymentCancelPage.tsx`
- **History**: `client/src/components/Recharge/RechargeHistoryPage.tsx`

Pricing tiers (configured in `StripeService.js`):
- $5 → 5M credits (0% discount)
- $10 → 10M credits (1% discount)
- $25 → 25M credits (4% discount)
- $50 → 50M credits (6% discount)
- $100 → 100M credits (10% discount)

The payment flow:
1. User selects tier → Frontend calls `POST /api/recharge/create-checkout-session`
2. Backend creates Stripe Checkout Session → Returns session URL
3. Frontend redirects to Stripe Checkout
4. User completes payment
5. Stripe sends webhook to `POST /api/recharge/webhook`
6. Backend verifies signature → Adds credits via `createTransaction()`
7. User redirected to success page at `/recharge/success?session_id=xxx`

Testing locally:
```bash
# Install Stripe CLI (for webhook forwarding)
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3080/api/recharge/webhook

# Use test card: 4242 4242 4242 4242 (any future date, any CVC)
```

Setup guide: See `docs/STRIPE-SETUP.md`
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Stripe integration documentation to CLAUDE.md"
```

---

## Final Integration Checklist

**Before marking complete, verify:**

- [ ] All TypeScript files compile without errors (`npm run type-check`)
- [ ] All unit tests pass (`npm test`)
- [ ] Backend starts without errors and routes are registered
- [ ] Frontend starts and recharge page loads
- [ ] Navigation button to recharge page works
- [ ] Payment cancel page displays correctly
- [ ] Recharge history page displays correctly
- [ ] `.env` has Stripe configuration placeholders
- [ ] Documentation updated in CLAUDE.md
- [ ] Setup guide created in docs/STRIPE-SETUP.md

**For full testing with actual Stripe:**
1. Get Stripe test API keys
2. Configure webhook endpoint
3. Test payment flow with test card `4242 4242 4242 4242`
4. Verify credits are added after payment
5. Check recharge history shows the transaction

---

## Production Deployment Notes

**Before deploying to production:**

1. **Switch to live Stripe keys**
   - Get live keys from Stripe Dashboard (starts with `sk_live_` and `pk_live_`)
   - Update `.env` with live keys
   - **NEVER commit API keys to git**

2. **Configure production webhook**
   - Create webhook endpoint in Stripe Dashboard
   - Point to: `https://your-domain.com/api/recharge/webhook`
   - Select event: `checkout.session.completed`
   - Update `STRIPE_WEBHOOK_SECRET` in production `.env`

3. **Update redirect URLs**
   - Verify `DOMAIN_CLIENT` in `.env` is set to production domain
   - Success/cancel URLs will use this domain

4. **Security checklist**
   - [ ] Webhook signature verification enabled
   - [ ] JWT authentication on all recharge endpoints
   - [ ] HTTPS enabled for all endpoints
   - [ ] Stripe keys stored in secure environment variables (not in code)
   - [ ] Rate limiting enabled on payment endpoints

5. **Monitoring**
   - Set up alerts for failed webhook deliveries in Stripe Dashboard
   - Monitor transaction creation in MongoDB
   - Log all payment events to Winston logger

---

**Plan Complete!** 🎉

This plan provides step-by-step implementation of Stripe payment integration with:
- Complete frontend React components with TypeScript
- TanStack Query hooks for API integration
- Payment flow with success/cancel pages
- Recharge history display
- Unit tests and E2E tests
- Comprehensive documentation

Each task is designed to be completed in 2-5 minutes with clear verification steps and frequent commits following TDD principles.

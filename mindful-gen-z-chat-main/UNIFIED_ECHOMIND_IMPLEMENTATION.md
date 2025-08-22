# Unified EchoMind Model Implementation

## Overview

This document describes the implementation of the unified EchoMind model where every user follows the same rules:
- **10-minute cooldown** after each completed session
- **Payment required** for each new session (or unused paid credit)
- **No more free vs premium branching** - unified flow for all users

## Database Changes

### New Migration: `20250101000001-unified-echomind-model.sql`

#### 1. Simplified `session_credit` Table
```sql
CREATE TABLE IF NOT EXISTS session_credit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('unredeemed', 'redeemed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    redeemed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(payment_id) -- Ensures idempotency for webhook retries
);
```

**Key Features:**
- **One credit = one session unlock**
- **Status tracking**: `unredeemed` (available), `redeemed` (used), `refunded` (cancelled)
- **Unique payment_id** for webhook idempotency
- **Simplified structure** compared to complex `user_credits`

#### 2. Database Functions

**`can_start_unified_session(user_uuid UUID)`**
- Checks for active incomplete sessions
- Validates 10-minute cooldown period
- Verifies unredeemed credit availability
- Returns detailed validation results

**`redeem_session_credit(user_uuid UUID)`**
- Atomically finds and locks an unredeemed credit
- Marks credit as redeemed with timestamp
- Ensures exactly one credit is consumed per session

## API Changes

### 1. Updated `/api/chat.js`
- **Unified cooldown**: 10 minutes for ALL users (removed premium/free branching)
- **Session completion**: Atomic updates with `ended_at` and `cooldown_until`
- **Idempotent**: Prevents double-completion under concurrent requests

### 2. New `/api/unified-session.js`
- **Centralized session gating**: Enforces BOTH cooldown AND credit requirements
- **Atomic credit redemption**: Uses database function for transaction safety
- **Unified validation**: Single endpoint for all users regardless of payment status

### 3. Updated `/api/paypal-webhook.js`
- **Simplified credit creation**: One payment = one session credit
- **Idempotent**: Unique payment_id prevents duplicate credits
- **Status tracking**: Credits start as `unredeemed`

### 4. New `/api/test-unified.js`
- **Validation endpoint**: Tests database functions and schema
- **Health check**: Verifies unified model readiness
- **Debugging**: Helps troubleshoot deployment issues

## Frontend Changes

### 1. New `UnifiedCooldownCountdown` Component
- **Unified messaging**: Shows correct text based on credit availability
- **Auto-session start**: Automatically starts session when cooldown + credit conditions are met
- **Payment prompts**: Guides users to pay when credits are exhausted

### 2. Updated `Therapy.tsx`
- **Unified session creation**: Uses `/api/unified-session` endpoint
- **Credit-aware UI**: Shows appropriate messaging during cooldown
- **Consistent pricing**: "$5.99 per session" messaging throughout

### 3. Updated Payment Components
- **Payment modal**: Creates `session_credit` instead of `user_credits`
- **Premium plan details**: Simplified credit assignment
- **Unified flow**: No more complex credit calculations

## Business Logic Implementation

### Session Creation Gate (BOTH Conditions Required)

```typescript
// 1. Check for active incomplete session
if (activeSession) → BLOCK: "Active session in progress"

// 2. Check 10-minute cooldown
if (now < cooldown_until) → BLOCK: "Cooldown period active (10 minutes)"

// 3. Check for unredeemed credit
if (!unredeemedCredit) → BLOCK: "Payment required ($5.99) to start next session"

// 4. If all conditions met → CREATE SESSION + REDEEM CREDIT
```

### Credit Lifecycle

1. **Payment Received** → Credit status: `unredeemed`
2. **Session Started** → Credit status: `redeemed` (atomic)
3. **Refund Processed** → Credit status: `refunded` (if not redeemed)

### Cooldown Enforcement

- **10 minutes** for ALL users (unified)
- **Server-side validation** prevents bypassing
- **Atomic updates** ensure consistency
- **Persistent storage** survives page refresh

## Security & Idempotency

### Environment Variables
- ✅ **Server-side only**: No `VITE_*` secrets exposed to browser
- ✅ **Secure keys**: OpenAI API key only accessible via API routes
- ✅ **Public keys**: PayPal client ID safe for client-side use

### Payment Security
- **Webhook verification**: PayPal IPN validation
- **Unique payment_id**: Prevents duplicate credit creation
- **Atomic operations**: Database functions ensure consistency
- **RLS policies**: Users can only access their own credits

### Race Condition Protection
- **Database locks**: `FOR UPDATE` in credit redemption
- **Idempotent updates**: WHERE clauses prevent duplicates
- **Transaction safety**: Atomic credit consumption

## Testing & Validation

### Quick Tests (Must Pass)

1. **Session Completion** → 10-minute cooldown set, chat remains visible
2. **Payment During Cooldown** → "Payment received. Waiting for cooldown..." message
3. **Cooldown End + Credit** → Session auto-starts, credit becomes `redeemed`
4. **Cooldown End + No Credit** → Blocked with "Pay $5.99" message
5. **Race Conditions** → Exactly one session starts, exactly one credit redeemed

### Test Endpoint
```bash
GET /api/test-unified
```
- Validates database functions
- Checks schema integrity
- Confirms unified model readiness

## Deployment Notes

### Vercel Configuration
- **New endpoints**: `/api/unified-session`, `/api/test-unified`
- **Function count**: Still within Hobby plan limits
- **Environment variables**: Server-side only, no client exposure

### Database Migration
- **Run migration**: `20250101000001-unified-echomind-model.sql`
- **Backup existing data**: Before running migration
- **Test in staging**: Verify all functions work correctly

### Rollback Plan
- **Keep old endpoints**: `/api/create-session` still available
- **Database functions**: Can be dropped if needed
- **Frontend fallback**: Can revert to previous components

## Files Modified

### New Files
- `supabase/migrations/20250101000001-unified-echomind-model.sql`
- `api/unified-session.js`
- `api/test-unified.js`
- `src/components/therapy/UnifiedCooldownCountdown.tsx`
- `UNIFIED_ECHOMIND_IMPLEMENTATION.md`

### Modified Files
- `api/chat.js` - Unified 10-minute cooldown
- `api/paypal-webhook.js` - Simplified credit creation
- `src/components/ui/payment-modal.tsx` - Session credit system
- `src/pages/PremiumPlanDetails.tsx` - Unified credit assignment
- `src/pages/Therapy.tsx` - Unified session creation
- `vercel.json` - New API endpoints

### Unchanged Files (Core Therapy Logic Preserved)
- ✅ **Phase 1-6 prompts**: All therapy flows intact
- ✅ **Chat persistence**: Supabase storage unchanged
- ✅ **Onboarding analysis**: AI analysis preserved
- ✅ **Session memory**: Chat history maintained
- ✅ **Authentication**: Supabase auth unchanged

## Next Steps

1. **Deploy migration** to production database
2. **Test unified endpoints** with `/api/test-unified`
3. **Verify session creation** with new unified flow
4. **Monitor cooldown enforcement** and credit consumption
5. **Update user documentation** for new unified model

## Success Criteria

- [ ] All users experience 10-minute cooldown after sessions
- [ ] Payment required for each new session (no free sessions)
- [ ] Credits consumed atomically and idempotently
- [ ] No client-side secret exposure
- [ ] All existing therapy functionality preserved
- [ ] Deployment successful on Vercel Hobby plan

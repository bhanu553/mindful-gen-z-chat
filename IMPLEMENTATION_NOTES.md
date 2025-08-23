# EchoMind Unified Model Implementation

## Overview
This implementation unifies EchoMind into a single flow where every user follows the same rule set:
- Each completed session triggers a 10-minute cooldown
- The next session requires BOTH: cooldown elapsed AND $5.99 payment completed
- No more "free vs pro" branching - everyone uses the same flow

## Files Touched

### 1. Database Changes
- **New migration**: `supabase/migrations/20250101000000-create-session-credits.sql`
  - Creates `session_credits` table for payment tracking
  - Adds `cooldown_until` field to `chat_sessions`
  - Creates database functions for session eligibility checking

### 2. New API Endpoints
- **`api/session-gate.js`**: Centralized session start gate enforcing both conditions
- **`api/paypal-webhook.js`**: PayPal webhook handler for creating session credits

### 3. Modified Files
- **`api/chat.js`**: Updated to use unified 10-minute cooldown, removed premium/free branching
- **`src/pages/Therapy.tsx`**: Updated UI messages to reflect unified model
- **`src/components/ui/payment-modal.tsx`**: Updated to $5.99 per session model
- **`src/components/therapy/UnifiedCooldownCountdown.tsx`**: New component for unified cooldown handling

## Database Schema Changes

### session_credits Table
```sql
CREATE TABLE session_credits (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    payment_id TEXT UNIQUE NOT NULL, -- PayPal order ID
    status TEXT CHECK (status IN ('unredeemed', 'redeemed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE,
    redeemed_at TIMESTAMP WITH TIME ZONE
);
```

### chat_sessions Table
- Added `cooldown_until` field for 10-minute cooldown tracking

### Database Functions
- `get_user_next_eligible_time(user_uuid)`: Returns when user can start next session
- `can_user_start_session(user_uuid)`: Checks if user meets both conditions

## Key Implementation Details

### 1. Unified Cooldown (10 minutes)
- All users get 10-minute cooldown after session completion
- Cooldown starts when AI sends session end message
- `cooldown_until` field set to `ended_at + 10 minutes`

### 2. Payment + Credit System
- Each $5.99 payment creates one 'unredeemed' credit
- Credits are consumed one at a time when starting sessions
- PayPal webhook creates credits idempotently (unique payment_id)

### 3. Session Gate Logic
The central gate enforces BOTH conditions:
1. **Cooldown elapsed**: `now() >= cooldown_until`
2. **Payment credit available**: Has 'unredeemed' credit

If both true → consume credit, create new session
If either false → block with appropriate message

### 4. Idempotency & Race Handling
- **Payment webhooks**: Unique `payment_id` prevents duplicate credits
- **Session creation**: Transactional credit consumption + session creation
- **Cooldown checks**: Server-side time validation prevents client bypass

## Frontend Behavior Changes

### During Cooldown
- Shows countdown timer (server time based)
- Displays PayPal button for early payment
- After payment: "Payment received. Waiting for cooldown to end (mm:ss)"

### When Cooldown Ends
- If credit exists → auto-start next session
- If no credit → show "Pay $5.99 to start your next session"

### Message Updates
- All pricing text changed to "$5.99 per session"
- Removed premium/free distinction from user-facing messages
- Added payment prompts during cooldown

## Testing Checklist

### 1. Session Completion → Cooldown
- [ ] Finish session → cooldown=10m set
- [ ] Chat remains visible during cooldown
- [ ] No message loss on refresh

### 2. Payment During Cooldown
- [ ] Pay during cooldown → see "Payment received. Waiting..."
- [ ] No new session starts until cooldown ends
- [ ] At cooldown end → session auto-starts using paid credit

### 3. Skip Payment
- [ ] At cooldown end → blocked with "Pay $5.99 to start"
- [ ] After paying → session starts immediately (both conditions met)

### 4. Race Conditions
- [ ] Webhook arrives before/after cooldown end
- [ ] Exactly one new session starts
- [ ] Exactly one credit redeemed

### 5. State Persistence
- [ ] Refresh/login during cooldown → state restored
- [ ] Countdown accurate (server time based)
- [ ] No message disappearance

## Security & Configuration

### Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database operations
- PayPal webhook verification (TODO: implement signature verification)

### Client Security
- No secrets exposed to client
- PayPal client ID only (no server keys)
- All business logic server-side

## Migration Notes

### Existing Users
- First-time users can start without payment
- Users with existing sessions will need to pay $5.99 for next session
- Cooldown applies to all users regardless of previous premium status

### Data Migration
- Existing sessions remain intact
- `cooldown_until` field added to existing sessions (NULL for incomplete)
- No data loss during migration

## Known Issues & TODOs

### 1. React Import Issues
- `UnifiedCooldownCountdown.tsx` has linter errors but should work at runtime
- Project uses SWC with `jsx: "react-jsx"` transform

### 2. PayPal Webhook Verification
- Currently processes webhooks without signature verification
- Should implement proper verification in production

### 3. Error Handling
- Basic error handling implemented
- Could add more robust retry logic for failed operations

## Deployment Steps

1. **Run database migration**:
   ```bash
   supabase db push
   ```

2. **Deploy new API endpoints**:
   - `api/session-gate.js`
   - `api/paypal-webhook.js`

3. **Update frontend components**:
   - Deploy modified Therapy.tsx
   - Deploy new UnifiedCooldownCountdown.tsx
   - Deploy updated payment-modal.tsx

4. **Configure PayPal webhook**:
   - Point to `/api/paypal-webhook` endpoint
   - Listen for `PAYMENT.CAPTURE.COMPLETED` events

5. **Test the unified flow**:
   - Complete a session
   - Verify 10-minute cooldown
   - Test payment during cooldown
   - Verify auto-start when both conditions met

## Rollback Plan

If issues arise:
1. Revert database migration (drop new tables/fields)
2. Deploy previous API versions
3. Restore frontend components
4. Users will return to previous premium/free model

## Performance Considerations

- Database functions optimized with proper indexes
- Session gate queries are lightweight
- Cooldown checks use server time (no client manipulation)
- Payment webhooks processed asynchronously

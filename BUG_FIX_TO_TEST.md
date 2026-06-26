# Bug Fix to Re-Test Tomorrow

## Bug Found
When resetting one domain to FREE (Website A) while another domain (Website B) using the same email is STARTER:
1. User resets Website A to FREE
2. User clicks "Upgrade" on Website A but **doesn't complete** the payment
3. After waiting 2+ minutes, Website A incorrectly shows **STARTER** (even though payment was never completed)
4. Website B remains unaffected (correctly shows STARTER)

**Root Cause:** The `/api/reset-to-free` endpoint was resetting the global `users` table instead of the domain-specific `domain_subscriptions` table, causing cross-domain issues.

---

## Fix Applied

### Backend (server.js)
- Updated `/api/reset-to-free` endpoint to:
  - Accept `domain` parameter in request body
  - Reset only the specific domain in `domain_subscriptions` table (instead of global `users` table)
  - Only affect the specified domain's subscription

### Extension (popup.js)
- Updated reset button handler to:
  - Extract current domain: `new URL(currentUrl).hostname`
  - Pass domain parameter to reset endpoint: `{ email, domain }`

### Cancel Page (cancel.html)
- Extract domain from URL params: `url.searchParams.get('domain')`
- Pass domain to reset endpoint when payment is cancelled

---

## Test Case to Verify

1. **Setup:**
   - Website A: `blacksmithbarandgrill.com` (or any test domain)
   - Website B: `different-domain.com`
   - Email: Same for both (e.g., `test@example.com`)

2. **Test Sequence:**
   - Upgrade Website B to STARTER (complete payment, verify magic link)
   - Reset Website A to FREE in Settings tab
   - Click UPGRADE on Website A
   - Open Stripe checkout but **close it without paying**
   - Wait 2+ minutes
   - Go back to Website A in extension
   - ✅ **Expected:** Website A shows FREE (not STARTER)
   - ✅ **Expected:** Website B still shows STARTER (unaffected)

3. **Success Criteria:**
   - Website A stays FREE after reset + failed upgrade
   - Website B remains STARTER
   - No cross-domain interference

---

## Status
- ✅ Code pushed to git
- ⏳ **Needs testing** tomorrow

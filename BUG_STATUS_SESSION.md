# AnswerEngineer.AI - Bug Report & Status
**Date:** June 27, 2026

## Current Status
✅ **WORKING:**
- Multi-domain tier fix (Free vs Starter per domain)
- 2-minute debounce window for subscription activation
- Toast notification appears when magic link verified
- Toast only shows when backend confirms payment (safety check working)
- Extension UI displays correctly

## BUGS TO FIX
### Bug #1: Extension doesn't auto-refresh UI after 2 minutes
- **Description:** After magic link verification, subscription is applied in backend but extension UI doesn't update automatically
- **Current Behavior:** User must exit and re-enter extension to see STARTER plan
- **Expected Behavior:** After 2 minutes elapse AND subscription is confirmed, extension should auto-refresh to show STARTER plan
- **Root Cause:** No polling/checking of subscription status after initial verification. Need to re-check backend status when 2-minute window completes

### Bug #2: Timer appears again on re-entry even after STARTER confirmed
- **Description:** After domain becomes STARTER, closing and reopening extension shows the timer again
- **Current Behavior:** Toast timer notification appears again even though subscription is already confirmed
- **Expected Behavior:** Once subscription is confirmed and applied, pending flag should be cleared so timer doesn't show again
- **Root Cause:** Pending flag may not be properly cleared when subscription is applied, OR we're not checking if flag was already cleared before showing timer

## Files Modified
- `/chrome-extension/popup.js` - Main extension logic
- `/backend/server.js` - API endpoints (multi-domain fix)
- `/backend/verify.html` - Magic link verification page
- `/backend/cancel.html` - Payment cancellation page

## Next Session Actions
1. Add auto-refresh logic after 2-minute window completes
2. Verify pending flag is properly cleared when subscription applied
3. Add check to skip showing timer if pending flag already cleared
4. Test both bugs are fixed
5. Test with multiple domains to ensure isolation

## Test Scenario to Reproduce
1. Domain A: Complete upgrade to STARTER
2. Domain B: Same email, STARTER already
3. Domain A: Wait 2 minutes
4. Bug #1: Domain A should auto-show STARTER (currently requires exit/re-enter)
5. Bug #2: Exit and re-enter should not show timer (currently shows again)

---
**Status:** Ready for next session with clear bug reproduction steps

# AnswerEngineer.AI - Release Notes v1.0 MVP

**Release Date:** June 28, 2026  
**Version:** 1.0 - Multi-Domain Subscriptions (MVP)  
**Status:** Ready for Testing  
**Release Type:** Minimum Viable Product (MVP)

---

## Overview

This is a **Minimum Viable Product (MVP)** release focusing on core functionality. It introduces **multi-domain subscription support**, allowing the same email address to maintain independent subscription tiers across different domains.

### MVP Scope
✅ **Included:** Free/Starter tiers, multi-domain subscriptions, email validation, payment flow, 7-point audit, feature gating  
❌ **Not Included:** Pro/Agency tiers, CMS remediation, weekly digest emails, advanced features, query limiting

---

## Major Features

### 1. Multi-Domain Subscription Isolation ✨
- Each domain maintains its own independent subscription state
- Same email can be FREE on one domain and STARTER on another
- Complete isolation - changes to Domain A don't affect Domain B
- Per-domain localStorage keys: `ae_plan_[domain]`

### 2. Secure Payment & Verification Flow
- Stripe integration for payment processing
- Magic link email verification (must click to activate)
- 2-minute debounce window to prevent false upgrades
- Per-domain pending upgrade tracking

### 3. Enhanced Email Validation
- Strict email format validation
- Blocks invalid formats: `user`, `user@invalid`, `test@.com`
- Requires valid TLD (at least 2 characters)
- Prevents typos before payment

### 4. Per-Domain Subscription Management
- Domain-specific database table: `domain_subscriptions`
- Unique constraints on (email, domain) pairs
- Separate from global user subscriptions
- Clean separation of concerns

---

## Bug Fixes

### 🐛 Cross-Domain Bleed (CRITICAL - FIXED)
**Issue:** Subscribing Domain A would incorrectly show subscription on Domain B  
**Root Cause:** Webhook was creating domain subscriptions for all domains when payment succeeded  
**Fix:** 
- Webhook now only updates global `users` table
- Domain subscriptions created ONLY via magic link verification
- Removed premature subscription creation logic

### 🐛 Email Validation (FIXED)
**Issue:** Invalid emails were accepted and used for payment  
**Root Cause:** Loose regex pattern didn't validate domain structure  
**Fix:**
- Strict email validation function
- Checks local part length (1-64 chars)
- Validates domain format with hyphens
- Requires minimum 2-letter TLD

### 🐛 Magic Link Verification (FIXED)
**Issue:** Subscriptions showing STARTER without magic link verification  
**Root Cause:** Database had orphaned entries for wrong domains  
**Fix:**
- Only `/api/verify/:token` creates domain subscriptions
- Magic link must be clicked by user
- Pending flag properly cleared after verification

---

## Technical Changes

### Backend (server.js)
```javascript
// Stripe checkout now stores domain in metadata
metadata: {
  domain: domain,
  email: email
}

// Webhook no longer creates domain subscriptions
// Domain subscriptions only via /api/verify endpoint

// Subscription endpoint filters by email AND domain
.eq('email', email)
.eq('domain', domain)
.single()
```

### Extension (popup.js)
```javascript
// Email validation improved
function isValidEmail(e) {
  // Strict validation: format, TLD, length
  // Returns boolean for safe/unsafe emails
}

// Per-domain pending flags
const pendingKey = 'ae_pending_upgrade_domain_' + domainName;

// Per-domain plan storage
const planKey = 'ae_plan_' + domainName;
```

### Database (Supabase)
```
domain_subscriptions table:
- email (varchar)
- domain (varchar)
- plan (varchar): free, starter, pro, agency
- status (varchar): inactive, active
- unique constraint on (email, domain)
```

---

## What's New in v1.0 MVP

### Core Features
- ✨ **Multi-domain support** with complete isolation
- ✨ **Email validation** blocking invalid formats
- ✨ **Subscription verification flow** via magic link
- ✨ **Per-domain pending upgrade tracking**
- ✨ **7-Point GEO Audit** with scoring
- ✨ **Feature gating** for FREE vs STARTER
- ✨ **Detailed console logging** for debugging

### Revenue Tiers (v1.0)
- ✨ **FREE Plan:** 7-Point Audit only
- ✨ **STARTER Plan:** Audit + Simulator & Crawler access (gated)

### Not in v1.0 (Future Releases)
- ❌ Pro/Agency tiers
- ❌ CMS-specific remediation
- ❌ Weekly Visibility Digest
- ❌ Query limiting enforcement
- ❌ Advanced analytics

---

## Known Limitations

1. **Magic Link Expiration:** Links expire after 1 hour
2. **Payment Debounce:** 2-minute wait after payment before verification
3. **Browser Storage:** Subscription data lost if cache is cleared
4. **Single Email per Session:** Can change email in Settings but affects all domains

---

## Testing Recommendations

### Must Test:
1. ✅ Single domain upgrade flow (payment + magic link)
2. ✅ Multi-domain isolation (Domain A and B independence)
3. ✅ Email validation (valid vs invalid)
4. ✅ Payment cancellation (stays FREE)
5. ✅ Feature unlocking (FREE vs STARTER)

### Priority Testing:
- Multi-domain bleed prevention (regression test)
- Magic link verification required
- Email validation blocks invalid formats

### Optional:
- Performance testing
- UI/UX review
- Accessibility check

---

## Database Cleanup

Before testing, the following incorrect entries were removed:
```
adegomas@gmail.com → www.mamalor.com (removed)
adegomas@gmail.com → blacksmithbarandgrill.com (removed)
adegomas@gmail.com → www.omiwagyu.com.au (removed - orphaned)
```

**Current valid state:**
- Each email-domain combination is unique
- Only subscriptions created via magic link exist
- No orphaned or duplicate entries

---

## MVP Release Readiness Checklist

**This is an MVP release. Focus on core functionality only.**

### Required for v1.0 Release
- [ ] Code reviewed and tested
- [ ] All CRITICAL bugs fixed and verified
- [ ] Email validation working correctly
- [ ] Multi-domain isolation tested (NO cross-domain bleed)
- [ ] Database clean (no orphaned entries)
- [ ] Backend deployed to Render
- [ ] Stripe payment flow working
- [ ] Magic link email verification working
- [ ] 7-Point Audit functioning
- [ ] Feature gating (FREE vs STARTER) working
- [ ] Console logging enabled for debugging
- [ ] Tester documentation complete

### NOT Required for v1.0
- ❌ Pro/Agency tier features
- ❌ CMS remediation system
- ❌ Weekly digest emails
- ❌ Query limit enforcement
- ❌ Advanced Simulator/Crawler features
- ❌ Attribution analytics

---

## Rollback Plan

If critical issues are found:
1. Revert backend to previous version
2. Clear orphaned `domain_subscriptions` entries
3. Users' global subscriptions remain in `users` table
4. Extension will fall back to single global subscription model

---

## Support

**For Testing Issues:**
- Check TESTER_GUIDE.md for detailed instructions
- Review TESTING_CHECKLIST.md for sign-off requirements
- Check browser console (F12) for error logs
- Verify backend health: `curl https://answerengineer-ai.onrender.com/health`

**For Bug Reports:**
- Include domain, email, and steps to reproduce
- Attach console logs from F12 → Console
- Screenshot the issue
- Report using format in TESTER_GUIDE.md

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jun 28, 2026 | Multi-domain subscriptions, email validation, magic link verification |
| 0.9 | Jun 27, 2026 | Initial multi-domain implementation |
| 0.8 | Jun 26, 2026 | Single domain support |

---

## Contributors

- Development: Claude AI
- Testing: [Tester Name]
- QA: [QA Lead]

---

**Ready for Testing!** 🚀

Please follow the TESTER_GUIDE.md and TESTING_CHECKLIST.md for comprehensive testing coverage.

# AnswerEngineer.AI - Testing Checklist

**Version:** v1.0 MVP (Minimum Viable Product)  
**Scope:** Core subscription, audit, and gating features only  
**Out of Scope:** Pro/Agency tiers, CMS remediation, email digests, advanced features

## Pre-Testing Setup

- [ ] Clone/download latest code
- [ ] Backend deployed and running
- [ ] Chrome extension loaded (chrome://extensions/)
- [ ] Test email account ready
- [ ] Access to test email inbox
- [ ] 2+ test domains available
- [ ] Stripe test mode enabled

---

## ⭐ MVP Critical Tests (MUST PASS)

These 5 tests are REQUIRED for v1.0 release. All must pass.

- [ ] Scenario 1: Single Domain - Complete Payment Flow
- [ ] Scenario 2: Multi-Domain - Proper Isolation (no bleed)
- [ ] Scenario 3: Multi-Domain - Both Verified
- [ ] Scenario 5: Invalid Email Validation
- [ ] Scenario 6: Audit Functionality on FREE & STARTER

---

## Core Features Testing

### Email Validation
- [ ] Valid email accepted: `user@gmail.com`
- [ ] Invalid email rejected: `user@invalid`
- [ ] Invalid email shows error: `test@.com`
- [ ] Valid email saves to Settings

### Single Domain - Full Payment Flow
- [ ] Extension opens on website
- [ ] Can save email in Settings
- [ ] UPGRADE button visible
- [ ] Stripe checkout opens
- [ ] Can complete test payment (4242 4242...)
- [ ] Success page shows "Check your email"
- [ ] Magic link email arrives
- [ ] Clicking magic link → Extension shows STARTER
- [ ] Features unlock (Simulator, Crawler visible)

### Multi-Domain Isolation (CRITICAL)
- [ ] Domain A: STARTER (verified)
- [ ] Domain B: FREE (no magic link)
- [ ] Domain A still shows STARTER
- [ ] Domain B shows FREE (NOT STARTER)
- [ ] ✅ **NO cross-domain bleed**

### Payment Cancellation
- [ ] Cancel Stripe checkout
- [ ] Domain stays FREE
- [ ] No subscription created

### Audit Functionality
- [ ] FREE: Can run audit, see 7 scores
- [ ] STARTER: Can run audit + see extra features
- [ ] STARTER: Simulator unlocked
- [ ] STARTER: Crawler unlocked
- [ ] FREE: Simulator shows paywall
- [ ] FREE: Crawler shows paywall

---

## Critical Bug Fixes Verification

These bugs MUST be fixed:

### ✅ Cross-Domain Bleed (FIXED)
- [ ] Website A upgraded → Website B NOT affected
- [ ] Each domain has independent plan
- [ ] Subscription isolation verified

### ✅ Email Validation (FIXED)
- [ ] Invalid emails blocked
- [ ] Valid emails saved
- [ ] Settings tab validation working

### ✅ Magic Link Verification (FIXED)
- [ ] Must click magic link to upgrade
- [ ] NOT clicking = stays FREE
- [ ] Clicking = becomes STARTER
- [ ] Verification timeout working

---

## Advanced Testing (OPTIONAL for v1.0 MVP)

These tests are nice-to-have but not required for MVP release:

- [ ] Open DevTools (F12) → Console
- [ ] Look for debug logs: `[PAGE-LOAD-CHECK]`, `[SUBSCRIPTION-CONFIRMED]`
- [ ] Check for errors: `❌` in console
- [ ] Check Supabase `domain_subscriptions` table
- [ ] Verify correct email/domain pairs have STARTER
- [ ] No orphaned/incorrect entries in database

---

## Issue Tracking

### If you find a bug:
1. Note the **domain** being tested
2. Note the **email** used
3. Record the **steps to reproduce**
4. Screenshot the **result**
5. Copy **console errors** (F12)
6. Report with title: `[BUG] Brief description`

### Critical Issues (Stop testing, report immediately):
- [ ] Cross-domain bleed detected
- [ ] Payment completed but no subscription
- [ ] Extension crashes
- [ ] Data loss or corruption
- [ ] Security issue

### Minor Issues (Report at end):
- [ ] UI not aligned properly
- [ ] Text typos
- [ ] Slow performance
- [ ] Missing error messages

---

## Sign-Off

When all tests pass:

```
✅ Testing Completed
Date: ___________
Tester Name: ___________
Version Tested: 1.0 - Multi-Domain Subscriptions
Critical Issues Found: ☐ YES ☐ NO
Ready for Release: ☐ YES ☐ NO
Notes: ____________________________________________________
```

---

## Quick Reference - Test Domains

Create test accounts with these:
- Domain A: `https://www.domain-a.com/` (or your actual domain)
- Domain B: `https://www.domain-b.com/` (or your actual domain)
- Domain C: `https://www.domain-c.com/` (for cancellation test)

Test Email: `tester@test.com` (or your test email)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Extension not loading | Refresh: F5 or Ctrl+R |
| Magic link email not arriving | Check spam folder, wait 2+ minutes |
| Stuck on "Verifying subscription" | Close extension and reopen |
| Shows FREE but should be STARTER | Clear browser cache, reopen |
| Backend not responding | Verify: `curl https://answerengineer-ai.onrender.com/health` |
| Settings not saving | Ensure valid email format |

---

**Good luck with testing! 🚀**

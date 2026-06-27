# v1.0 MVP - Testing Summary & Scope

**Release Date:** June 28, 2026  
**Version:** 1.0 - Multi-Domain Subscriptions (MVP)  
**Type:** Minimum Viable Product

---

## What is an MVP Release?

A **Minimum Viable Product (MVP)** includes core features needed for launch but excludes nice-to-have features planned for future versions. Focus on testing what's included, not what's missing.

---

## v1.0 MVP - What to Test ✅

### Core Features (MUST WORK)
1. ✅ **Email validation** - Invalid emails blocked
2. ✅ **Multi-domain subscriptions** - Domain A and B independent
3. ✅ **Payment flow** - Stripe checkout working
4. ✅ **Magic link verification** - Magic link must be clicked to activate
5. ✅ **7-Point Audit** - Scores calculated correctly
6. ✅ **Feature gating** - FREE has audit only, STARTER unlocks more
7. ✅ **Multi-domain isolation** - NO cross-domain bleed

### Supported Subscription Tiers
- **FREE Plan** ($8/mo)
  - ✅ 7-Point Audit
  - ✅ Basic features
  - ❌ Simulator/Crawler (locked)

- **STARTER Plan** ($19/mo)
  - ✅ 7-Point Audit
  - ✅ Simulator & Crawler access (UI unlocked)
  - ✅ Basic features

---

## v1.0 MVP - What NOT to Test ❌

### Explicitly Out of Scope
- ❌ **Pro Plan** ($49/mo) - Not implemented
- ❌ **Agency Plan** ($99+/mo) - Not implemented
- ❌ **Query limiting** - No 3/day limit enforced on FREE
- ❌ **Weekly Digest emails** - Not implemented
- ❌ **CMS remediation** - No WordPress/Shopify/Squarespace fixes
- ❌ **Attribution logic** - No GA/analytics integration
- ❌ **Advanced Simulator** - Full AI features tested separately
- ❌ **Advanced Crawler** - Full SERP data tested separately

**DO NOT test or expect these features. They're planned for v1.1 or v2.0.**

---

## Critical vs Supporting Tests

### ⭐ CRITICAL TESTS (Must Pass for Release)
These 5 scenarios MUST pass before v1.0 launches:

1. **Scenario 1:** Single Domain - Complete Payment Flow
2. **Scenario 2:** Multi-Domain - No Cross-Domain Bleed
3. **Scenario 3:** Multi-Domain - Both Verified
4. **Scenario 5:** Invalid Email Validation
5. **Scenario 6:** Audit Functionality (FREE vs STARTER)

### ⚠️ SUPPORTING TESTS (Nice to Have)
These scenarios verify edge cases but aren't blockers:

- Scenario 4: Payment Cancelled
- Console logging review
- Database record verification

---

## Testing Checklist - MVP Focus

### Setup ✓
- [ ] Extension loads without errors
- [ ] Backend running and healthy
- [ ] Test email account ready
- [ ] 2+ test domains available

### Payment & Subscription (CRITICAL)
- [ ] Can complete Stripe payment
- [ ] Magic link email arrives
- [ ] Clicking magic link = STARTER
- [ ] NOT clicking link = FREE (no upgrade)
- [ ] Invalid emails blocked

### Multi-Domain Isolation (CRITICAL)
- [ ] Domain A: STARTER (verified)
- [ ] Domain B: FREE (no magic link)
- [ ] Domain A still STARTER (unaffected)
- [ ] **NO cross-domain bleed**

### Features (CRITICAL)
- [ ] FREE: Can run 7-point audit
- [ ] STARTER: Can run audit + see unlocked features
- [ ] Paywall appears on locked features for FREE

### Audit (CRITICAL)
- [ ] Audit runs and shows 7 scores
- [ ] Scores are reasonable (not all 0 or 100)
- [ ] Results save to history
- [ ] Free/Starter both show results

---

## Common Questions

### Q: Should I test the Simulator in detail?
**A:** No. Just verify the UI is unlocked on STARTER. Full functionality testing is separate.

### Q: Should I test the Crawler/SERP data?
**A:** No. Just verify the tab appears on STARTER. Full functionality testing is separate.

### Q: Can I request Pro/Agency tier features?
**A:** Not in v1.0. These are planned for v2.0. Document as feature request instead.

### Q: Should I enforce 3-queries/day limit?
**A:** No. Query limiting is not in v1.0. It's planned for v1.1.

### Q: Are CMS-specific fixes supposed to work?
**A:** No. CMS remediation is not in v1.0. It's planned for v1.1.

### Q: Will I receive weekly emails?
**A:** No. Weekly Digest is not in v1.0. It's planned for v1.1.

---

## Sign-Off Criteria

✅ **Release Approved** if:
- All 5 CRITICAL tests pass
- No cross-domain bleed detected
- Email validation working
- Payment flow complete
- Feature gating correct
- No major crashes

❌ **Release Blocked** if:
- Cross-domain bleed exists
- Invalid emails accepted
- Payment flow broken
- Extension crashes
- Audit doesn't work
- Feature gating broken

---

## Roadmap Preview (Not in v1.0)

### v1.1 (Next Sprint)
- Weekly Visibility Digest email system
- CMS-specific remediation (WordPress, Shopify, etc.)
- Query limit enforcement (3/day on FREE)
- Attribution analytics integration

### v2.0 (Future)
- Pro tier features (competitor scooping, historical data, API)
- Agency tier features (white-label, team seats, dashboard)
- Advanced analytics
- Integrations

---

## Final Reminders

🎯 **Focus:** Core subscription, audit, and gating features  
✅ **Test:** The 5 CRITICAL scenarios thoroughly  
❌ **Don't Test:** Features marked as v1.1/v2.0 scope  
📝 **Document:** Bugs and feature requests separately  
🚀 **Goal:** Validate MVP is stable and ready for early adopters

---

**For detailed testing instructions, see TESTER_GUIDE.md**  
**For testing checklist, see TESTING_CHECKLIST.md**  
**For technical details, see RELEASE_NOTES.md**

---

**Happy testing! 🚀**

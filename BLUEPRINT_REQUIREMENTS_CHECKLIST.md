# AnswerEngineer.AI - Blueprint Requirements Verification

**Reference:** Product Logic & Engineering Blueprint  
**Date:** June 28, 2026  
**Status:** Release v1.0 - Multi-Domain Subscriptions

---

## Feature Prioritization (BCG Logic)

### ✅ "Invest Heavily in Stars" - AI Simulator
**Requirement:** High user engagement feature  
**Status:** 
- [x] Feature gated behind STARTER plan
- [x] Unlocked when subscription verified
- [x] UI shows "Unlimited queries" on STARTER
- [ ] **TODO:** Verify unlimited query implementation
- [ ] **TODO:** Integration with ChatGPT/Google AI models

### ✅ "Protect the Cash Cow" - 7-Point GEO Audit
**Requirement:** Core audit with 7 evaluation criteria  
**Status:**
- [x] 7-Point audit runs on FREE plan
- [x] Audit available on STARTER plan
- [x] Scores displayed for each criterion
- [ ] **TODO:** Verify all 7 criteria are being scored correctly
- [ ] **TODO:** Confirm remediation guidance is accurate

### ⚠️ "Deprioritize Dogs" - Crawler View
**Requirement:** SERP preview (technically complex, niche value)  
**Status:**
- [x] Crawler View implemented
- [x] Gated behind STARTER plan
- [ ] **TODO:** Performance optimization needed
- [ ] **TODO:** Verify SERP data accuracy

---

## User Journey Logic

### 🎯 "30 Seconds to Aha" Requirement
**Requirement:** First GEO score revealed within 30 seconds of installation  
**Status:**
- [ ] **VERIFICATION NEEDED:** Test actual time from extension load to first score
- [ ] **VERIFICATION NEEDED:** Optimize if exceeds 30 seconds
- [ ] **VERIFICATION NEEDED:** Confirm score accuracy in first run

### 🎯 "40% First-Fix Target" Requirement
**Requirement:** 40% of free users complete ≥1 remediation task in first 7 days  
**Status:**
- [ ] **TRACKING NEEDED:** Implement analytics for user remediation completion
- [ ] **TRACKING NEEDED:** Set up dashboard to monitor this metric
- [ ] **VERIFICATION NEEDED:** Establish baseline and improve over time

### 📧 "The Weekly Visibility Digest" Requirement
**Requirement:** Automatic email retention loop for score improvements & AI-citation alerts  
**Status:**
- [ ] **NOT IMPLEMENTED:** Email scheduling system needed
- [ ] **NOT IMPLEMENTED:** Score change detection logic
- [ ] **NOT IMPLEMENTED:** AI-citation alert generation
- [ ] **TIMELINE:** Priority for v1.1 or v2.0

---

## CMS-Specific Remediation

### Plain-Language Fix Instructions
**Requirement:** Provide fixes for WordPress, Shopify, Squarespace, WIX  
**Status:**
- [ ] **NOT IMPLEMENTED:** CMS detection logic
- [ ] **NOT IMPLEMENTED:** WordPress-specific fix instructions
- [ ] **NOT IMPLEMENTED:** Shopify-specific fix instructions
- [ ] **NOT IMPLEMENTED:** Squarespace-specific fix instructions
- [ ] **NOT IMPLEMENTED:** WIX-specific fix instructions
- [ ] **TIMELINE:** Priority for v1.1

---

## Technical Constraints & Risks

### API Dependency Management
**Requirement:** Core APIs rely on Google APIs, requires caching & rate-limiting (Est. 50 MTTR)  
**Status:**
- [ ] **VERIFICATION NEEDED:** Check caching implementation
- [ ] **VERIFICATION NEEDED:** Confirm rate-limiting in place
- [ ] **VERIFICATION NEEDED:** Test MTTR (Mean Time To Recovery)

### Chrome Policy Compliance
**Requirement:** Manifest V3 evolution for early 2027 deprecation  
**Status:**
- [x] Using Chrome extension APIs
- [ ] **VERIFICATION NEEDED:** Confirm Manifest V3 compatibility
- [ ] **VERIFICATION NEEDED:** Plan for 2027 deprecation migration

---

## Revenue Tiers & Gating

### Tier 1: Free Plan - $8/mo
**Features:**
- [x] 7-Point Audit
- [x] Basic Fix Queue (3 simulator queries/day)
- [ ] **VERIFICATION NEEDED:** Query limit enforcement
- [ ] **VERIFICATION NEEDED:** Confirm paywall blocks premium features

### Tier 2: Starter Plan - $19/mo
**Features:**
- [x] Unlimited AI Simulator queries
- [x] AI-generated fixes
- [x] Weekly Visibility Digest (UI ready)
- [x] Attribution integration (structure ready)
- [ ] **VERIFICATION NEEDED:** Verify unlimited query implementation
- [ ] **VERIFICATION NEEDED:** Test weekly email sending

### Tier 3: Pro Plan - $49/mo
**Features:**
- [ ] **NOT IMPLEMENTED:** Competitor scooping
- [ ] **NOT IMPLEMENTED:** Historical data access
- [ ] **NOT IMPLEMENTED:** API access for integrations
- [ ] **NOT IMPLEMENTED:** Batch testing
- [ ] **TIMELINE:** Priority for v2.0

### Tier 4: Agency Plan - $99+/mo
**Features:**
- [ ] **NOT IMPLEMENTED:** White-label reports
- [ ] **NOT IMPLEMENTED:** Team seats management
- [ ] **NOT IMPLEMENTED:** Client dashboard
- [ ] **TIMELINE:** Priority for v2.0+

---

## Core Logic Systems

### Attribution Logic
**Requirement:** Integrate with Google Analytics & Shopify for conversion IRR correlation  
**Status:**
- [ ] **NOT IMPLEMENTED:** Google Analytics integration
- [ ] **NOT IMPLEMENTED:** Shopify integration
- [ ] **NOT IMPLEMENTED:** Conversion tracking
- [ ] **NOT IMPLEMENTED:** IRR correlation logic
- [ ] **TIMELINE:** Priority for v1.1 or v2.0

### CMS Remediation Engine
**Requirement:** Generate platform-specific fix instructions  
**Status:**
- [ ] **NOT IMPLEMENTED:** CMS detection
- [ ] **NOT IMPLEMENTED:** Fix instruction templates
- [ ] **NOT IMPLEMENTED:** Step-by-step guidance
- [ ] **TIMELINE:** Priority for v1.1

---

## What's Implemented in v1.0

✅ Multi-domain subscription support  
✅ Email validation  
✅ Payment processing (Stripe)  
✅ Magic link verification  
✅ Per-domain plan isolation  
✅ 7-Point Audit functionality  
✅ Simulator feature unlock (gating ready)  
✅ Crawler View feature unlock (gating ready)  
✅ Settings management  
✅ Audit history tracking  
✅ Revenue tier structure (Free + Starter)  

---

## What's NOT in v1.0 (For Future Releases)

### v1.1 Priority (Next Sprint)
- [ ] Weekly Visibility Digest (email system)
- [ ] CMS-Specific Remediation (WordPress, Shopify, Squarespace, WIX)
- [ ] Attribution Logic (GA + Shopify integration)
- [ ] Query limit enforcement (3/day on Free plan)
- [ ] Performance optimization (30-second "Aha" verification)

### v2.0 Priority (Future)
- [ ] Pro Plan features (competitor scooping, historical data, API access)
- [ ] Agency Plan features (white-label, team seats, client dashboard)
- [ ] Advanced analytics dashboard
- [ ] Batch testing system
- [ ] Reporting engine

### Risk Mitigation
- [ ] Chrome Manifest V3 compliance verification
- [ ] API rate-limiting testing
- [ ] Caching strategy validation
- [ ] MTTR (Mean Time To Recovery) measurement

---

## Summary Table

| Requirement | Category | Status | Version |
|-------------|----------|--------|---------|
| Multi-domain subscriptions | Core | ✅ Complete | v1.0 |
| Email validation | Core | ✅ Complete | v1.0 |
| Payment integration | Core | ✅ Complete | v1.0 |
| 7-Point Audit | Core | ✅ Complete | v1.0 |
| AI Simulator (gating) | Core | ✅ Ready | v1.0 |
| Crawler View (gating) | Core | ✅ Ready | v1.0 |
| Free tier ($8/mo) | Revenue | ✅ Ready | v1.0 |
| Starter tier ($19/mo) | Revenue | ✅ Ready | v1.0 |
| Query limiting (3/day) | Gating | 🔄 Partial | v1.0→v1.1 |
| Weekly Digest email | Feature | ❌ Not implemented | v1.1 |
| CMS Remediation | Feature | ❌ Not implemented | v1.1 |
| Attribution Logic | Feature | ❌ Not implemented | v1.1 |
| Pro tier ($49/mo) | Revenue | ❌ Not implemented | v2.0 |
| Agency tier ($99+/mo) | Revenue | ❌ Not implemented | v2.0 |
| 30-sec "Aha" time | UX Goal | 🔄 Needs verification | v1.0 |
| 40% First-Fix target | Metric | 🔄 Needs tracking | v1.0 |

---

## Critical Questions for Product Team

1. **Is v1.0 the MVP or full launch?**
   - If MVP: Focus testing on Free/Starter tiers only
   - If full launch: Need to implement Pro/Agency tiers

2. **Should query limiting be enforced in v1.0?**
   - Currently: No limit enforcement
   - Needed: Track queries and block after 3/day on Free plan

3. **Is weekly digest email needed for launch?**
   - Currently: Not implemented
   - Can delay to v1.1 if not critical

4. **Should CMS remediation be in v1.0?**
   - Currently: Not implemented
   - Can delay to v1.1 if not critical

5. **Has 30-second "Aha" been verified?**
   - Currently: Not measured
   - Recommend: Benchmark actual times during testing

---

## Recommendations

### For v1.0 Release (Current)
✅ **Ready:**
- Multi-domain subscriptions
- Email validation
- Payment flow
- Free/Starter tier gating
- Audit functionality

### For v1.1 Sprint (Next)
⚠️ **Recommended:**
- Weekly email digest system
- CMS-specific remediation
- Query limit enforcement
- 30-second "Aha" optimization
- 40% First-Fix tracking

### For v2.0 Sprint (Future)
📅 **Future Plans:**
- Pro/Agency tier features
- Advanced analytics
- API access
- White-label reports

---

**Last Updated:** June 28, 2026  
**Prepared for:** Product & Engineering Review

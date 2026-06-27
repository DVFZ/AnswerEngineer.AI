# AnswerEngineer.AI - Chrome Extension Testing Guide

**Version:** v1.0 MVP (Minimum Viable Product)  
**Release Date:** June 28, 2026

## Overview
This document provides setup instructions and comprehensive testing scenarios for the AnswerEngineer.AI Chrome extension MVP with multi-domain subscription support. This is a Minimum Viable Product release focused on core functionality: Free and Starter tier subscriptions, 7-point audit, and basic feature gating.

---

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Extension Installation](#extension-installation)
3. [Key Features to Test](#key-features-to-test)
4. [Test Scenarios](#test-scenarios)
5. [Expected Results](#expected-results)
6. [Bug Reporting](#bug-reporting)

---

## Setup Instructions

### Prerequisites
- Google Chrome browser (latest version)
- 2+ test websites/domains (for multi-domain testing)
- Test email account (Gmail recommended)
- Access to test email inbox

### Backend Requirements
- Backend must be deployed and running at: `https://answerengineer-ai.onrender.com`
- Stripe test keys configured
- Database (Supabase) connected

### Verify Backend is Running
```
curl https://answerengineer-ai.onrender.com/health
```
Expected response: `{"status": "ok"}`

---

## Extension Installation

### Option 1: Load from Source (Development)
1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Navigate to: `C:\Projects\Documents\AnswerEngineer.AI\chrome-extension\`
5. Select the folder and click **Open**
6. Extension should appear in your extensions list

### Option 2: From ZIP File
1. Extract the extension folder
2. Follow Option 1 steps above

### Verify Installation
- Extension icon should appear in Chrome toolbar
- Click extension icon to open popup
- You should see AnswerEngineer.AI interface with URL entry field

---

## Key Features to Test (v1.0 MVP)

### ✅ In Scope for v1.0
1. **Email Validation**
   - Valid emails: `user@gmail.com`, `test@company.co.uk`
   - Invalid emails: `user`, `user@invalid`, `test@.com`

2. **Multi-Domain Subscription Isolation**
   - Each domain maintains independent subscription state
   - Same email can have different plans on different domains
   - Subscription on Domain A should NOT affect Domain B

3. **Payment & Magic Link Verification Flow**
   - Stripe payment must complete before magic link appears
   - Magic link email must be received within 2 minutes
   - Clicking magic link upgrades subscription to STARTER
   - NOT clicking magic link keeps domain as FREE

4. **7-Point Audit Functionality**
   - FREE plan: Run audit, see all 7 scores
   - STARTER plan: Same audit + feature unlock (UI ready)

5. **Feature Gating**
   - FREE plan: Audit only
   - STARTER plan: Audit + Simulator and Crawler access (UI ready)

### ⏳ Not in v1.0 (Future Releases)
- CMS-specific remediation (WordPress, Shopify, Squarespace, WIX)
- Weekly Visibility Digest email system
- Query limiting (3/day on free plan - not enforced yet)
- Pro/Agency tiers
- Attribution logic & analytics
- Advanced features

### 📝 Note for Testers
This is an MVP release. Focus testing on core features (subscription management, audit, feature gating). Do NOT test or expect:
- CMS-specific fix instructions
- Weekly emails
- Advanced tiers
- Query limits

---

## Test Scenarios (v1.0 MVP - Core Requirements)

### Scenario 1: Single Domain - Complete Payment Flow ⭐ CRITICAL
**Goal:** Verify basic upgrade and subscription verification (MVP REQUIREMENT)

**Steps:**
1. Open extension on **Website A** (e.g., `https://www.example1.com/`)
2. Enter valid email in Settings (e.g., `test@gmail.com`)
3. Click "UPGRADE TO STARTER" button
4. Complete Stripe test payment with: 
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
5. Success page appears → Check email for magic link
6. **Click the magic link** in email
7. Return to extension → Should show **STARTER plan**

**Expected Result:** ✅ Domain shows STARTER, all features unlocked

---

### Scenario 2: Multi-Domain with Same Email - Proper Isolation ⭐ CRITICAL
**Goal:** Verify that each domain has independent subscription state (MVP REQUIREMENT - Core Bug Fix)

**Prerequisites:**
- Website A: Already upgraded to STARTER (from Scenario 1)
- Website B: Different domain, same email as Website A

**Steps:**
1. Open extension on **Website B** (e.g., `https://www.example2.com/`)
2. Email is still `test@gmail.com` (same as Website A)
3. Click "UPGRADE TO STARTER" for Website B
4. Complete Stripe payment
5. Receive magic link email
6. **DO NOT CLICK the magic link** - just leave it
7. Return to extension on Website B
8. Check what plan is shown

**Expected Result:** 
- ✅ Website B should show **FREE** (magic link not verified)
- ✅ Website A should still show **STARTER** (unaffected)
- ✅ NO cross-domain bleed

---

### Scenario 3: Multi-Domain - Both Verified ⭐ CRITICAL
**Goal:** Verify both domains can have STARTER independently (MVP REQUIREMENT)

**Prerequisites:**
- Website A: STARTER (verified)
- Website B: FREE (from Scenario 2)

**Steps:**
1. Go to Website B extension
2. Click magic link from email (verify Website B)
3. Return to extension → Should show **STARTER**
4. Switch to Website A (different tab/window)
5. Return to Website A extension

**Expected Result:**
- ✅ Website A: STARTER ✓
- ✅ Website B: STARTER ✓
- ✅ Both independent, no interference

---

### Scenario 4: Payment Cancelled - Stay FREE ⚠️ SUPPORTING
**Goal:** Verify cancelling payment keeps domain as FREE

**Steps:**
1. Open extension on **Website C** (new domain, new email)
2. Enter email: `test2@gmail.com`
3. Click "UPGRADE TO STARTER"
4. **Close the Stripe checkout window** (or click Back/Cancel)
5. Cancel page should appear
6. Return to extension

**Expected Result:**
- ✅ Website C still shows **FREE**
- ✅ No subscription created

---

### Scenario 5: Invalid Email Validation ⭐ CRITICAL
**Goal:** Verify email validation blocks invalid emails (MVP REQUIREMENT)

**Steps:**
1. Open Settings tab
2. Try entering invalid emails:
   - `user` (no @)
   - `user@invalid` (no TLD)
   - `test@.com` (no domain)
3. Click Save

**Expected Result:**
- ✅ Invalid emails: Show red error, NOT saved
- ✅ Valid emails: Save successfully

---

### Scenario 6: Audit Functionality ⭐ CRITICAL
**Goal:** Verify audits work on both FREE and STARTER (MVP REQUIREMENT)

**Steps:**
1. **On FREE domain:**
   - Enter website URL
   - Click "Point Audit" tab
   - Run audit
   - See 7 criteria scores

2. **On STARTER domain:**
   - Same steps
   - Verify "AI Simulator" and "Crawler View" tabs show (unlocked)

**Expected Result:**
- ✅ FREE: Audit runs, shows all 7 scores
- ✅ STARTER: Audit works + feature tabs visible
- ✅ Feature paywall displays correctly on FREE plan

**Note:** Simulator and Crawler full functionality will be tested separately. This test validates the unlock/gating mechanism.

---

## Expected Results Checklist (v1.0 MVP)

### ✅ What Should Work in v1.0

| Feature | FREE | STARTER | Notes |
|---------|------|---------|-------|
| Point Audit (7-point) | ✅ | ✅ | Core MVP feature |
| View audit history | ✅ Basic | ✅ Full | MVP included |
| AI Simulator | ❌ Locked | ✅ Unlocked | Gating in place, full functionality tested separately |
| Crawler View (SERP) | ❌ Locked | ✅ Unlocked | Gating in place, full functionality tested separately |
| Run audits | ✅ | ✅ | Core MVP feature |
| Save settings | ✅ | ✅ | Core MVP feature |
| Email validation | ✅ | ✅ | MVP security feature |
| Multi-domain isolation | ✅ | ✅ | Core MVP bug fix |

### ✅ What Should Be Isolated Per-Domain

| Scenario | Domain A | Domain B | Result |
|----------|----------|----------|--------|
| A: STARTER, B: FREE | STARTER | FREE | ✅ Independent |
| A: STARTER, B: STARTER | STARTER | STARTER | ✅ Both active |
| A: FREE, B: STARTER | FREE | STARTER | ✅ No bleed |

---

## Console Logging (For Advanced Testers)

To view debug logs:
1. Right-click extension icon → **Inspect popup**
2. Click **Console** tab
3. Perform actions and watch logs
4. Look for entries like:
   ```
   [PAGE-LOAD-CHECK] Email: test@gmail.com, Domain: www.example.com
   [SUBSCRIPTION-CONFIRMED] www.example.com = starter
   [SAVED] ae_plan_www.example.com = starter
   ```

---

## Known Limitations & Out-of-Scope for v1.0 MVP

### Limitations (Intentional)
1. **Magic Link Timeout:** Links expire after 1 hour
2. **2-Minute Debounce:** After payment, wait 2+ minutes before magic link verification
3. **Browser Storage:** Subscription data stored locally - clearing browser data resets it
4. **Single Email per Session:** Settings save email globally (can change in Settings tab)

### Not Included in v1.0 MVP (Planned for Future)
- ❌ Query limiting (3/day on FREE not enforced)
- ❌ Weekly Visibility Digest emails
- ❌ CMS-specific remediation (WordPress, Shopify, Squarespace, WIX)
- ❌ Attribution logic & analytics
- ❌ Pro/Agency tiers
- ❌ Advanced Simulator features (full AI integration)
- ❌ Advanced Crawler features (full SERP data)

**Do NOT test or expect these features in v1.0.**

---

## Bug Reporting

### How to Report Issues

1. **Collect Information:**
   - Email used
   - Domain(s) being tested
   - Steps to reproduce
   - Expected vs actual result
   - Browser console errors (F12 → Console)
   - Backend logs (if available)

2. **Report Format:**
   ```
   Title: [Feature] Brief issue description
   
   Expected: What should happen
   Actual: What actually happened
   Steps: 1. ... 2. ... 3. ...
   
   Attachments: Screenshots, console logs
   ```

3. **Critical Issues:**
   - Cross-domain bleed (Domain A affects Domain B)
   - Payment without email verification
   - Subscription locked on correct plan
   - Extension crashes

---

## Quick Test Checklist

- [ ] Extension loads without errors
- [ ] Can enter email and save settings
- [ ] Can complete payment with valid card
- [ ] Magic link email arrives
- [ ] Clicking magic link upgrades to STARTER
- [ ] NOT clicking link keeps domain as FREE
- [ ] Website A and B don't interfere with each other
- [ ] Invalid emails are rejected
- [ ] Audit runs on both FREE and STARTER
- [ ] STARTER has all features unlocked
- [ ] FREE shows paywall for premium features

---

## Support

For issues or questions:
- Check browser console (F12) for error messages
- Verify backend is running: `curl https://answerengineer-ai.onrender.com/health`
- Check email spam folder if magic link doesn't arrive
- Clear browser cache if seeing stale data

---

**Last Updated:** June 28, 2026
**Version:** 1.0 - Multi-Domain Subscriptions

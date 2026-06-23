# AnswerEngineer.AI v1 - Testing Guide

**Date:** June 20, 2026  
**Status:** Ready for MVP Testing

---

## Part 1: Backend Testing

### Prerequisites
- Node.js installed
- Terminal/Command Prompt
- Postman or cURL (for API testing)

### Step 1: Start the Backend Server

```bash
cd backend
npm install  # (should already be done, but just in case)
node server.js
```

**Expected Output:**
```
Server running on http://localhost:5000
[STARTUP] Health check: ✅ ok
```

### Step 2: Test Health Endpoint

**Test:** Server is running and responsive

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status": "ok"}
```

---

### Step 3: Test Checkout Session Creation

**Test:** Can create Stripe checkout session

```bash
curl -X POST http://localhost:5000/api/checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "plan": "starter",
    "billingPeriod": "monthly"
  }'
```

**Expected Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**✅ Pass:** Session ID returned and URL is valid Stripe checkout
**❌ Fail:** Error message or no URL

---

### Step 4: Test Email Verification

**Test:** Email verification endpoint works

```bash
curl -X POST http://localhost:5000/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "plan": "starter",
    "billingPeriod": "monthly"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification email sent to test@example.com. Check your inbox and click the link."
}
```

**✅ Pass:** Success message returned
**❌ Fail:** Error about email service or API key

---

### Step 5: Test Subscription Validation

**Test:** Check subscription status endpoint

```bash
curl http://localhost:5000/api/subscription/test@example.com
```

**Expected Response (if no subscription):**
```json
{
  "plan": "free",
  "status": "inactive"
}
```

**✅ Pass:** Returns plan and status
**❌ Fail:** 404 or error

---

### Step 6: Test Webhook Endpoint

**Test:** Webhook endpoint is accessible

```bash
curl -X POST http://localhost:5000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:** 400 Bad Request (because we're not sending a valid Stripe signature, which is expected)

**✅ Pass:** 400 status code (means endpoint exists and validates signature)
**❌ Fail:** 404 or 500 error

---

## Part 2: Extension Testing

### Prerequisites
- Google Chrome (latest version)
- Backend server running on localhost:5000
- Website to test on (e.g., google.com, medium.com, wikipedia.org)

### Step 1: Load the Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **"Load unpacked"**
5. Navigate to: `C:\Projects\AnswerEngineer.AI v1\chrome-extension`
6. Click **Select Folder**

**✅ Pass:** Extension appears in the list with icon
**❌ Fail:** Error message (check Manifest.json or permissions)

---

### Step 2: Verify Extension UI

1. Click the AnswerEngineer.AI extension icon in Chrome toolbar
2. Should see **Screen 1: URL Entry**
   - Logo visible
   - "Welcome!" text
   - URL input field (auto-populated with current tab URL)
   - "ANALYZE" button
   - "How it works" section

**✅ Pass:** All UI elements visible and properly styled
**❌ Fail:** Layout broken, missing elements, or styling issues

---

### Step 3: Navigate Through Screens

1. Click **"ANALYZE"** button
2. Should see **Screen 2: Welcome screen**
   - "Welcome!" title
   - "How it works" explanation
   - "LET'S GO!" button
   - "← Back" link

**Test:** Click "← Back" → should return to Screen 1

**✅ Pass:** Screen 2 displays correctly, back button works
**❌ Fail:** Screen doesn't load or styling broken

---

### Step 4: Run Audit on Real Website

1. Go to any website (e.g., open a new tab and navigate to **wikipedia.org**)
2. Click AnswerEngineer.AI extension icon
3. URL should auto-populate
4. Click **"ANALYZE"** → **"LET'S GO!"**
5. Wait for audit to complete (target: < 30 seconds)

**Expected Behavior:**
- Loading spinner appears
- "Analyzing your page..." message shows
- After ~5-15 seconds, Dashboard appears with:
  - Overall score (0-100) in a circular progress ring
  - 7 criteria listed with scores:
    - Website Structure
    - Schema Markup
    - Content Freshness
    - JavaScript Handling
    - Authority
    - CTR Signals
    - Coverage

**✅ Pass:** Audit completes, all 7 scores displayed with color coding
**❌ Fail:** Audit times out, shows error, or scores are 0/missing

---

### Step 5: Test Expandable Audit Details

1. In the **Point Audit** tab, click on any score (e.g., "Website Structure: 65")
2. Should expand to show:
   - CMS selector (WordPress, Shopify, Wix, etc.)
   - Priority/Recommended status
   - Step-by-step fix instructions for selected CMS
   - Hint to re-run after fixing

**Test:** Change CMS from dropdown → Detail text should update

**✅ Pass:** Details expand, CMS fixes change based on selection
**❌ Fail:** Doesn't expand, fixes don't update, or shows generic errors

---

### Step 6: Test AI Simulator Tab

1. Click **"AI Simulator"** tab
2. Should see:
   - Question text area
   - "START ANALYSIS" button
   - Status badge showing "FREE PLAN ONLY" (or "3 queries remaining")
   - Upgrade CTA button at bottom

3. Type a sample question: _"What is the best CRM for small businesses?"_
4. Click **"START ANALYSIS"**
5. Wait ~3-5 seconds

**Expected Result:**
- Results panel appears showing which AI engines mention the site:
  - ✅ ChatGPT
  - ❌ Claude
  - ✅ Gemini
  - etc. (based on GEO score)

**✅ Pass:** Engines show predicted mentions based on score
**❌ Fail:** No results, error message, or all engines show same status

---

### Step 7: Test Crawler View Tab

1. Click **"Crawler View"** tab
2. As **Free user**, should see:
   - Locked icon 🔒
   - "See your page in search engines" message
   - "UPGRADE TO STARTER" button

**✅ Pass:** Paywall shows correctly for free users
**❌ Fail:** Shows empty content or unlock message

---

### Step 8: Test History Tab

1. Click **"History"** tab
2. As **Free user**, should see:
   - Locked icon 🔒
   - "View Your Audit History" message (Starter+ only)
   - "UPGRADE TO STARTER" button

3. After running first audit, history should show:
   - Date/time of audit
   - Score (e.g., "65.2/100")
   - URL
   - 7 dimension scores
   - Change indicator (↑/↓/→)

**✅ Pass:** Locked message shows, history updates after audits
**❌ Fail:** Unlock without upgrade, or history not saving

---

### Step 9: Test Settings Tab

1. Click **"Settings"** tab
2. Should see:
   - Current URL displayed
   - Industry dropdown (15+ options)
   - Email input field
   - "Save settings" button
   - Current plan card showing:
     - "You're on the Free plan"
     - "3 AI Simulator queries · No search engine preview"
     - "UPGRADE TO STARTER" button
   - Debug button to reset plan

3. Fill in:
   - Industry: E-commerce
   - Email: your@email.com
4. Click "Save settings"

**Expected:** Button shows "Saved ✓" briefly, then reverts

**✅ Pass:** Settings save and persist, plan displays correctly
**❌ Fail:** Settings not saving, or plan info missing

---

### Step 10: Test Debug Panel (Ctrl+Shift+D)

1. While extension popup is open, press **Ctrl+Shift+D**
2. Should see debug output showing:
   - Audit events (✅/❌ messages)
   - API calls
   - Screenshot data
   - Error messages

**✅ Pass:** Debug panel shows logs
**❌ Fail:** Nothing happens or error

---

### Step 11: Test Multiple Audits

1. Go to a different website (e.g., github.com)
2. Click extension
3. Run another audit
4. Check History tab

**Expected:**
- New audit appears at top of history
- Previous audit still in list
- Scores show change compared to previous audit

**✅ Pass:** Multiple audits tracked per domain
**❌ Fail:** Previous audits missing or overwritten

---

### Step 12: Test Backend Connection

1. In Settings tab, enter your email
2. Click "UPGRADE TO STARTER"
3. Watch console (DevTools → Console)

**Expected:**
- Request goes to `http://localhost:5000/api/checkout-session`
- Response with Stripe checkout URL
- Redirects to Stripe checkout OR shows error

**✅ Pass:** Stripe checkout loads
**⚠️ Warning:** Backend error but system handles gracefully
**❌ Fail:** Network error, CORS issue, or unhandled error

---

## Checklist: What to Test

### Backend ✅
- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Checkout session creates successfully
- [ ] Verification email endpoint responds
- [ ] Subscription validation returns correct plan
- [ ] Webhook endpoint is reachable

### Extension ✅
- [ ] Loads in Chrome without manifest errors
- [ ] Screen 1 (URL Entry) displays correctly
- [ ] Screen 2 (Welcome) displays correctly
- [ ] Screen 3 (Dashboard) displays correctly
- [ ] Audit runs on real website < 30 seconds
- [ ] All 7 scores displayed with color coding
- [ ] Audit details expandable with CMS-specific fixes
- [ ] AI Simulator runs and shows engine predictions
- [ ] Crawler View shows paywall for free users
- [ ] History tracks multiple audits
- [ ] Settings tab saves preferences
- [ ] Plan info displays correctly
- [ ] Backend API call works (checkout session)

---

## Common Issues & Solutions

### Backend Won't Start
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Port 5000 is already in use. Kill process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

### Extension Won't Load
```
Error: Could not load the manifest
```
**Solution:** Check manifest.json syntax:
```bash
# Validate JSON at https://jsonlint.com/
```

---

### Audit Returns All Zeros
**Cause:** Content script not injecting properly
**Solution:**
1. Check manifest.json permissions
2. Verify content-script-real-audit.js exists in chrome-extension folder
3. Hard refresh Chrome (Ctrl+Shift+R)
4. Reload extension (refresh on chrome://extensions/)

---

### Backend API Returns CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Backend already has CORS configured. Verify:
```javascript
// In server.js, should have:
app.use(cors({
  origin: ['chrome-extension://*', 'http://localhost:3000'],
  credentials: true
}));
```

---

### Stripe Checkout URL Fails
**Cause:** Invalid price ID or Stripe test key
**Solution:**
1. Check .env file has valid STRIPE_STARTER_MONTHLY price
2. Verify at https://dashboard.stripe.com/test/products
3. Make sure key starts with `price_` not `prod_`

---

## Success Criteria (MVP)

✅ Backend starts and all endpoints respond  
✅ Extension loads without errors  
✅ Audit completes in < 30 seconds  
✅ All 7 scores display correctly  
✅ CMS-specific fixes appear  
✅ Settings save and persist  
✅ Backend API call works (checkout session)  

**Once all criteria pass: Ready for deployment!** 🚀

---

## Next Steps After Testing

1. ✅ Document any bugs found
2. ✅ Fix critical issues
3. ✅ Re-test fixed features
4. ✅ Set up PostgreSQL database (optional for MVP)
5. ✅ Deploy backend to Heroku/Vercel
6. ✅ Submit extension to Chrome Web Store (or manual distribution)

---

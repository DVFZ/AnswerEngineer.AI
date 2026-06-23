# MVP Testing Execution Plan

## PART 1: BACKEND TESTING (Quick Start)

### Terminal Setup
Open Command Prompt and navigate to the backend:
```
cd C:\Projects\AnswerEngineer.AI v1\backend
node server.js
```

**Expected Output:**
```
Server running on http://localhost:5000
```

---

### Test 1: Health Check ✅
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"ok"}`

---

### Test 2: Create Checkout Session ✅
```bash
curl -X POST http://localhost:5000/api/checkout-session ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"plan\":\"starter\",\"billingPeriod\":\"monthly\"}"
```
**Expected:** Session ID and Stripe checkout URL

---

### Test 3: Check Subscription ✅
```bash
curl http://localhost:5000/api/subscription/test@example.com
```
**Expected:** `{"plan":"free","status":"inactive"}`

---

## PART 2: EXTENSION TESTING (Manual)

### Step 1: Open Chrome Developer Mode
1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Toggle **Developer mode** (top right)
4. Click **Load unpacked**
5. Select: `C:\Projects\AnswerEngineer.AI v1\chrome-extension`
6. Click **Select Folder**

✅ Extension should appear in the list

---

### Step 2: Test Extension UI
1. Open a new tab and navigate to **wikipedia.org**
2. Click the **AnswerEngineer.AI** extension icon
3. Verify Screen 1 shows:
   - Logo
   - "Welcome!" text
   - URL input (auto-populated)
   - ANALYZE button

✅ Click **ANALYZE** button

---

### Step 3: Test Welcome Screen
Should see Screen 2:
- "Welcome!" header
- "How it works" section
- "LET'S GO!" button

✅ Click **LET'S GO!**

---

### Step 4: Run Audit
Should see Screen 3 (Dashboard):
- Loading spinner appears
- "Analyzing your page..." message
- After 5-15 seconds: Results with 7 scores

**Expected Scores:** Each criterion (1-100):
- Website Structure
- Schema Markup
- Content Freshness
- JavaScript Handling
- Authority
- CTR Signals
- Coverage

✅ **AUDIT MUST COMPLETE IN < 30 SECONDS**

---

### Step 5: Test Audit Details
1. Click on any score (e.g., "Website Structure: 65")
2. Detail expands showing:
   - CMS selector dropdown
   - Priority/Recommended status
   - Step-by-step fix instructions
   
✅ Change CMS → Instructions should update

---

### Step 6: Test AI Simulator Tab
1. Click **"AI Simulator"** tab
2. Type a question: _"What is the best CRM?"_
3. Click **"START ANALYSIS"**
4. Wait 3-5 seconds

✅ Should show which AI engines mention the site

---

### Step 7: Test Crawler View Tab
1. Click **"Crawler View"** tab
2. Should show lock icon 🔒
3. Display: "See your page in search engines"
4. "UPGRADE TO STARTER" button visible

✅ Paywall shows for free users

---

### Step 8: Test History Tab
1. Click **"History"** tab
2. Should show lock icon 🔒
3. Display: "View Your Audit History"

✅ Locked message shows

---

### Step 9: Test Settings Tab
1. Click **"Settings"** tab
2. Verify displays:
   - Current URL
   - Industry dropdown
   - Email field
   - "Save settings" button
   - Plan card showing "Free plan"
   - "UPGRADE TO STARTER" button

3. Enter email: `test@example.com`
4. Select industry: `E-commerce`
5. Click **"Save settings"**

✅ Button shows "Saved ✓" briefly

---

### Step 10: Test Backend Integration
1. In Settings tab, click **"UPGRADE TO STARTER"**
2. Open Chrome DevTools (F12 → Console tab)
3. Should see POST request to: `http://localhost:5000/api/checkout-session`
4. Should see response with Stripe URL

✅ No CORS errors, response received

---

### Step 11: Test Multiple Audits
1. Go to **github.com**
2. Click extension → Run another audit
3. Go back to History tab

✅ Both audits listed
✅ Shows change in score (↑/↓/→)

---

### Step 12: Debug Panel
While extension popup open:
```
Press: Ctrl+Shift+D
```

✅ Debug console opens with logs

---

## Success Checklist

### Backend ✅
- [ ] Server starts on port 5000
- [ ] Health endpoint responds
- [ ] Checkout session endpoint works
- [ ] Subscription check endpoint works
- [ ] No database errors (should use in-memory store)

### Extension ✅
- [ ] Loads without manifest errors
- [ ] Screen 1 displays correctly
- [ ] Screen 2 displays correctly
- [ ] Screen 3 dashboard loads
- [ ] Audit completes < 30 seconds
- [ ] All 7 scores visible
- [ ] Scores not all 0
- [ ] Audit details expandable
- [ ] CMS selector changes fixes
- [ ] AI Simulator tab works
- [ ] Crawler View shows paywall
- [ ] History shows paywall
- [ ] Settings saves preferences
- [ ] Backend API call succeeds
- [ ] Multiple audits tracked

---

## Troubleshooting

### "Extension won't load"
→ Check manifest.json exists and has valid JSON

### "Audit returns all zeros"
→ Hard refresh Chrome: Ctrl+Shift+R
→ Reload extension on chrome://extensions/

### "Backend won't start on port 5000"
→ Another process using port. Kill it:
```
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Backend API returns CORS error"
→ Server has CORS configured
→ Check console for actual error

### "Audit takes > 30 seconds"
→ Performance issue - check content script injection
→ May be heavy website

---

## What To Do After Tests Pass

✅ Document results
✅ Fix any bugs found
✅ Re-test fixed features
✅ Ready for deployment!

---

**Estimated Test Time: 20-30 minutes**


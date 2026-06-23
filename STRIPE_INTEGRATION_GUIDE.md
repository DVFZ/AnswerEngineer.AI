# Stripe Payment Integration Guide

## What's Been Done

### 1. Extension Integration (popup.js)
- Upgrade buttons now call `showUpgradePrompt()`
- Collects user email (from settings or prompts)
- POSTs to backend: `http://localhost:5000/api/checkout-session`
- Redirects to Stripe Checkout URL
- Loading state on button during checkout

### 2. Backend Integration (server.js)
- `/api/checkout-session` endpoint accepts POST with email, plan, billingPeriod
- Creates Stripe customer (or reuses existing)
- Creates checkout session with test price IDs
- Returns Stripe checkout URL
- `/success` and `/cancel` routes serve success.html and cancel.html

### 3. Frontend Pages
- **success.html** — Shows after successful payment, auto-closes tab after 5 seconds
- **cancel.html** — Shows if user cancels payment

### 4. Environment Setup
- Created `.env` file in backend with placeholder values

---

## Next Steps: Test the Flow

### Step 1: Get Stripe Test Keys
1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret Key** (starts with `sk_test_`)
3. Copy your **Publishable Key** (starts with `pk_test_`)

### Step 2: Create Test Products & Prices
1. Go to [https://dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products)
2. Create a product called "Starter Monthly"
3. Add a price: **$19/month**
4. Copy the price ID (starts with `price_`)
5. Repeat for Pro, Agency, and Annual plans (or just use Starter for now)

### Step 3: Update .env
Update `C:\Projects\AnswerEngineer.AI v1\backend\.env`:
```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_STARTER_MONTHLY=price_YOUR_PRICE_ID_HERE
```

### Step 4: Restart Backend
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd C:\Projects\AnswerEngineer.AI\ v1\backend
node server.js
```

### Step 5: Test in Extension
1. Open the extension dashboard (or click ANALYZE on any site)
2. Click "UPGRADE TO STARTER" button
3. Enter an email address (any valid email)
4. Should redirect to Stripe test checkout
5. **Use Stripe test card**: `4242 4242 4242 4242` | Any future date | Any CVC
6. After payment, should show success page

---

## Troubleshooting

### "Error starting checkout"
- Check backend is running (`curl http://localhost:5000/health`)
- Check STRIPE_SECRET_KEY is set in .env
- Check browser console for full error

### "Invalid plan or billing period"
- Make sure STRIPE_STARTER_MONTHLY price ID is set in .env
- Price IDs must start with `price_`

### Payment redirects to Stripe but closes immediately
- This is normal in test mode if using the test card
- Use `4242 4242 4242 4242` for successful test payments

### After successful payment, plan doesn't persist
- Currently using localStorage per-domain
- Next phase: Save to backend database
- For now, the success page confirms payment went through

---

## What's Next (After Payment Works)

1. **Persist subscriptions** — Save to database instead of localStorage
2. **Webhook handling** — Listen for Stripe webhook events
3. **Validate subscriptions** — Check backend on startup
4. **Auto-upgrade features** — Unlock premium features when subscription confirmed
5. **Billing portal** — Let users manage subscriptions

---

## Test Cards

| Card | CVC | Date | Result |
|------|-----|------|--------|
| 4242 4242 4242 4242 | Any | Any future | ✓ Success |
| 4000 0000 0000 0002 | Any | Any future | ✗ Declined |
| 4000 0025 0000 3155 | Any | Any future | ✗ Requires 3D Secure |

[Full list of test cards](https://stripe.com/docs/testing#cards)

---

## File Changes

- ✨ `backend/.env` — NEW environment variables
- ✨ `backend/success.html` — NEW success page
- ✨ `backend/cancel.html` — NEW cancel page
- ✏️ `backend/server.js` — Added /success and /cancel routes
- ✏️ `chrome-extension/popup.js` — Integrated Stripe checkout flow

---

**Questions?** Check the browser console and backend logs for error details.

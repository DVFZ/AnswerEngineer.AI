# AnswerEngineer.AI Backend Setup Guide

Complete guide to set up payment processing with Stripe.

---

## STEP 1: Database Setup

### Local Development (PostgreSQL)

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org

# Start PostgreSQL
brew services start postgresql

# Create database
createdb answerengineer

# Load schema
psql answerengineer < database.sql

# Verify
psql answerengineer -c "\dt"
```

### Production Database

Use one of:
- **Heroku PostgreSQL** (easiest for Heroku deployment)
- **AWS RDS**
- **DigitalOcean Managed Database**
- **Render.com Database**

Get your connection string and set as `DATABASE_URL`.

---

## STEP 2: Stripe Setup

### 1. Create Stripe Account
- Go to **stripe.com** → Sign up
- Get **Publishable Key** and **Secret Key** from Dashboard

### 2. Create Products & Prices

In Stripe Dashboard → **Products** → **Create Product**:

**Starter Plan**
```
Product Name: Starter
Price 1: $19/month (Monthly)
Price 2: $190/year (Annual - ~17% discount)
```

**Pro Plan**
```
Product Name: Pro
Price 1: $49/month (Monthly)
Price 2: $490/year (Annual - ~17% discount)
```

**Agency Plan**
```
Product Name: Agency
Price 1: $99/month (Monthly)
Price 2: $990/year (Annual - ~17% discount)
```

Copy the **Price IDs** (look like `price_xxx`) and add to `.env`

### 3. Set Up Webhook

In Stripe Dashboard → **Webhooks** → **Add Endpoint**:

```
Endpoint URL: https://your-backend.com/api/webhook
Events to listen to:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - charge.succeeded
  - charge.failed
```

Copy **Signing Secret** and add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode vs Live Mode

- **Development:** Use `pk_test_*` and `sk_test_*` keys
- **Production:** Switch to `pk_live_*` and `sk_live_*` keys

---

## STEP 3: Backend Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Test Locally

```bash
npm run dev
# Should see: 🚀 AnswerEngineer.AI Backend running on port 5000
```

Test endpoints:
```bash
# Health check
curl http://localhost:5000/health

# Validate subscription (should return free plan)
curl http://localhost:5000/api/subscription/test@example.com
```

---

## STEP 4: Deploy Backend

### Option A: Heroku (Easiest)

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create answerengineer-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set STRIPE_STARTER_MONTHLY=price_...
# ... add all STRIPE price IDs
heroku config:set ADMIN_KEY=your-secret-key
heroku config:set FRONTEND_URL=https://your-domain.com

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

Your backend URL: `https://answerengineer-backend.herokuapp.com`

### Option B: Railway.app

```bash
# Sign up at railway.app
# Connect GitHub repo
# Add PostgreSQL database
# Set environment variables in Railway dashboard
# Deploy
```

Your backend URL will be provided by Railway.

### Option C: DigitalOcean App Platform

- Create new app
- Connect GitHub
- Add PostgreSQL database
- Set environment variables
- Deploy

---

## STEP 5: Integrate with Extension

Update `popup.js` in the extension:

```javascript
const BACKEND_URL = 'https://your-backend-url.com'; // Set to your deployed backend

// In Settings tab, add upgrade handler
async function upgradeToStarter(plan, billingPeriod) {
  const email = document.getElementById('set-email').value;
  if (!email) {
    alert('Please enter your email in Settings first');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan, billingPeriod })
    });

    const { url } = await response.json();
    
    // Redirect to Stripe Checkout
    chrome.tabs.create({ url });
  } catch (error) {
    console.error('Checkout error:', error);
  }
}

// After payment, validate subscription
async function validateSubscription(email) {
  const response = await fetch(`${BACKEND_URL}/api/subscription/${email}`);
  const subscription = await response.json();
  
  // Store license key
  localStorage.setItem('ae_license_key', subscription.licenseKey);
  localStorage.setItem('ae_plan', subscription.plan);
  
  return subscription;
}
```

---

## STEP 6: Testing

### Test Payment Flow

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC

### Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhook

# Trigger test event
stripe trigger customer.subscription.created
```

---

## STEP 7: Go Live

### Before Production:

1. ✅ Test all payment flows
2. ✅ Test Stripe webhooks
3. ✅ Verify subscription validation
4. ✅ Test on multiple browsers
5. ✅ Verify emails are correct
6. ✅ Set up error logging/monitoring

### Switch to Live Keys:

1. In Stripe Dashboard → View Test Data → Toggle "Viewing test data"
2. Copy **Live** public and secret keys
3. Update `STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY` in production environment
4. Update Stripe Price IDs to live versions
5. Redeploy backend

---

## Troubleshooting

### Payment Not Processing

- ✅ Verify webhook is returning `{ received: true }`
- ✅ Check Stripe Dashboard → Events for errors
- ✅ Ensure `STRIPE_WEBHOOK_SECRET` is exactly right

### Database Connection Error

- ✅ Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- ✅ Check PostgreSQL is running
- ✅ Verify firewall allows connections

### Checkout Session Fails

- ✅ Verify Price IDs exist in Stripe
- ✅ Check all environment variables are set
- ✅ Ensure email is valid format

### Extension Can't Reach Backend

- ✅ Add backend URL to manifest.json permissions
- ✅ Verify CORS is enabled
- ✅ Check backend is actually running (test /health endpoint)

---

## API Reference

### POST /api/checkout-session
Creates Stripe Checkout session for payment

**Request:**
```json
{
  "email": "user@example.com",
  "plan": "starter",
  "billingPeriod": "monthly"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

### GET /api/subscription/:email
Get subscription status for user

**Response:**
```json
{
  "plan": "starter",
  "billingPeriod": "monthly",
  "status": "active",
  "currentPeriodEnd": "2024-12-25T00:00:00Z",
  "licenseKey": "uuid-..."
}
```

### POST /api/webhook
Stripe webhook endpoint (automatic)

### POST /api/cancel-subscription
Cancel user's subscription

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /api/validate-license
Validate license key

**Request:**
```json
{
  "licenseKey": "uuid-..."
}
```

**Response:**
```json
{
  "valid": true,
  "plan": "starter",
  "status": "active"
}
```

---

## Support

For issues:
1. Check `heroku logs --tail` (if using Heroku)
2. Check Stripe Dashboard → Events for webhook errors
3. Check backend console logs
4. Verify all environment variables are set correctly

# Migrate to Supabase - Complete Integration Guide

**Date:** June 20, 2026  
**Status:** Migration Plan  
**Benefit:** Skip domain verification, built-in email verification, cleaner architecture

---

## 📋 Overview: What Changes

| Aspect | Before (Resend) | After (Supabase) |
|--------|-----------------|------------------|
| Email Service | Resend | Supabase Auth |
| Database | PostgreSQL (manual) | Supabase PostgreSQL |
| Verification | Manual tokens | Built-in Auth flows |
| Domain Setup | Required | ❌ Not needed |
| Signup Flow | Custom | Built-in |
| Cost | Free | Free |

---

## 🚀 Step 1: Create Supabase Project

### 1a. Sign Up
- Go to: https://supabase.com
- Click **"Start your project"**
- Sign up with email: `contact@digitalventuresfz.com`

### 1b. Create Project
- Click **"New Project"**
- Name: `answerengineer`
- Database Password: (strong password)
- Region: Choose closest to you
- Click **"Create new project"** (takes 2-3 minutes)

### 1c. Get Connection Details
Once project is created:
- Go to **Settings → Database**
- Copy:
  - **Host:** `...supabase.co`
  - **Database:** `postgres`
  - **Username:** `postgres`
  - **Password:** (the one you set)
  - **Port:** `5432`

---

## 🔑 Step 2: Get Supabase Keys

In Supabase dashboard:
- Go to **Settings → API**
- Copy these keys:
  - **Project URL:** `https://xxx.supabase.co`
  - **Anon Key:** `eyJhbGc...` (public)
  - **Service Role Key:** `eyJhbGc...` (secret - keep safe!)

---

## 🛠️ Step 3: Update Backend `.env`

Replace current `.env` with:

```env
# Node Environment
NODE_ENV=development
PORT=5000

# Supabase Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@xxx.supabase.co:5432/postgres

# Supabase Auth (for verification emails)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Stripe (unchanged)
STRIPE_SECRET_KEY=sk_test_51PE0CBL3kNHC9ONYDTbj87ZG31x3tjoKD8d0JFLHnpK80Msv39ZDiE2DbaiRyc94IfdpVkXz4RKDoF9qE9kgWU5i00gGCUMDwI
STRIPE_STARTER_MONTHLY=price_1TiUoPL3kNHC9ONYtWIp6gwA
STRIPE_STARTER_ANNUAL=price_1TiUoPL3kNHC9ONYSLl9Mw8I
STRIPE_PRO_MONTHLY=price_test_pro_monthly
STRIPE_PRO_ANNUAL=price_test_pro_annual
STRIPE_AGENCY_MONTHLY=price_test_agency_monthly
STRIPE_AGENCY_ANNUAL=price_test_agency_annual

# Frontend
FRONTEND_URL=http://localhost:5000

# Admin key
ADMIN_KEY=test-admin-key
```

---

## 📝 Step 4: Create Database Tables in Supabase

Go to **Supabase Dashboard → SQL Editor**

Run this SQL to create tables:

```sql
-- Users table (for subscription tracking)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  billing_period VARCHAR(20) DEFAULT 'monthly',
  status VARCHAR(50) DEFAULT 'inactive',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  license_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL REFERENCES users(email),
  plan VARCHAR(50) DEFAULT 'free',
  billing_period VARCHAR(20) DEFAULT 'monthly',
  status VARCHAR(50) DEFAULT 'inactive',
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  license_key VARCHAR(255) UNIQUE,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment history
CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL REFERENCES users(email),
  stripe_charge_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2),
  currency VARCHAR(10),
  status VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_payment_history_email ON payment_history(email);
```

---

## 💻 Step 5: Update Backend Code

### 5a. Install Supabase Package

```bash
cd backend
npm install @supabase/supabase-js
npm install
```

### 5b. Update server.js

Add at the top after imports:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
```

### 5c. Replace Email Verification Endpoint

**OLD (Resend):**
```javascript
app.post('/api/send-verification-email', async (req, res) => {
  // ... Resend logic
});
```

**NEW (Supabase):**
```javascript
// ============================================
// EMAIL VERIFICATION - Supabase Auth
// ============================================
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, plan, billingPeriod } = req.body;

    if (!email || !password || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user in Supabase Auth (sends verification email automatically!)
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false // User must verify email
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Store subscription info in database
    await supabase
      .from('users')
      .insert({
        email: email,
        plan: plan,
        billing_period: billingPeriod || 'monthly',
        status: 'pending_verification' // Wait for email verification
      });

    console.log(`✅ Signup initiated for ${email}. Verification email sent.`);

    res.json({
      success: true,
      message: `Verification email sent to ${email}. Please check your email and click the verification link.`,
      userId: data.user.id
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// VERIFY EMAIL WEBHOOK (Supabase Auth triggers this)
// ============================================
app.post('/api/auth-webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'user.sign_up' || type === 'user.email_confirmed') {
      const email = data.user.email;

      // Update user status to active
      const { error } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('email', email);

      if (error) {
        console.error('Error updating user:', error);
      } else {
        console.log(`✅ Email verified and subscription activated: ${email}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 5d. Replace Subscription Check Endpoint

**NEW (Query Supabase):**
```javascript
app.get('/api/subscription/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return res.json({ plan: 'free', status: 'inactive' });
    }

    res.json({
      plan: data.plan || 'free',
      status: data.status || 'inactive',
      billingPeriod: data.billing_period,
      email: data.email
    });
  } catch (error) {
    res.json({ plan: 'free', status: 'inactive' });
  }
});
```

---

## 📧 Step 6: Configure Email in Supabase

In Supabase Dashboard:
1. Go to **Authentication → Providers**
2. Enable **Email** (should be on by default)
3. Go to **Email Templates**
4. Customize verification email (optional)

**Supabase sends verification emails automatically!** No manual setup needed. ✅

---

## 🔗 Step 7: Configure Auth Webhook (Optional but Recommended)

In Supabase Dashboard:
1. Go to **Database → Extensions**
2. Enable **HTTP Request** extension
3. Create a webhook for email confirmations:
   - Event: `user.email_confirmed`
   - URL: `http://localhost:5000/api/auth-webhook`
   - Headers: None

---

## 🧪 Step 8: Test Signup & Verification

### Test 1: User Signs Up
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123","plan":"starter"}'
```

**Expected:** Verification email sent to `testuser@example.com`

### Test 2: Click Verification Link in Email
- Check email
- Click verification link
- Should be redirected to Supabase confirmation page
- Email automatically confirmed ✅

### Test 3: Check Subscription
```bash
curl http://localhost:5000/api/subscription/testuser@example.com
```

**Expected:** `{"plan":"starter","status":"active",...}`

---

## 🎯 Step 9: Update Extension (popup.js)

Change upgrade flow to use new endpoint:

```javascript
// In popup.js, update upgrade button handler:
document.getElementById('settings-upgrade-cta').addEventListener('click', async () => {
  const email = document.getElementById('set-email').value;
  const plan = 'starter';

  // New: Signup with verification email
  const response = await fetch(`${BACKEND_URL}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: 'temp_password_' + Date.now(), // Generate temp password
      plan: plan,
      billingPeriod: 'monthly'
    })
  });

  const result = await response.json();
  if (result.success) {
    alert(`Verification email sent to ${email}. Please check your email!`);
  }
});
```

---

## 📊 Benefits Summary

✅ **No domain verification needed**  
✅ **Email verification automatic (Supabase handles it)**  
✅ **PostgreSQL included (what you need anyway)**  
✅ **Built-in Auth system**  
✅ **Free tier covers MVP**  
✅ **Cleaner code structure**  
✅ **Easy to scale**  
✅ **Better security** (Supabase handles password hashing)

---

## 🔄 What Gets Removed

❌ Remove Resend from `.env` (no longer needed)  
❌ Remove `verify.html` (Supabase handles it)  
❌ Remove `send-verification-email` endpoint  
❌ Remove manual token management  

---

## 📋 Migration Checklist

- [ ] Create Supabase project
- [ ] Get Supabase keys
- [ ] Update `.env`
- [ ] Run SQL to create tables
- [ ] Install Supabase package (`npm install @supabase/supabase-js`)
- [ ] Update backend server.js
- [ ] Test signup endpoint
- [ ] Check verification email
- [ ] Click verification link
- [ ] Test subscription check
- [ ] Update extension popup.js
- [ ] Test end-to-end

---

## 🚀 What Happens When User Signs Up

1. User clicks "UPGRADE" in extension
2. Extension calls `/api/signup` with email
3. Backend creates user in Supabase Auth
4. **Supabase automatically sends verification email** ✅
5. User clicks link in email
6. Email confirmed in Supabase
7. Webhook triggers → User status set to "active"
8. Subscription is activated ✅

**No manual email sending. No domain verification. No tokens. Pure simplicity.** 🎉

---

## 💡 Pro Tips

1. **Test Mode:** Use Supabase test project for development
2. **Production:** Create separate Supabase project for production
3. **Email Templates:** Customize verification email in Supabase dashboard
4. **Password Reset:** Supabase also handles password reset emails automatically
5. **Social Auth:** Later, easily add Google/GitHub login via Supabase

---

## ❓ Questions?

When you're ready to start, let me know and I'll:
1. Guide you through Supabase setup
2. Help update the backend code
3. Test the integration
4. Deploy everything

Ready to switch? 🚀


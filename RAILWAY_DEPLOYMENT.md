# Railway Deployment Guide 🚀

**Goal:** Deploy backend to Railway with public URL  
**Time:** 10-15 minutes  
**Cost:** Free tier available

---

## 📋 **Step 1: Create Railway Account**

1. Go to: https://railway.app
2. Click **"Start Project"**
3. Sign up with GitHub or email
4. Verify email

✅ **Account created!**

---

## 🚀 **Step 2: Connect Your GitHub Repository**

1. After signing up, click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Click **"Connect GitHub Account"**
4. Authorize Railway to access your repos
5. Select your project repo: `AnswerEngineer.AI`
6. Click **"Deploy"**

✅ **Repository connected!**

---

## ⚙️ **Step 3: Configure Environment Variables**

Railway will detect it's a Node.js project automatically.

**Add your environment variables:**

1. In Railway dashboard, click your project
2. Go to **"Variables"** tab
3. Add each variable from your `.env`:

```
NODE_ENV=production
PORT=5000

RESEND_API_KEY=[your-key]
RESEND_FROM_EMAIL=contact@answerengineer.ai

SUPABASE_URL=https://pzpzqrauxbriqklwopwn.supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_KEY=[your-service-key]

STRIPE_PUBLIC_KEY=[your-public-key]
STRIPE_SECRET_KEY=[your-secret-key]
STRIPE_WEBHOOK_SECRET=[your-webhook-secret]
STRIPE_STARTER_MONTHLY=[price-id]
STRIPE_STARTER_ANNUAL=[price-id]
STRIPE_PRO_MONTHLY=[price-id]
STRIPE_PRO_ANNUAL=[price-id]
STRIPE_AGENCY_MONTHLY=[price-id]
STRIPE_AGENCY_ANNUAL=[price-id]

FRONTEND_URL=[will-get-this-from-railway]
ADMIN_KEY=[your-admin-key]
```

✅ **Variables added!**

---

## 🔗 **Step 4: Get Your Public URL**

1. In Railway dashboard, click your project
2. Look for **"Deployments"** tab
3. Your deployment should show a **public URL**
   - Looks like: `https://answerengineer-backend-prod.railway.app`
4. **Copy this URL**

✅ **You have a public URL!**

---

## 🔄 **Step 5: Update FRONTEND_URL**

Now update your local `.env` to use the Railway URL:

**File:** `C:\Projects\AnswerEngineer.AI v1\backend\.env`

Change:
```env
# FROM:
FRONTEND_URL=http://
# AnswerEngineer.AI Deployment Guide

## Problem
Magic links only work locally because they point to `http://localhost:3000`. Clicking them from other devices shows "This site can't be reached".

## Solution
Deploy both backend and frontend to public servers with proper environment variables.

---

## Step 1: Deploy Backend to Render (Node.js Server)

### 1.1 Create Render Account
- Go to https://render.com
- Sign up (free tier available)
- Connect your GitHub account

### 1.2 Push Code to GitHub
```bash
cd C:\Projects\AnswerEngineer.AI v1
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/AnswerEngineer.AI.git
git push -u origin main
```

### 1.3 Deploy Backend Service
1. Go to Render Dashboard → New → Web Service
2. Select your GitHub repo
3. Configure:
   - **Name**: `answerengineer-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

### 1.4 Add Environment Variables in Render
Add these in Render Dashboard → Environment:
```
PORT=3000
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_STARTER_MONTHLY=price_xxxxx
STRIPE_STARTER_ANNUAL=price_xxxxx
STRIPE_PRO_MONTHLY=price_xxxxx
STRIPE_PRO_ANNUAL=price_xxxxx
STRIPE_AGENCY_MONTHLY=price_xxxxx
STRIPE_AGENCY_ANNUAL=price_xxxxx
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@answerengineer.ai
FRONTEND_URL=https://your-frontend-url.com
ADMIN_KEY=your_admin_key
```

**Your backend URL will be**: `https://answerengineer-backend-xxxxx.onrender.com`

---

## Step 2: Deploy Frontend to Vercel or Netlify

### Option A: Vercel (Recommended for Next.js/React)
1. Go to https://vercel.com
2. Import your GitHub repo
3. Configure:
   - **Framework**: Other (or your framework if applicable)
   - **Build Command**: As needed for your frontend
4. Add environment variable:
   ```
   VITE_BACKEND_URL=https://answerengineer-backend-xxxxx.onrender.com
   VITE_FRONTEND_URL=https://your-vercel-deployment.vercel.app
   ```

### Option B: Netlify
1. Go to https://netlify.com
2. Connect GitHub repo
3. Deploy settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (or as needed)
4. Add environment variables in Netlify settings

**Your frontend URL will be**: `https://your-site.vercel.app` or `https://your-site.netlify.app`

---

## Step 3: Update Magic Link Configuration

After deployment, update your `server.js`:

```javascript
// Line 186 - Magic link URL
const magicLinkUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
```

This now uses your deployed FRONTEND_URL instead of localhost.

---

## Step 4: Update CORS Settings

In `server.js` line 44-48, your CORS is already configured to accept:
```javascript
cors({
  origin: [
    'chrome-extension://*',
    'http://localhost:3000',
    process.env.FRONTEND_URL  // ✅ This will use your deployed URL
  ],
  credentials: true
})
```

Make sure `FRONTEND_URL` is set in environment variables.

---

## Step 5: Test Magic Links

1. Deploy backend to Render
2. Deploy frontend to Vercel/Netlify
3. Send a magic link test email
4. Click the link from another device or incognito window
5. Verify you can sign in

---

## Quick Commands

### Test locally before deploying:
```bash
cd backend
npm install
NODE_ENV=production npm start
```

### Check environment variables:
```bash
echo $FRONTEND_URL
echo $DATABASE_URL
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid or expired magic link" | Verify `FRONTEND_URL` matches exactly in Render |
| CORS error from frontend | Add frontend URL to `cors()` in server.js |
| Webhook failures | Update Stripe webhook endpoint to your Render URL |
| Email not sending | Check `RESEND_API_KEY` and `RESEND_FROM_EMAIL` |

---

## Cost Estimate
- **Render Backend**: $0-7/month (free tier: 0.5GB RAM, shared CPU)
- **Vercel Frontend**: $0/month (free tier)
- **Total**: Free to start, scale as needed

---

## Next Steps
1. ✅ Push code to GitHub
2. ✅ Create Render account and deploy backend
3. ✅ Get your backend public URL
4. ✅ Update environment variables
5. ✅ Deploy frontend to Vercel
6. ✅ Test magic links from different device

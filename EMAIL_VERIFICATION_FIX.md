# Email Verification Fixes - AnswerEngineer.AI v1

**Date:** June 20, 2026  
**Status:** Complete - All email verification issues fixed

---

## Issues Fixed ✅

### Issue 1: Email Verification Link Uses Localhost
**Problem:** When users receive verification emails, the link uses `http://localhost:5000`, which only works on the local computer. Clicking the link from any other device fails.

**Solution Applied:**
- ✅ `verify.html` - Changed from hardcoded `http://localhost:5000` to dynamic `window.location.origin`
- ✅ `popup.js` - Added `BACKEND_URL` configuration variable
- ✅ All 3 backend API calls now use configurable URL instead of hardcoded localhost

**How It Works Now:**
- Local development: Stays as `http://localhost:5000`
- Production: Automatically uses whatever domain the backend is deployed to

---

### Issue 2: Support for Multiple Emails
**Status:** Already working ✅

The backend doesn't hardcode any specific email. Any email address can be verified as long as:
1. ✅ Verification token is valid
2. ✅ Verification link is reachable
3. ✅ Resend API key is configured correctly

---

## Deployment Setup for Production

### Step 1: Choose Backend Hosting
Pick one:

**Option A: Heroku (Easiest)**
```bash
heroku create answerengineer-backend
heroku addons:create heroku-postgresql:hobby-dev
```

**Option B: Vercel**
```bash
vercel deploy
```

**Option C: Railway.app**
- Sign up, connect GitHub, deploy

### Step 2: Update Environment Variables

Once deployed, set these in your hosting platform:

```env
# Example: Heroku
heroku config:set FRONTEND_URL=https://answerengineer-backend.herokuapp.com
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set STRIPE_STARTER_MONTHLY=price_...
heroku config:set STRIPE_STARTER_ANNUAL=price_...
heroku config:set RESEND_API_KEY=re_...
heroku config:set DATABASE_URL=postgresql://...
```

### Step 3: Update Extension Configuration

In `chrome-extension/popup.js`, update line 8:

```javascript
// LOCAL DEVELOPMENT
const BACKEND_URL = 'http://localhost:5000';

// PRODUCTION (for deployment)
// const BACKEND_URL = 'https://answerengineer-backend.herokuapp.com';
```

When deploying to production, comment out localhost and uncomment your production URL.

### Step 4: Update Backend .env

In `backend/.env`, update FRONTEND_URL:

```env
# LOCAL DEVELOPMENT
FRONTEND_URL=http://localhost:5000

# PRODUCTION
# FRONTEND_URL=https://answerengineer-backend.herokuapp.com
```

---

## Testing Email Verification (Local)

### Test 1: Multiple Emails Work
```bash
# Terminal 1: Start backend
cd backend
node server.js

# Terminal 2: Test different emails
curl -X POST http://localhost:5000/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","plan":"starter"}'

curl -X POST http://localhost:5000/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com","plan":"pro"}'

curl -X POST http://localhost:5000/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user3@gmail.com","plan":"agency"}'
```

### Test 2: Email Link Works Locally
1. After running above commands, check terminal output for verification link
2. Copy the link from terminal (e.g., `http://localhost:5000/verify?token=xyz...`)
3. Paste into browser
4. Should see: "Email Verified! ✅"

### Test 3: Verify Subscription Created
```bash
# Check the first email
curl http://localhost:5000/api/subscription/user1@example.com
# Expected: {"plan":"starter","status":"active",...}

curl http://localhost:5000/api/subscription/user2@example.com
# Expected: {"plan":"pro","status":"active",...}

curl http://localhost:5000/api/subscription/user3@gmail.com
# Expected: {"plan":"agency","status":"active",...}
```

---

## Production Email Verification Workflow

### Step 1: User clicks "UPGRADE TO STARTER" in extension
```
Extension sends: POST /api/checkout-session
```

### Step 2: After payment (Stripe webhook)
```
Stripe → Backend webhook → Creates subscription → Sends verification email
Email contains: https://answerengineer-backend.herokuapp.com/verify?token=xxx
```

### Step 3: User clicks link in their email (from any device)
```
Browser requests: https://answerengineer-backend.herokuapp.com/verify?token=xxx
verify.html loads with JavaScript
JavaScript calls: GET /api/verify/xxx (same domain)
Backend verifies token and activates subscription
```

### Step 4: Success page shows
```
✅ Email Verified!
Your subscription is now active.
(Auto-closes after 5 seconds)
```

---

## Verification Token Security

Tokens are:
- ✅ Generated using crypto.randomBytes(32).toString('hex')
- ✅ Unique per email + plan combination
- ✅ Expire after 24 hours
- ✅ Stored in-memory (or PostgreSQL if configured)
- ✅ Single-use (deleted after verification)

---

## Email Service Configuration

Using **Resend.com** for email delivery:

### Set Up Resend
1. Go to https://resend.com
2. Create account
3. Get API key
4. Add to `.env`:
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Verify Domain (Recommended)
For production emails to work reliably:
1. In Resend dashboard → Add Domain
2. Add your domain (e.g., notifications@answerengineer.ai)
3. Point DNS records as instructed
4. Update RESEND_FROM_EMAIL in .env

---

## Troubleshooting

### "Email link doesn't work"
→ Verify FRONTEND_URL is set to your deployed domain
→ Check verify.html uses `window.location.origin`

### "Multiple emails don't work"
→ Check backend is accepting different emails (it should)
→ Verify Resend API key is valid
→ Check email inbox for bounce/delivery errors

### "Verification page shows error"
→ Token may have expired (24 hours)
→ Token may have been already used
→ Backend may be unreachable
→ Check browser console for error details

### "Only works on same computer"
→ This is the localhost issue - deploy backend!
→ Or use ngrok to expose local backend:
```bash
npm install -g ngrok
ngrok http 5000
# Then use: https://xxx.ngrok.io as FRONTEND_URL
```

---

## Next Steps

### For Development
1. ✅ Test locally with multiple emails (no deployment needed)
2. ✅ Verify tokens work
3. ✅ Check verification page shows success

### For Production
1. Deploy backend to Heroku/Vercel
2. Update FRONTEND_URL in backend .env
3. Update BACKEND_URL in extension popup.js
4. Set up Resend domain (optional but recommended)
5. Test end-to-end with real email

### Deployment Checklist
- [ ] Backend deployed (Heroku/Vercel/Railway)
- [ ] FRONTEND_URL updated to deployed domain
- [ ] BACKEND_URL in extension updated
- [ ] All Stripe keys in production
- [ ] Resend API key configured
- [ ] Database migrations run (if using PostgreSQL)
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] Test with real email addresses

---

## Files Modified ✅

| File | Change | Impact |
|------|--------|--------|
| `backend/verify.html` | Changed hardcoded URL to `window.location.origin` | Email links now work from any device |
| `chrome-extension/popup.js` | Added `BACKEND_URL` variable | Easy deployment configuration |
| `.env` | Added FRONTEND_URL comment | Clear deployment instructions |

---

## Summary

✅ **Email verification now supports ANY email address**  
✅ **Verification links work from any device (once deployed)**  
✅ **Single BACKEND_URL configuration for easy deployment**  
✅ **Production-ready setup with clear deployment path**  

**Ready to deploy!** Follow the Deployment Setup section above.


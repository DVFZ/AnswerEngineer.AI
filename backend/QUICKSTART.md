# AnswerEngineer.AI Payment Integration - Quick Start

Get Stripe payments running in 30 minutes.

---

## The 5-Minute Overview

You now have:
- ✅ **Backend** (server.js) - Express.js with Stripe
- ✅ **Database** (database.sql) - PostgreSQL schema
- ✅ **Setup guide** (SETUP.md) - Step-by-step instructions
- ✅ **Integration guide** (EXTENSION_INTEGRATION.md) - How to wire extension

---

## Fast Track: Deploy in 30 Minutes

### 1. Get Stripe Keys (2 min)
```
1. Go to stripe.com → Sign up
2. Go to Dashboard → Copy Secret Key
3. Create Products:
   - Starter: $19/mo, $190/yr
   - Pro: $49/mo, $490/yr
   - Agency: $99/mo, $990/yr
4. Copy all Price IDs
```

### 2. Deploy Backend (10 min)

**Option A: Heroku (Easiest)**
```bash
heroku login
heroku create answerengineer-backend
heroku addons:create heroku-postgresql:hobby-dev

# Set all Stripe keys in Heroku dashboard
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set STRIPE_STARTER_MONTHLY=price_...
# ... repeat for all 6 price IDs

git push heroku main
heroku logs --tail
```

**Option B: Railway.app (Alternative)**
```bash
# Sign up, connect GitHub, set env vars, deploy
```

### 3. Update Extension (10 min)

In extension popup.js, add:
```javascript
const BACKEND_URL = 'https://answerengineer-backend.herokuapp.com';

// In Settings tab, add these event handlers:
document.getElementById('settings-upgrade-cta').addEventListener('click', async () => {
  const email = document.getElementById('set-email').value;
  const plan = 'starter'; // or pro, agency
  const billingPeriod = 'monthly'; // or annual
  
  const response = await fetch(`${BACKEND_URL}/api/checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, plan, billingPeriod })
  });
  
  const { url } = await response.json();
  chrome.tabs.create({ url });
});
```

### 4. Test (5 min)
```
1. Enter email in Settings
2. Click Upgrade button
3. Select Starter plan
4. Use test card: 4242 4242 4242 4242
5. Verify subscription is active
```

---

## File Descriptions

| File | Purpose |
|------|---------|
| `server.js` | Express backend with all endpoints |
| `package.json` | Node dependencies |
| `database.sql` | PostgreSQL schema |
| `.env.example` | Environment variables template |
| `SETUP.md` | Detailed setup guide |
| `EXTENSION_INTEGRATION.md` | How to connect extension |

---

## Key Endpoints

Your backend will have:

```
POST /api/checkout-session
  → Start Stripe Checkout
  
GET /api/subscription/:email
  → Get user's current plan
  
POST /api/webhook
  → Stripe webhook (automatic)
  
POST /api/cancel-subscription
  → User cancels their subscription
```

---

## Architecture

```
Extension (Chrome)
    ↓ (HTTPS)
Backend (Node.js/Express) ←→ Stripe API
    ↓
Database (PostgreSQL)
```

---

## Cost Breakdown

**Monthly costs (estimated):**
- Backend hosting: $7 (Heroku hobby-dev)
- Database: $9 (Heroku PostgreSQL)
- Stripe fees: 2.9% + $0.30 per transaction
- **Total: ~$16 + transaction fees**

For 100 customers at $19/mo:
- Stripe takes: ~$55
- You keep: ~$1,845

---

## Common Questions

**Q: Do I need to code anything?**
A: No! Just:
1. Copy backend code
2. Deploy to Heroku
3. Add one webhook handler to extension
4. Done!

**Q: Can I use different payment processor?**
A: Yes, but Stripe is easiest. Code is built for Stripe.

**Q: Can I test without live Stripe account?**
A: Yes! Use Stripe test keys. Switch to live keys when ready.

**Q: How do I handle refunds?**
A: Stripe Dashboard → Charges → Click charge → Refund

**Q: What if customer's card declines?**
A: Backend marks as "past_due", customer can retry in Settings.

---

## Next Steps

1. **Read SETUP.md** - Follow the detailed guide
2. **Deploy backend** - Pick Heroku or Railway
3. **Update extension** - Add payment handlers
4. **Test thoroughly** - Use Stripe test cards
5. **Go live** - Switch to live Stripe keys

---

## Support

- **Stripe docs:** stripe.com/docs
- **Heroku docs:** devcenter.heroku.com
- **Node.js express:** expressjs.com

Need help? Check SETUP.md or EXTENSION_INTEGRATION.md first.

---

## Success Criteria

✅ Extension opens Stripe Checkout on upgrade click
✅ Payment processes successfully  
✅ Subscription is activated in database
✅ Extension validates subscription on next open
✅ Free users get paywall after limit reached
✅ Paid users have unlimited access
✅ Users can cancel anytime

**You're ready to launch!** 🚀

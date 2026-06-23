# Extension Integration with Stripe Backend

How to integrate the Stripe payment backend with your Chrome extension.

---

## Step 1: Update Extension Manifest

Add backend URL to manifest.json:

```json
{
  "manifest_version": 3,
  "permissions": [
    "tabs",
    "storage"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["content-script-real-audit.js"],
      "run_at": "document_start"
    }
  ]
}
```

---

## Step 2: Add Payment Configuration

Create `popup-config.js` in the extension:

```javascript
// Configuration for backend
const BACKEND_URL = 'https://answerengineer-backend.herokuapp.com'; // Update with your backend URL
const STRIPE_PUBLIC_KEY = 'pk_live_...'; // From Stripe dashboard

// Subscription plans with pricing
const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 19,
    annual: 190,
    features: [
      'Unlimited AI Simulator queries',
      'SERP Preview (Crawler View)',
      'Audit History (30 days)',
      'Weekly Digest emails'
    ]
  },
  pro: {
    name: 'Pro',
    price: 49,
    annual: 490,
    features: [
      'Everything in Starter',
      'Attribution Tracking',
      'API Access',
      'Priority Support'
    ]
  },
  agency: {
    name: 'Agency',
    price: 99,
    annual: 990,
    features: [
      'Everything in Pro',
      'Team Accounts (5 users)',
      'Custom Integrations',
      'Dedicated Support'
    ]
  }
};
```

---

## Step 3: Update Settings Tab UI

In `popup.html`, update the Settings tab to add payment options:

```html
<article id="tab-settings" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-settings" hidden>
  <h3 class="panel-title">Settings</h3>
  <p class="panel-lead">⚙️ Personalize your account and manage your subscription plan.</p>

  <div class="settings-list">
    <!-- Email Input -->
    <label class="setting-row setting-row--stacked">
      <span class="setting-label">Email</span>
      <input
        type="email"
        id="set-email"
        class="setting-input"
        placeholder="your@email.com"
        autocomplete="email"
        spellcheck="false"
      >
      <small class="setting-help">Required for subscription and weekly digest.</small>
    </label>

    <!-- Industry Selection -->
    <label class="setting-row setting-row--stacked">
      <span class="setting-label">Industry</span>
      <select id="set-industry">
        <option value="">Select your industry…</option>
        <option value="ecommerce">E-commerce / Retail</option>
        <option value="saas">SaaS / Software</option>
        <option value="finance">Finance / Banking</option>
        <option value="healthcare">Healthcare / Medical</option>
        <option value="education">Education</option>
        <option value="realestate">Real Estate</option>
        <option value="travel">Travel / Hospitality</option>
        <option value="legal">Legal / Law</option>
        <option value="marketing">Marketing / Agency</option>
        <option value="manufacturing">Manufacturing</option>
        <option value="nonprofit">Non-profit</option>
        <option value="media">Media / Publishing</option>
        <option value="food">Food / Restaurant</option>
        <option value="fitness">Fitness / Wellness</option>
        <option value="other">Other</option>
      </select>
    </label>

    <!-- Save Button -->
    <button type="button" class="setting-save" id="set-save">Save settings</button>

    <!-- Subscription Card -->
    <div class="setting-premium" id="set-premium-card">
      <div class="setting-premium__free" id="set-premium-free">
        <div class="setting-premium__head">
          <span class="setting-premium__title">You're on the Free plan</span>
          <span class="setting-premium__sub">3 AI Simulator queries · No search engine preview</span>
        </div>

        <!-- Upgrade Options -->
        <div class="upgrade-options" id="upgrade-options" style="display: none;">
          <h4 style="margin-top: 16px; margin-bottom: 8px; color: #fde68a;">Choose Your Plan:</h4>
          
          <!-- Billing Toggle -->
          <div class="billing-toggle" style="margin-bottom: 16px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="billing" value="monthly" checked>
              Monthly Billing
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="billing" value="annual">
              Annual Billing (Save 17%)
            </label>
          </div>

          <!-- Plan Cards -->
          <div class="plan-cards" style="display: grid; gap: 12px;">
            <button class="plan-card" data-plan="starter" style="padding: 12px; border: 1px solid #fde68a; background: rgba(253,230,138,0.05); border-radius: 8px; cursor: pointer; text-align: left;">
              <div style="font-weight: 600; color: #fff;">Starter</div>
              <div style="font-size: 1.2rem; color: #fde68a;">$19<span style="font-size: 0.85rem;">/mo</span></div>
              <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 4px;">Unlimited queries, SERP preview, history</div>
            </button>

            <button class="plan-card" data-plan="pro" style="padding: 12px; border: 1px solid #facc15; background: rgba(250,204,21,0.05); border-radius: 8px; cursor: pointer; text-align: left;">
              <div style="font-weight: 600; color: #fff;">Pro</div>
              <div style="font-size: 1.2rem; color: #facc15;">$49<span style="font-size: 0.85rem;">/mo</span></div>
              <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 4px;">Pro analytics, API access, support</div>
            </button>

            <button class="plan-card" data-plan="agency" style="padding: 12px; border: 1px solid #22c55e; background: rgba(34,197,94,0.05); border-radius: 8px; cursor: pointer; text-align: left;">
              <div style="font-weight: 600; color: #fff;">Agency</div>
              <div style="font-size: 1.2rem; color: #22c55e;">$99<span style="font-size: 0.85rem;">/mo</span></div>
              <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 4px;">Team accounts, integrations, priority support</div>
            </button>
          </div>
        </div>

        <button type="button" class="btn-3d btn-3d--sm" id="settings-upgrade-cta" style="margin-top: 12px;">
          <span class="btn-3d__label">UPGRADE NOW</span>
        </button>
      </div>
    </div>
  </div>
</article>
```

---

## Step 4: Add Payment Logic to popup.js

Add this to the Settings tab initialization in `popup.js`:

```javascript
// ============================================
// PAYMENT / SUBSCRIPTION HANDLING
// ============================================

// Save settings (including email)
if (setSave) {
  setSave.addEventListener('click', () => {
    const email = setEmail.value.trim();
    const industry = setIndustry.value;

    if (!email) {
      alert('Please enter your email');
      return;
    }

    // Save to localStorage
    localStorage.setItem('ae_user_email', email);
    localStorage.setItem('ae_user_industry', industry);

    // Validate subscription with backend
    validateSubscription(email);

    alert('Settings saved!');
  });
}

// Load saved email/industry on init
function loadSettings() {
  const savedEmail = localStorage.getItem('ae_user_email');
  const savedIndustry = localStorage.getItem('ae_user_industry');

  if (savedEmail) setEmail.value = savedEmail;
  if (savedIndustry) setIndustry.value = savedIndustry;
}

// Validate subscription with backend
async function validateSubscription(email) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/subscription/${email}`);
    const subscription = await response.json();

    // Update local plan
    currentPlan = subscription.plan || 'free';
    localStorage.setItem('ae_current_plan', currentPlan);
    localStorage.setItem('ae_license_key', subscription.licenseKey || '');

    // Refresh UI
    refreshSettingsUI();

    console.log('Subscription validated:', subscription);
  } catch (error) {
    console.error('Validation error:', error);
  }
}

// Upgrade button handler
if (document.getElementById('settings-upgrade-cta')) {
  document.getElementById('settings-upgrade-cta').addEventListener('click', () => {
    const upgradeOptions = document.getElementById('upgrade-options');
    if (upgradeOptions.style.display === 'none') {
      upgradeOptions.style.display = 'block';
    } else {
      upgradeOptions.style.display = 'none';
    }
  });
}

// Plan card click handlers
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('click', async () => {
    const plan = card.dataset.plan;
    const billingPeriod = document.querySelector('input[name="billing"]:checked').value;
    const email = setEmail.value.trim();

    if (!email) {
      alert('Please enter your email first');
      return;
    }

    // Start checkout
    await startCheckout(email, plan, billingPeriod);
  });
});

// Start Stripe Checkout
async function startCheckout(email, plan, billingPeriod) {
  try {
    console.log(`Starting checkout: ${plan} (${billingPeriod}) for ${email}`);

    const response = await fetch(`${BACKEND_URL}/api/checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan, billingPeriod })
    });

    const data = await response.json();

    if (data.error) {
      alert(`Error: ${data.error}`);
      return;
    }

    // Redirect to Stripe Checkout
    chrome.tabs.create({ url: data.url });

    // Close popup
    setTimeout(() => window.close(), 500);
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to start checkout. Please try again.');
  }
}

// Check subscription on popup open
function checkSubscriptionOnLoad() {
  const email = localStorage.getItem('ae_user_email');
  if (email) {
    validateSubscription(email);
  }
}

// Initialize on load
loadSettings();
checkSubscriptionOnLoad();
```

---

## Step 5: After Stripe Payment

After user completes payment in Stripe Checkout, they'll be redirected to:
```
https://your-domain.com/success?session_id=...
```

Create a simple success page that:
1. Shows "Payment successful!"
2. Instructs user to return to extension
3. Extension automatically validates subscription on next open

You can create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Payment Successful</title>
  <style>
    body { font-family: sans-serif; padding: 40px; text-align: center; }
    h1 { color: #22c55e; }
  </style>
</head>
<body>
  <h1>✅ Payment Successful!</h1>
  <p>Your subscription is now active.</p>
  <p>You can close this window and return to the AnswerEngineer.AI extension.</p>
  <p>Your subscription will be validated automatically on next use.</p>
</body>
</html>
```

---

## Environment Variables for Extension

Add to your backend `.env`:

```
FRONTEND_URL=https://your-domain.com
# (or http://localhost:3000 for development)
```

---

## Testing Payment Flow

1. **Enter email** in Settings tab
2. **Click "UPGRADE NOW"**
3. **Select a plan** (Starter/Pro/Agency)
4. **Choose billing** (Monthly/Annual)
5. **Redirected to Stripe Checkout**
6. **Use test card:** `4242 4242 4242 4242`
7. **Complete payment**
8. **Redirected to success page**
9. **Close success page, return to extension**
10. **Subscription is automatically validated** ✅

---

## Handling Expired Subscriptions

In `refreshQuotaUI()` and other feature gating:

```javascript
function canAccess(feature) {
  const tier = TIERS[currentPlan];
  const hasAccess = tier.features[feature];
  
  // Also check if subscription is still active (not expired)
  const expiryDate = localStorage.getItem('ae_subscription_end');
  if (expiryDate && new Date(expiryDate) < new Date()) {
    // Subscription expired, downgrade to free
    currentPlan = 'free';
    localStorage.setItem('ae_current_plan', 'free');
    return TIERS['free'].features[feature];
  }
  
  return hasAccess;
}
```

---

## Troubleshooting Extension Integration

### "Backend not found" error
- Verify `BACKEND_URL` is correct
- Check backend is running: `curl https://your-backend/health`
- Verify CORS is enabled (should be in server.js)

### Payment completes but subscription not validated
- Check email is saved correctly
- Manually call `validateSubscription(email)` in console
- Check Stripe webhook is firing (Stripe Dashboard → Events)

### License key not saved
- Verify backend returned `licenseKey` in subscription response
- Check localStorage is enabled in extension

---

## Production Checklist

Before going live:

- [ ] Backend deployed to production server
- [ ] Database configured with production credentials
- [ ] Stripe live keys configured (not test keys)
- [ ] All Stripe product prices created for live mode
- [ ] Webhook endpoint configured in Stripe
- [ ] Success/cancel pages deployed
- [ ] FRONTEND_URL set to your domain
- [ ] Extension updated with production BACKEND_URL
- [ ] Tested full payment flow with real card (or Stripe test card on test mode)
- [ ] Tested subscription validation
- [ ] Monitored logs for errors

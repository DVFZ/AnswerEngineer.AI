require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { Resend } = require('resend');

const app = express();

// Initialize Resend email service
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// IN-MEMORY STORES (for testing)
// ============================================
const subscriptions = {};
const verificationTokens = {}; // email -> { token, email, plan, billingPeriod, expiresAt }

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'chrome-extension://*',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve success page after payment
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'success.html'));
});

// Serve verify page for email verification
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'verify.html'));
});

// Serve cancel page if payment is cancelled
app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'cancel.html'));
});

// ============================================
// SUBSCRIPTION PLANS (from Stripe)
// ============================================
const PLANS = {
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY,
  starter_annual: process.env.STRIPE_STARTER_ANNUAL,
  pro_monthly: process.env.STRIPE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRO_ANNUAL,
  agency_monthly: process.env.STRIPE_AGENCY_MONTHLY,
  agency_annual: process.env.STRIPE_AGENCY_ANNUAL,
};

// ============================================
// 1. CREATE CHECKOUT SESSION
// ============================================
app.post('/api/checkout-session', async (req, res) => {
  try {
    const { email, plan, billingPeriod } = req.body; // plan: 'starter', 'pro', 'agency'; billingPeriod: 'monthly' or 'annual'
    console.log(`[CHECKOUT] Received request:`, { email, plan, billingPeriod });

    if (!email || !plan || !billingPeriod) {
      console.log(`[CHECKOUT] Missing fields`);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const priceId = PLANS[`${plan}_${billingPeriod}`];
    console.log(`[CHECKOUT] Price ID for ${plan}_${billingPeriod}:`, priceId);
    if (!priceId) {
      console.log(`[CHECKOUT] Invalid price ID`);
      return res.status(400).json({ error: 'Invalid plan or billing period' });
    }

    // Create or get customer
    console.log(`[CHECKOUT] Fetching Stripe customer for: ${email}`);
    const customers = await stripe.customers.list({ email, limit: 1 });
    console.log(`[CHECKOUT] Found ${customers.data.length} customers`);
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      console.log(`[CHECKOUT] Creating new Stripe customer`);
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      console.log(`[CHECKOUT] Created customer: ${customerId}`);
    } else {
      console.log(`[CHECKOUT] Using existing customer: ${customerId}`);
    }

    // Create checkout session
    console.log(`[CHECKOUT] Creating Stripe checkout session...`);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    console.log(`[CHECKOUT] ✅ Session created:`, session.id);
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 2. SEND VERIFICATION EMAIL
// ============================================

    // Build verification link
    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`🔗 Verification link: ${verifyUrl}`);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Verify Your Email — AnswerEngineer.AI Subscription',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #6d28d9 100%); padding: 20px; border-radius: 8px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to AnswerEngineer.AI</h1>
          </div>

          <div style="padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hi,</p>
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
              Thanks for subscribing to the <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</strong>!
              Click the button below to verify your email and activate your subscription.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="
                display: inline-block;
                background: linear-gradient(135deg, #fde68a 0%, #f472b6 100%);
                color: #1e3a8a;
                padding: 12px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
              ">Verify Email</a>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">
              Or copy this link: <br/>
              <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; display: block; word-break: break-all; margin-top: 8px;">${verifyUrl}</code>
            </p>

            <p style="margin: 0; font-size: 12px; color: #999;">
              This link expires in 24 hours.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
            <p style="margin: 0;">AnswerEngineer.AI — Get cited by AI search engines</p>
          </div>
        </div>
      `
    });

    if (emailResponse.error) {
      console.error('❌ Failed to send email:', emailResponse.error);
      return res.status(500).json({ error: `Failed to send email: ${emailResponse.error.message}` });
    }

    console.log(`✅ Verification email sent successfully to ${email}`);

    res.json({
      success: true,
      message: `Verification email sent to ${email}. Check your inbox and click the link.`
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 3. VERIFY EMAIL TOKEN
// ============================================
app.get('/api/verify/:token', (req, res) => {
  try {
    const { token } = req.params;
    const verification = verificationTokens[token];

    if (!verification) {
      return res.status(404).json({ error: 'Invalid or expired verification link' });
    }

    if (verification.expiresAt < Date.now()) {
      delete verificationTokens[token];
      return res.status(400).json({ error: 'Verification link expired' });
    }

    // Token is valid — record the subscription
    subscriptions[verification.email] = {
      email: verification.email,
      plan: verification.plan,
      billingPeriod: verification.billingPeriod,
      status: 'active',
      verifiedAt: new Date().toISOString()
    };

    console.log(`✅ Email verified and subscription activated: ${verification.email} → ${verification.plan}`);

    // Delete the used token
    delete verificationTokens[token];

    res.json({
      success: true,
      message: `Email verified! Your ${verification.plan} plan is now active.`,
      subscription: subscriptions[verification.email]
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 4. RECORD SUBSCRIPTION (from success page - DEPRECATED, use verification instead)
// ============================================
app.post('/api/record-subscription', (req, res) => {
  try {
    const { email, plan, billingPeriod } = req.body;

    if (!email || !plan) {
      return res.status(400).json({ error: 'Missing email or plan' });
    }

    subscriptions[email] = {
      email,
      plan,
      billingPeriod: billingPeriod || 'monthly',
      status: 'active',
      recordedAt: new Date().toISOString()
    };

    console.log(`✅ Recorded subscription: ${email} → ${plan}`);
    res.json({ success: true, subscription: subscriptions[email] });
  } catch (error) {
    console.error('Error recording subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 3. VALIDATE SUBSCRIPTION
// ============================================
app.get('/api/subscription/:email', (req, res) => {
  try {
    const { email } = req.params;

    // Check in-memory store first
    if (subscriptions[email]) {
      console.log(`✅ Found subscription in memory: ${email} → ${subscriptions[email].plan}`);
      return res.json(subscriptions[email]);
    }

    // If not in memory, return free
    console.log(`📍 No subscription found for: ${email}`);
    res.json({ plan: 'free', status: 'inactive' });
  } catch (error) {
    console.error('Subscription validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 3. STRIPE WEBHOOK HANDLER
// ============================================
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'charge.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;

      case 'charge.failed':
        console.log('Payment failed:', event.data.object.id);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HELPER: Handle subscription creation/update
// ============================================
async function handleSubscriptionChange(stripeSubscription) {
  const customerId = stripeSubscription.customer;
  const customer = await stripe.customers.retrieve(customerId);
  const email = customer.email;

  // Determine plan from price
  const priceId = stripeSubscription.items.data[0].price.id;
  let plan = 'free';
  let billingPeriod = 'monthly';

  Object.entries(PLANS).forEach(([key, value]) => {
    if (value === priceId) {
      [plan, billingPeriod] = key.split('_');
    }
  });

  const licenseKey = uuidv4();
  const status = stripeSubscription.status; // 'active', 'past_due', 'unpaid', 'trialing', 'canceled'

  // Insert or update subscription
  await pool.query(
    `INSERT INTO subscriptions (email, plan, billing_period, status, stripe_subscription_id, license_key, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET
       plan = $2,
       billing_period = $3,
       status = $4,
       stripe_subscription_id = $5,
       updated_at = NOW()`,
    [email, plan, billingPeriod, status, stripeSubscription.id, licenseKey]
  );

  console.log(`Subscription updated for ${email}: ${plan} (${billingPeriod})`);
}

// ============================================
// HELPER: Handle subscription cancellation
// ============================================
async function handleSubscriptionCancelled(stripeSubscription) {
  const customerId = stripeSubscription.customer;
  const customer = await stripe.customers.retrieve(customerId);
  const email = customer.email;

  await pool.query(
    'UPDATE subscriptions SET plan = $1, status = $2, updated_at = NOW() WHERE email = $3',
    ['free', 'canceled', email]
  );

  console.log(`Subscription cancelled for ${email}`);
}

// ============================================
// 4. CANCEL SUBSCRIPTION (Manual renewal)
// ============================================
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      'SELECT stripe_subscription_id FROM subscriptions WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const stripeSubId = result.rows[0].stripe_subscription_id;

    // Cancel at period end (manual renewal = no auto-renew, but let current period finish)
    await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true,
    });

    await pool.query(
      'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE email = $2',
      ['canceled', email]
    );

    res.json({ success: true, message: 'Subscription will cancel at period end' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 5. VALIDATE LICENSE KEY
// ============================================
app.post('/api/validate-license', async (req, res) => {
  try {
    const { licenseKey } = req.body;

    const result = await pool.query(
      'SELECT plan, status FROM subscriptions WHERE license_key = $1',
      [licenseKey]
    );

    if (result.rows.length === 0) {
      return res.json({ valid: false, plan: 'free' });
    }

    const subscription = result.rows[0];

    res.json({
      valid: subscription.status === 'active',
      plan: subscription.plan,
      status: subscription.status,
    });
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 6. CREATE SUBSCRIPTION MANUALLY (FOR TESTING)
// ============================================
app.post('/api/admin/create-subscription', async (req, res) => {
  try {
    const { email, plan, billingPeriod } = req.body;

    // Verify admin key
    if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const licenseKey = uuidv4();

    await pool.query(
      `INSERT INTO subscriptions (email, plan, billing_period, status, license_key, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         plan = $2,
         billing_period = $3,
         status = $4,
         updated_at = NOW()`,
      [email, plan, billingPeriod, 'active', licenseKey]
    );

    res.json({ success: true, licenseKey });
  } catch (error) {
    console.error('Admin create subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AnswerEngineer.AI Backend running on port ${PORT}`);
});

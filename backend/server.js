require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase (Service role for admin operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize Supabase client for auth operations (needs ANON_KEY)
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
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

// Auth verify route (for magic link)
app.get('/auth/verify', (req, res) => {
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
// 2. MAGIC LINK - Passwordless Authentication with Resend
// ============================================

// Store magic link tokens in memory (expires after 15 minutes)
const magicLinkTokens = {};

// Clean up expired tokens every minute
setInterval(() => {
  const now = Date.now();
  Object.keys(magicLinkTokens).forEach(token => {
    if (magicLinkTokens[token].expiresAt < now) {
      delete magicLinkTokens[token];
    }
  });
}, 60000);

app.post('/api/magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`[MAGIC-LINK] Sending magic link to ${email}`);

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour (for testing)

    // Store token
    magicLinkTokens[token] = {
      email: email,
      expiresAt: expiresAt
    };

    // Create magic link URL
    const magicLinkUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    // Send email via Resend
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: '🔐 Your Magic Link - Sign In to AnswerEngineer.AI',
      html: `
        <h2>Welcome to AnswerEngineer.AI!</h2>
        <p>Click the link below to sign in. This link will expire in 15 minutes.</p>
        <a href="${magicLinkUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Sign In with Magic Link
        </a>
        <p>Or copy this link: <br><code>${magicLinkUrl}</code></p>
        <p style="color: #666; font-size: 12px;">If you didn't request this link, you can safely ignore this email.</p>
      `
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return res.status(400).json({ error: 'Failed to send magic link email' });
    }

    console.log(`✅ Magic link sent to ${email}`);

    res.json({
      success: true,
      message: `Magic link sent to ${email}. Please check your email and click the link to sign in.`
    });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ============================================
// VERIFY MAGIC LINK TOKEN
// ============================================

app.get('/api/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || !magicLinkTokens[token]) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    const { email, expiresAt } = magicLinkTokens[token];

    if (expiresAt < Date.now()) {
      delete magicLinkTokens[token];
      return res.status(400).json({ error: 'Magic link has expired' });
    }

    console.log(`✅ Magic link verified for ${email}`);

    // Store/update user in Supabase
    await supabase
      .from('users')
      .upsert({
        email: email,
        status: 'active'
      }, { onConflict: 'email' });

    // Delete token after use
    delete magicLinkTokens[token];

    res.json({
      success: true,
      message: 'Email verified! You are now signed in.',
      email: email
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ============================================
// 3. VALIDATE SUBSCRIPTION (Magic Link Flow)
// ============================================

app.get('/api/subscription/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Query Supabase users table (simpler and works!)
    const { data, error } = await supabase
      .from('users')
      .select('plan, status, billing_period')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.json({ plan: 'free', status: 'inactive' });
    }

    res.json({
      plan: data.plan || 'free',
      status: data.status || 'inactive',
      billingPeriod: data.billing_period,
      email: email
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.json({ plan: 'free', status: 'inactive' });
  }
});

// ============================================
// 4. GET CURRENT USER (Check if logged in)
// ============================================

app.get('/api/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      user: data.user,
      email: data.user.email
    });
  } catch (error) {
    console.error('Error getting user:', error);
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

  const status = stripeSubscription.status; // 'active', 'past_due', 'unpaid', 'trialing', 'canceled'

  // Update subscription in Supabase users table (simpler!)
  const { error } = await supabase
    .from('users')
    .upsert({
      email: email,
      plan: status === 'active' ? plan : 'free',
      status: status,
      billing_period: billingPeriod,
      stripe_subscription_id: stripeSubscription.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });

  if (error) {
    console.error(`Error updating subscription for ${email}:`, error);
  } else {
    console.log(`✅ Subscription updated for ${email}: ${plan} (${billingPeriod})`);
  }
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

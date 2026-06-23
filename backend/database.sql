-- AnswerEngineer.AI Database Schema

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'pro', 'agency'
  billing_period VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
  status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'past_due', 'unpaid', 'trialing', 'canceled'
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  license_key VARCHAR(255) UNIQUE,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_license_key ON subscriptions(license_key);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Payment history (optional, for auditing)
CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  stripe_charge_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2),
  currency VARCHAR(10),
  status VARCHAR(50), -- 'succeeded', 'failed', 'pending'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES subscriptions(email)
);

CREATE INDEX IF NOT EXISTS idx_payment_history_email ON payment_history(email);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(created_at DESC);

-- Create domain_subscriptions table for per-domain subscription tracking
-- This allows the same email to have different subscription plans for different domains

CREATE TABLE IF NOT EXISTS domain_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free' NOT NULL,
  status VARCHAR(50) DEFAULT 'inactive' NOT NULL,
  billing_period VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Composite unique constraint: email + domain must be unique
  -- This ensures each email has only ONE subscription per domain
  CONSTRAINT unique_email_domain UNIQUE(email, domain)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_domain_subscriptions_email ON domain_subscriptions(email);

-- Create index on domain for faster lookups
CREATE INDEX IF NOT EXISTS idx_domain_subscriptions_domain ON domain_subscriptions(domain);

-- Create composite index for fast (email, domain) lookups
CREATE INDEX IF NOT EXISTS idx_domain_subscriptions_email_domain ON domain_subscriptions(email, domain);

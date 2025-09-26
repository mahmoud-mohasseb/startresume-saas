-- Create subscriptions table with all required columns
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  credits INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Add constraints
ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS check_credits_non_negative 
CHECK (credits >= 0);

ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS check_credits_used_non_negative 
CHECK (credits_used >= 0);

ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS check_credits_used_not_exceed_total 
CHECK (credits_used <= credits);

ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS check_valid_plan 
CHECK (plan IN ('free', 'basic', 'standard', 'pro'));

ALTER TABLE subscriptions 
ADD CONSTRAINT IF NOT EXISTS check_valid_status 
CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing'));

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

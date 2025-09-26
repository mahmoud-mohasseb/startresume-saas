-- Fix database schema to support free plan and add missing columns

-- 1. Drop the existing plan constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- 2. Add the new plan constraint that includes 'free'
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check 
  CHECK (plan IN ('free', 'basic', 'standard', 'pro'));

-- 3. Drop the existing status constraint  
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- 4. Add the new status constraint that includes 'inactive'
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
  CHECK (status IN ('active', 'canceled', 'past_due', 'inactive'));

-- 5. Add missing columns if they don't exist
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- 6. Update any existing NULL plans to 'free'
UPDATE subscriptions SET plan = 'free' WHERE plan IS NULL;

-- 7. Update any existing NULL status to 'active'  
UPDATE subscriptions SET status = 'active' WHERE status IS NULL;

-- 8. Set credits_used to 0 if NULL
UPDATE subscriptions SET credits_used = 0 WHERE credits_used IS NULL;

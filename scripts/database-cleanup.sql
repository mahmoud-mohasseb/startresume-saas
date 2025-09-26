-- Database Cleanup and Update Script for StartResume.io
-- This script cleans up the database and ensures proper free plan support

-- 1. Update subscriptions table to support 'free' plan
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check 
  CHECK (plan IN ('free', 'basic', 'standard', 'pro'));

-- 2. Update existing users without subscriptions to have free plan
INSERT INTO subscriptions (user_id, clerk_user_id, plan, credits, status, current_period_start, current_period_end)
SELECT 
  u.id,
  u.clerk_user_id,
  'free' as plan,
  3 as credits,
  'active' as status,
  NOW() as current_period_start,
  NOW() + INTERVAL '30 days' as current_period_end
FROM users u
LEFT JOIN subscriptions s ON u.clerk_user_id = s.clerk_user_id
WHERE s.id IS NULL;

-- 3. Clean up any orphaned credit history records
DELETE FROM credit_history 
WHERE clerk_user_id NOT IN (SELECT clerk_user_id FROM users);

-- 4. Reset credits for free plan users to 3
UPDATE subscriptions 
SET credits = 3, updated_at = NOW()
WHERE plan = 'free';

-- 5. Add credits_used column if it doesn't exist
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;

-- 6. Update credits_used based on credit_history
UPDATE subscriptions s
SET credits_used = COALESCE((
  SELECT SUM(credits_used) 
  FROM credit_history ch 
  WHERE ch.clerk_user_id = s.clerk_user_id
  AND ch.created_at >= s.current_period_start
), 0);

-- 7. Clean up any invalid subscription statuses
UPDATE subscriptions 
SET status = 'active' 
WHERE status NOT IN ('active', 'canceled', 'past_due', 'incomplete');

-- 8. Add feature usage tracking table
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create indexes for feature_usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_clerk_user_id ON feature_usage(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_last_used ON feature_usage(last_used_at DESC);

-- 10. Enable RLS for feature_usage
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for feature_usage
CREATE POLICY "Users can view own feature usage" ON feature_usage
  FOR SELECT USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Service role can manage feature usage" ON feature_usage
  FOR ALL USING (current_setting('role') = 'service_role');

-- 12. Add trigger for feature_usage updated_at
CREATE TRIGGER update_feature_usage_updated_at BEFORE UPDATE ON feature_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Verify data integrity
SELECT 
  'Users without subscriptions' as check_type,
  COUNT(*) as count
FROM users u
LEFT JOIN subscriptions s ON u.clerk_user_id = s.clerk_user_id
WHERE s.id IS NULL

UNION ALL

SELECT 
  'Free plan users' as check_type,
  COUNT(*) as count
FROM subscriptions 
WHERE plan = 'free'

UNION ALL

SELECT 
  'Total active subscriptions' as check_type,
  COUNT(*) as count
FROM subscriptions 
WHERE status = 'active';

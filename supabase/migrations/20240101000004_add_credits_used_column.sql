-- Add credits_used column to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;

-- Update existing records to have credits_used = 0 if null
UPDATE subscriptions 
SET credits_used = 0 
WHERE credits_used IS NULL;

-- Add constraint to ensure credits_used is never negative
ALTER TABLE subscriptions 
ADD CONSTRAINT check_credits_used_non_negative 
CHECK (credits_used >= 0);

-- Add constraint to ensure credits_used doesn't exceed total credits
ALTER TABLE subscriptions 
ADD CONSTRAINT check_credits_used_not_exceed_total 
CHECK (credits_used <= credits);

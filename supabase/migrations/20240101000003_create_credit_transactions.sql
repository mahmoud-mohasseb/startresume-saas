-- Create credit_transactions table for audit logging
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  credits_deducted INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_feature ON credit_transactions(feature);

-- Add RLS policies
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own credit transactions" ON credit_transactions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- Only authenticated users can insert transactions (via API)
CREATE POLICY "Authenticated users can insert credit transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

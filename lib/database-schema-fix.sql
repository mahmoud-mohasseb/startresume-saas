-- Fix missing RLS policies for subscriptions table

-- Allow users to insert their own subscription
CREATE POLICY "Users can create own subscription" ON subscriptions
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Allow users to update their own subscription  
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Allow service role to bypass RLS for subscription management
-- This is needed for server-side operations
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;

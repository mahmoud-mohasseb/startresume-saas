-- Fix subscriptions table schema to match application needs

-- First, let's see what the current schema looks like
-- This migration will add missing columns and fix data types

-- Add credits_used column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'credits_used'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN credits_used INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Change user_id from UUID to TEXT to store Clerk user IDs directly
-- First, drop foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_user_id_fkey'
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
    END IF;
END $$;

-- Change user_id column type to TEXT
ALTER TABLE subscriptions ALTER COLUMN user_id TYPE TEXT;

-- Add unique constraint on user_id for upsert operations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_user_id_unique'
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Ensure all existing subscriptions have credits_used = 0 if null
UPDATE subscriptions SET credits_used = 0 WHERE credits_used IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Update credit_history table to use TEXT user_id as well if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'credit_history'
    ) THEN
        -- Drop foreign key if exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'credit_history_user_id_fkey'
            AND table_name = 'credit_history'
        ) THEN
            ALTER TABLE credit_history DROP CONSTRAINT credit_history_user_id_fkey;
        END IF;
        
        -- Change to TEXT
        ALTER TABLE credit_history ALTER COLUMN user_id TYPE TEXT;
        
        -- Add index
        CREATE INDEX IF NOT EXISTS idx_credit_history_user_id ON credit_history(user_id);
    END IF;
END $$;

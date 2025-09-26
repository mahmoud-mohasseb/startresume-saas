-- =====================================================
-- COMPLETE DATABASE CLEANUP SCRIPT FOR STARTRESUME.IO
-- =====================================================
-- WARNING: This will DELETE ALL DATA in the database!
-- Only run this in development or when you want a fresh start
-- =====================================================

-- Disable foreign key checks temporarily (if supported)
SET session_replication_role = replica;

-- 1. TRUNCATE ALL DATA TABLES (preserves structure, removes all data)
TRUNCATE TABLE credit_history CASCADE;
TRUNCATE TABLE feature_usage CASCADE;
TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE users CASCADE;

-- If you have additional tables, add them here:
-- TRUNCATE TABLE resumes CASCADE;
-- TRUNCATE TABLE cover_letters CASCADE;
-- TRUNCATE TABLE job_applications CASCADE;

-- 2. RESET SEQUENCES (if using SERIAL columns)
-- This ensures IDs start from 1 again
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS subscriptions_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS credit_history_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS feature_usage_id_seq RESTART WITH 1;

-- 3. VERIFY CLEANUP
SELECT 
  schemaname,
  tablename,
  n_tup_ins as "Rows Inserted",
  n_tup_upd as "Rows Updated", 
  n_tup_del as "Rows Deleted"
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. CHECK TABLE COUNTS (should all be 0)
SELECT 
  'users' as table_name, 
  COUNT(*) as row_count 
FROM users

UNION ALL

SELECT 
  'subscriptions' as table_name, 
  COUNT(*) as row_count 
FROM subscriptions

UNION ALL

SELECT 
  'credit_history' as table_name, 
  COUNT(*) as row_count 
FROM credit_history

UNION ALL

SELECT 
  'feature_usage' as table_name, 
  COUNT(*) as row_count 
FROM feature_usage;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- 5. OPTIONAL: Reset database statistics
ANALYZE;

-- Success message
SELECT 'Database cleanup completed successfully! All user data has been removed.' as status;

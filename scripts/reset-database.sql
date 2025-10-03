-- DANGER: This SQL script will DELETE ALL DATA from your Supabase database
-- Use with extreme caution - this action is IRREVERSIBLE

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Delete all data from tables in correct order
DELETE FROM credit_history;
DELETE FROM subscriptions;  
DELETE FROM users;

-- Reset auto-increment sequences
SELECT setval('users_id_seq', 1, false);
SELECT setval('subscriptions_id_seq', 1, false);
SELECT setval('credit_history_id_seq', 1, false);

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'subscriptions' as table_name, COUNT(*) as record_count FROM subscriptions  
UNION ALL
SELECT 'credit_history' as table_name, COUNT(*) as record_count FROM credit_history;

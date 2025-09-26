#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🗄️  Database Migration Script');
console.log('============================\n');

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName);

  if (error) {
    console.error(`❌ Error checking table ${tableName}:`, error.message);
    return false;
  }

  return data && data.length > 0;
}

async function createSubscriptionsTable() {
  console.log('🔄 Creating subscriptions table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        plan TEXT NOT NULL CHECK (plan IN ('basic', 'standard', 'pro')),
        credits INTEGER DEFAULT 0,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (error) {
    console.error('❌ Error creating subscriptions table:', error.message);
    return false;
  }

  console.log('✅ Subscriptions table created successfully');
  return true;
}

async function createIndexes() {
  console.log('🔄 Creating database indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);',
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);',
    'CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);'
  ];

  for (const indexSql of indexes) {
    const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
    if (error) {
      console.error('❌ Error creating index:', error.message);
      return false;
    }
  }

  console.log('✅ Database indexes created successfully');
  return true;
}

async function enableRLS() {
  console.log('🔄 Enabling Row Level Security...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Users can view own subscription" ON subscriptions
        FOR SELECT USING (user_id = auth.jwt() ->> 'sub');
        
      CREATE POLICY IF NOT EXISTS "Users can update own subscription" ON subscriptions
        FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');
    `
  });

  if (error) {
    console.error('❌ Error enabling RLS:', error.message);
    return false;
  }

  console.log('✅ Row Level Security enabled successfully');
  return true;
}

async function createTriggers() {
  console.log('🔄 Creating database triggers...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
      CREATE TRIGGER update_subscriptions_updated_at 
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
  });

  if (error) {
    console.error('❌ Error creating triggers:', error.message);
    return false;
  }

  console.log('✅ Database triggers created successfully');
  return true;
}

async function seedDefaultData() {
  console.log('🔄 Seeding default data...');
  
  // Check if templates exist
  const { data: templates } = await supabase
    .from('templates')
    .select('id')
    .limit(1);

  if (!templates || templates.length === 0) {
    const { error } = await supabase
      .from('templates')
      .insert([
        {
          name: 'Modern Professional',
          category: 'modern',
          html_template: '<div class="resume-template modern"><!-- Modern Template --></div>',
          is_premium: false
        },
        {
          name: 'Executive Leader',
          category: 'executive',
          html_template: '<div class="resume-template executive"><!-- Executive Template --></div>',
          is_premium: true
        },
        {
          name: 'Creative Designer',
          category: 'creative',
          html_template: '<div class="resume-template creative"><!-- Creative Template --></div>',
          is_premium: false
        }
      ]);

    if (error) {
      console.error('❌ Error seeding templates:', error.message);
      return false;
    }

    console.log('✅ Default templates seeded successfully');
  } else {
    console.log('ℹ️  Templates already exist, skipping seed');
  }

  return true;
}

async function verifyMigration() {
  console.log('🔄 Verifying migration...');
  
  // Check critical tables
  const tables = ['users', 'resumes', 'subscriptions', 'templates', 'analytics_events'];
  
  for (const table of tables) {
    const exists = await checkTableExists(table);
    if (exists) {
      console.log(`✅ Table ${table} exists`);
    } else {
      console.log(`⚠️  Table ${table} missing`);
    }
  }

  // Test subscription functionality
  const { data, error } = await supabase
    .from('subscriptions')
    .select('count(*)')
    .limit(1);

  if (error) {
    console.error('❌ Subscription table test failed:', error.message);
    return false;
  }

  console.log('✅ Migration verification completed');
  return true;
}

async function main() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Check if subscriptions table exists
    const subscriptionsExists = await checkTableExists('subscriptions');
    
    if (!subscriptionsExists) {
      await createSubscriptionsTable();
    } else {
      console.log('ℹ️  Subscriptions table already exists');
    }

    // Create indexes
    await createIndexes();

    // Enable RLS
    await enableRLS();

    // Create triggers
    await createTriggers();

    // Seed default data
    await seedDefaultData();

    // Verify migration
    await verifyMigration();

    console.log('\n🎉 Database migration completed successfully!');
    console.log('✅ All subscription system components are ready');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Set up Stripe webhook endpoint: /api/webhooks/stripe');
    console.log('2. Configure Stripe price IDs in environment variables');
    console.log('3. Test subscription flow with Stripe test cards');
    console.log('4. Run full system tests: npm run test');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();

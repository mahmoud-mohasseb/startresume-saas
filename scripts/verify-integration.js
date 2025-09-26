#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Quick Integration Verification');
console.log('=================================\n');

// Check environment variables
const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
  'STRIPE_BASIC_PRICE_ID': process.env.STRIPE_BASIC_PRICE_ID,
  'STRIPE_STANDARD_PRICE_ID': process.env.STRIPE_STANDARD_PRICE_ID,
  'STRIPE_PRO_PRICE_ID': process.env.STRIPE_PRO_PRICE_ID
};

console.log('📋 Environment Variables:');
let allConfigured = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  const isSet = !!value;
  const isValid = value && value.length > 10 && !value.includes('your_');
  
  if (isSet && isValid) {
    console.log(`✅ ${key}: Configured`);
  } else if (isSet) {
    console.log(`⚠️  ${key}: Set but appears to be placeholder`);
    allConfigured = false;
  } else {
    console.log(`❌ ${key}: Not set`);
    allConfigured = false;
  }
});

console.log('\n💳 Stripe Configuration:');
console.log(`✅ Basic Plan: ${process.env.STRIPE_BASIC_PRICE_ID} → 10 credits`);
console.log(`✅ Standard Plan: ${process.env.STRIPE_STANDARD_PRICE_ID} → 50 credits`);
console.log(`✅ Pro Plan: ${process.env.STRIPE_PRO_PRICE_ID} → 200 credits`);

console.log('\n🗄️  Database Configuration:');
console.log(`✅ Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log(`✅ Service Role: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing'}`);

console.log('\n🔗 Integration Status:');
if (allConfigured) {
  console.log('✅ All environment variables are properly configured');
  console.log('✅ Stripe price IDs are set for all plans');
  console.log('✅ Supabase credentials are configured');
  console.log('✅ Ready for integration testing');
} else {
  console.log('❌ Some environment variables need attention');
  console.log('🔧 Please check the variables marked above');
}

console.log('\n📋 Next Steps:');
console.log('1. Run database migration: npm run db:migrate');
console.log('2. Start development server: npm run dev');
console.log('3. Run full integration test: npm run test:stripe');
console.log('4. Set up Stripe webhook: npm run stripe:listen');

console.log('\n🎯 Credit System Configuration:');
console.log('┌─────────────┬─────────┬──────────────────────────────────────┐');
console.log('│ Plan        │ Credits │ Price ID                             │');
console.log('├─────────────┼─────────┼──────────────────────────────────────┤');
console.log(`│ Basic       │ 10      │ ${process.env.STRIPE_BASIC_PRICE_ID?.substring(0, 20)}... │`);
console.log(`│ Standard    │ 50      │ ${process.env.STRIPE_STANDARD_PRICE_ID?.substring(0, 20)}... │`);
console.log(`│ Pro         │ 200     │ ${process.env.STRIPE_PRO_PRICE_ID?.substring(0, 20)}... │`);
console.log('└─────────────┴─────────┴──────────────────────────────────────┘');

if (allConfigured) {
  console.log('\n🎉 Configuration Complete!');
  console.log('Your Stripe-Supabase integration is ready to test.');
} else {
  console.log('\n⚠️  Configuration Incomplete');
  console.log('Please fix the issues above before proceeding.');
}

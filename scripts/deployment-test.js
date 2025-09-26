#!/usr/bin/env node

/**
 * Deployment Test Script for StartResume.io
 * Tests critical functionality before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 StartResume.io Deployment Test Suite');
console.log('=====================================\n');

let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, message = '') {
  if (passed) {
    console.log(`✅ ${name}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}: ${message}`);
    testsFailed++;
  }
}

// Test 1: Check environment variables
console.log('📋 Testing Environment Configuration...');
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENAI_API_KEY'
];

requiredEnvVars.forEach(envVar => {
  const exists = process.env[envVar] || false;
  logTest(`Environment variable ${envVar}`, !!exists, 'Missing required environment variable');
});

// Test 2: Check critical files exist
console.log('\n📁 Testing File Structure...');
const criticalFiles = [
  'app/layout.tsx',
  'app/billing/page.tsx',
  'components/FloatingCreditWidget.tsx',
  'lib/subscription-manager.ts',
  'app/api/user/credits/route.ts',
  'app/api/stripe/create-checkout-session/route.ts',
  'app/api/stripe/webhook/route.ts',
  'middleware/credits.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  logTest(`File exists: ${file}`, exists, 'Critical file missing');
});

// Test 3: Check package.json dependencies
console.log('\n📦 Testing Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@clerk/nextjs',
    '@supabase/supabase-js',
    'stripe',
    'openai',
    'framer-motion',
    'lucide-react'
  ];

  requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    logTest(`Dependency: ${dep}`, !!exists, 'Required dependency missing');
  });
} catch (error) {
  logTest('Package.json readable', false, error.message);
}

// Test 4: Check for unused components (that should be removed)
console.log('\n🧹 Testing Cleanup...');
const shouldNotExist = [
  'components/GlobalCreditsDisplay.tsx',
  'components/UpgradeModal.tsx',
  'components/CreditGuard.tsx',
  'components/UpgradeButton.tsx'
];

shouldNotExist.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  logTest(`Unused component removed: ${file}`, !exists, 'Unused component still exists');
});

// Test 5: Check TypeScript compilation
console.log('\n🔧 Testing TypeScript...');
try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  logTest('TypeScript compilation', true);
} catch (error) {
  logTest('TypeScript compilation', false, 'TypeScript errors found');
}

// Test 6: Check Next.js build
console.log('\n⚡ Testing Next.js Build...');
try {
  const { execSync } = require('child_process');
  execSync('npm run build', { stdio: 'pipe' });
  logTest('Next.js build', true);
} catch (error) {
  logTest('Next.js build', false, 'Build failed');
}

// Summary
console.log('\n📊 Test Summary');
console.log('===============');
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please fix issues before deployment.');
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Build Test Script for StartResume.io
 * Quick build verification before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 StartResume.io Build Test');
console.log('============================\n');

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

// Test 1: Check critical environment variables
console.log('🔧 Testing Environment...');
const criticalEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
];

criticalEnvVars.forEach(envVar => {
  const exists = process.env[envVar] || false;
  logTest(`Environment variable ${envVar}`, !!exists, 'Missing required environment variable');
});

// Test 2: Check critical files
console.log('\n📁 Testing Critical Files...');
const criticalFiles = [
  'app/layout.tsx',
  'app/dashboard/layout.tsx',
  'components/FloatingCreditWidget.tsx',
  'lib/subscription-manager.ts',
  'lib/credit-middleware.ts',
  'app/api/user/credits/route.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  logTest(`File exists: ${file}`, exists, 'Critical file missing');
});

// Test 3: TypeScript compilation
console.log('\n🔧 Testing TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  logTest('TypeScript compilation', true);
} catch (error) {
  logTest('TypeScript compilation', false, 'TypeScript errors found');
}

// Test 4: Next.js build
console.log('\n⚡ Testing Next.js Build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  logTest('Next.js build', true);
} catch (error) {
  logTest('Next.js build', false, 'Build failed - check console for details');
  console.error('Build error details:', error.message);
}

// Summary
console.log('\n📊 Build Test Summary');
console.log('====================');
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed! Build is ready.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please fix issues before deployment.');
  process.exit(1);
}

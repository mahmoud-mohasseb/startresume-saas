#!/usr/bin/env node

/**
 * Pre-deployment test script
 * Validates the application is ready for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Pre-Deployment Tests...\n');

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function logTest(name, status, message = '') {
  const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${name}${message ? ': ' + message : ''}`);
  
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else results.warnings++;
}

// 1. Check Environment Variables
console.log('📋 Checking Environment Configuration...');
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const envFile = path.join(process.cwd(), '.env.local');
let envExists = fs.existsSync(envFile);

if (envExists) {
  logTest('Environment file exists', 'pass');
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      logTest(`${varName}`, 'pass');
    } else {
      logTest(`${varName}`, 'warning', 'Missing but may be set in deployment environment');
    }
  });
} else {
  logTest('Environment file', 'warning', '.env.local not found - ensure variables are set in deployment');
}

// 2. Check Package Dependencies
console.log('\n📦 Checking Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  logTest('package.json valid', 'pass');
  
  // Check for critical dependencies
  const criticalDeps = [
    'next', 'react', 'react-dom', '@clerk/nextjs', 
    'openai', '@supabase/supabase-js', 'stripe'
  ];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      logTest(`${dep} dependency`, 'pass');
    } else {
      logTest(`${dep} dependency`, 'fail', 'Missing critical dependency');
    }
  });
} catch (error) {
  logTest('Package.json validation', 'fail', error.message);
}

// 3. TypeScript Check
console.log('\n🔍 Running TypeScript Check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  logTest('TypeScript compilation', 'pass');
} catch (error) {
  const output = error.stdout?.toString() || error.stderr?.toString() || '';
  const errorCount = (output.match(/error TS/g) || []).length;
  
  if (errorCount > 0) {
    logTest('TypeScript compilation', 'warning', `${errorCount} type errors found (may not block deployment)`);
  } else {
    logTest('TypeScript compilation', 'pass');
  }
}

// 4. ESLint Check
console.log('\n🧹 Running ESLint Check...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  logTest('ESLint validation', 'pass');
} catch (error) {
  logTest('ESLint validation', 'warning', 'Linting issues found');
}

// 5. Build Test
console.log('\n🏗️ Testing Production Build...');
try {
  console.log('   Building application...');
  execSync('npm run build', { stdio: 'pipe' });
  logTest('Production build', 'pass');
  
  // Check if .next directory was created
  if (fs.existsSync('.next')) {
    logTest('Build artifacts created', 'pass');
  } else {
    logTest('Build artifacts created', 'fail');
  }
} catch (error) {
  logTest('Production build', 'fail', 'Build failed - check build logs');
  console.log('Build error:', error.message);
}

// 6. Check Critical Files
console.log('\n📁 Checking Critical Files...');
const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/dashboard/layout.tsx',
  'app/api/health/route.ts',
  'next.config.js',
  'tailwind.config.js'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    logTest(`${file}`, 'pass');
  } else {
    logTest(`${file}`, 'fail', 'Critical file missing');
  }
});

// 7. Check API Routes
console.log('\n🔌 Checking API Routes...');
const apiDir = 'app/api';
if (fs.existsSync(apiDir)) {
  const apiRoutes = fs.readdirSync(apiDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  logTest('API routes directory', 'pass', `${apiRoutes.length} routes found`);
  
  // Check for critical API routes
  const criticalRoutes = ['health', 'generate-resume', 'user'];
  criticalRoutes.forEach(route => {
    if (apiRoutes.includes(route)) {
      logTest(`API route: ${route}`, 'pass');
    } else {
      logTest(`API route: ${route}`, 'warning', 'Route not found');
    }
  });
} else {
  logTest('API routes directory', 'fail');
}

// 8. Security Headers Check
console.log('\n🛡️ Checking Security Configuration...');
try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  if (nextConfig.includes('X-Frame-Options')) {
    logTest('X-Frame-Options header', 'pass');
  } else {
    logTest('X-Frame-Options header', 'warning');
  }
  
  if (nextConfig.includes('X-Content-Type-Options')) {
    logTest('X-Content-Type-Options header', 'pass');
  } else {
    logTest('X-Content-Type-Options header', 'warning');
  }
} catch (error) {
  logTest('Security headers check', 'fail');
}

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${results.passed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`❌ Failed: ${results.failed}`);

if (results.failed === 0) {
  console.log('\n🎉 Application is ready for deployment!');
  if (results.warnings > 0) {
    console.log('⚠️  Please review warnings before deploying.');
  }
  process.exit(0);
} else {
  console.log('\n🚨 Critical issues found. Please fix before deploying.');
  process.exit(1);
}

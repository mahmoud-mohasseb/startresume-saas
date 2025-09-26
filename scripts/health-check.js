#!/usr/bin/env node

/**
 * StartResume.io Application Health Check Script
 * Checks for common errors and validates the application setup
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 StartResume.io Application Health Check');
console.log('==========================================\n');

const errors = [];
const warnings = [];
const checks = [];

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

// Helper function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

// 1. Check Environment Files
console.log('📋 Checking Environment Configuration...');
const envFiles = ['.env.local', '.env'];
let envFound = false;

envFiles.forEach(file => {
  if (fileExists(file)) {
    envFound = true;
    checks.push(`✅ Environment file found: ${file}`);
    
    const content = readFile(file);
    if (content) {
      const requiredVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'OPENAI_API_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
      ];
      
      requiredVars.forEach(varName => {
        if (content.includes(varName)) {
          checks.push(`✅ Environment variable found: ${varName}`);
        } else {
          errors.push(`❌ Missing environment variable: ${varName}`);
        }
      });
    }
  }
});

if (!envFound) {
  errors.push('❌ No environment file found (.env.local or .env)');
}

// 2. Check Core Files
console.log('\n📋 Checking Core Application Files...');
const coreFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'contexts/SubscriptionContext.tsx',
  'app/api/user/credits/route.ts',
  'app/api/user/credits/consume/route.ts'
];

coreFiles.forEach(file => {
  if (fileExists(file)) {
    checks.push(`✅ Core file exists: ${file}`);
  } else {
    errors.push(`❌ Missing core file: ${file}`);
  }
});

// 3. Check API Routes
console.log('\n📋 Checking API Routes...');
const apiRoutes = [
  'app/api/user/credits/route.ts',
  'app/api/openai/suggestions/route.ts',
  'app/api/generate-resume/route.ts',
  'app/api/cover-letters/route.ts',
  'app/api/tailor-resume/route.ts',
  'app/api/personal-brand/strategy/route.ts',
  'app/api/salary-research/route.ts',
  'app/api/openai/linkedin-optimize/route.ts',
  'app/api/openai/mock-interview/route.ts'
];

apiRoutes.forEach(route => {
  if (fileExists(route)) {
    checks.push(`✅ API route exists: ${route}`);
    
    // Check if route has proper error handling
    const content = readFile(route);
    if (content) {
      if (content.includes('try') && content.includes('catch')) {
        checks.push(`✅ Error handling found in: ${route}`);
      } else {
        warnings.push(`⚠️  No error handling in: ${route}`);
      }
      
      // Check for authentication
      if (content.includes('currentUser') || content.includes('auth')) {
        checks.push(`✅ Authentication check found in: ${route}`);
      } else {
        warnings.push(`⚠️  No authentication check in: ${route}`);
      }
    }
  } else {
    errors.push(`❌ Missing API route: ${route}`);
  }
});

// 4. Check Dashboard Pages
console.log('\n📋 Checking Dashboard Pages...');
const dashboardPages = [
  'app/dashboard/page.tsx',
  'app/dashboard/create/page.tsx',
  'app/dashboard/cover-letter/page.tsx',
  'app/dashboard/job-tailoring/page.tsx',
  'app/dashboard/personal-brand/page.tsx',
  'app/dashboard/salary-negotiation/page.tsx',
  'app/dashboard/linkedin-optimizer/page.tsx',
  'app/dashboard/mock-interview/page.tsx'
];

dashboardPages.forEach(page => {
  if (fileExists(page)) {
    checks.push(`✅ Dashboard page exists: ${page}`);
    
    const content = readFile(page);
    if (content) {
      // Check for proper subscription context usage
      if (content.includes('useSubscription')) {
        checks.push(`✅ Uses useSubscription: ${page}`);
      } else if (content.includes('usePlan')) {
        warnings.push(`⚠️  Uses deprecated usePlan: ${page}`);
      }
      
      // Check for credit consumption
      if (content.includes('useAIFeature')) {
        checks.push(`✅ Uses useAIFeature for credit consumption: ${page}`);
      } else if (content.includes('fetch(') && content.includes('api')) {
        warnings.push(`⚠️  May need credit consumption integration: ${page}`);
      }
    }
  } else {
    errors.push(`❌ Missing dashboard page: ${page}`);
  }
});

// 5. Check Package.json Dependencies
console.log('\n📋 Checking Dependencies...');
const packageJson = readFile('package.json');
if (packageJson) {
  try {
    const pkg = JSON.parse(packageJson);
    const requiredDeps = [
      '@clerk/nextjs',
      'next',
      'react',
      'openai',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react',
      'react-hot-toast'
    ];
    
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    requiredDeps.forEach(dep => {
      if (allDeps[dep]) {
        checks.push(`✅ Dependency found: ${dep}@${allDeps[dep]}`);
      } else {
        errors.push(`❌ Missing dependency: ${dep}`);
      }
    });
  } catch (error) {
    errors.push('❌ Invalid package.json format');
  }
}

// 6. Check SubscriptionContext Configuration
console.log('\n📋 Checking SubscriptionContext Configuration...');
const subscriptionContext = readFile('contexts/SubscriptionContext.tsx');
if (subscriptionContext) {
  // Check for free plan support
  if (subscriptionContext.includes("'resume_generation': true")) {
    checks.push('✅ Free plan has access to resume generation');
  }
  
  if (subscriptionContext.includes("'job_tailoring': true")) {
    checks.push('✅ Free plan has access to job tailoring');
  }
  
  if (subscriptionContext.includes("'cover_letter_generation': true")) {
    checks.push('✅ Free plan has access to cover letter generation');
  }
  
  if (subscriptionContext.includes('useAIFeature')) {
    checks.push('✅ useAIFeature function implemented');
  } else {
    errors.push('❌ useAIFeature function missing');
  }
}

// 7. Check for Common TypeScript Errors
console.log('\n📋 Checking for Common TypeScript Issues...');
const tsConfigExists = fileExists('tsconfig.json');
if (tsConfigExists) {
  checks.push('✅ TypeScript configuration found');
} else {
  warnings.push('⚠️  No TypeScript configuration found');
}

// Print Results
console.log('\n' + '='.repeat(50));
console.log('📊 HEALTH CHECK RESULTS');
console.log('='.repeat(50));

console.log(`\n✅ PASSED CHECKS (${checks.length}):`);
checks.forEach(check => console.log(check));

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach(warning => console.log(warning));
}

if (errors.length > 0) {
  console.log(`\n❌ ERRORS (${errors.length}):`);
  errors.forEach(error => console.log(error));
  console.log('\n🚨 CRITICAL: Please fix the above errors before deploying!');
} else {
  console.log('\n🎉 ALL CRITICAL CHECKS PASSED!');
}

console.log('\n📋 SUMMARY:');
console.log(`   ✅ Passed: ${checks.length}`);
console.log(`   ⚠️  Warnings: ${warnings.length}`);
console.log(`   ❌ Errors: ${errors.length}`);

if (errors.length === 0 && warnings.length <= 3) {
  console.log('\n🚀 Application appears ready for deployment!');
} else if (errors.length === 0) {
  console.log('\n✅ Application is functional but has some warnings to address.');
} else {
  console.log('\n🔧 Application needs fixes before deployment.');
}

console.log('\n' + '='.repeat(50));

// Exit with appropriate code
process.exit(errors.length > 0 ? 1 : 0);

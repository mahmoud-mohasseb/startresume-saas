#!/usr/bin/env node

/**
 * Comprehensive Deployment Test Suite for StartResume.io
 * Tests all critical components before deployment
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

console.log('🚀 COMPREHENSIVE DEPLOYMENT TEST SUITE');
console.log('=====================================');
console.log('Testing StartResume.io for deployment readiness...\n');

const errors = [];
const warnings = [];
const passed = [];
let testCount = 0;

// Helper functions
function logTest(name) {
  testCount++;
  console.log(`\n${testCount}. 🔍 ${name}`);
}

function logPass(message) {
  passed.push(message);
  console.log(`   ✅ ${message}`);
}

function logWarn(message) {
  warnings.push(message);
  console.log(`   ⚠️  ${message}`);
}

function logError(message) {
  errors.push(message);
  console.log(`   ❌ ${message}`);
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

function runCommand(command) {
  return new Promise((resolve) => {
    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

// Test 1: Environment Configuration
async function testEnvironment() {
  logTest('Environment Configuration');
  
  const envFiles = ['.env.local', '.env'];
  let envFound = false;
  
  for (const file of envFiles) {
    if (fileExists(file)) {
      envFound = true;
      logPass(`Environment file found: ${file}`);
      
      const content = readFile(file);
      if (content) {
        const requiredVars = [
          'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
          'CLERK_SECRET_KEY',
          'OPENAI_API_KEY',
          'NEXT_PUBLIC_SUPABASE_URL',
          'SUPABASE_SERVICE_ROLE_KEY'
        ];
        
        for (const varName of requiredVars) {
          if (content.includes(varName)) {
            logPass(`Environment variable configured: ${varName}`);
          } else {
            logError(`Missing environment variable: ${varName}`);
          }
        }
      }
      break;
    }
  }
  
  if (!envFound) {
    logError('No environment file found (.env.local or .env)');
  }
}

// Test 2: Package Dependencies
async function testDependencies() {
  logTest('Package Dependencies');
  
  if (!fileExists('package.json')) {
    logError('package.json not found');
    return;
  }
  
  const packageJson = readFile('package.json');
  if (!packageJson) {
    logError('Could not read package.json');
    return;
  }
  
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
      'react-hot-toast',
      'tailwindcss'
    ];
    
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    for (const dep of requiredDeps) {
      if (allDeps[dep]) {
        logPass(`Dependency found: ${dep}@${allDeps[dep]}`);
      } else {
        logError(`Missing dependency: ${dep}`);
      }
    }
    
    // Check for node_modules
    if (fileExists('node_modules')) {
      logPass('node_modules directory exists');
    } else {
      logError('node_modules directory missing - run npm install');
    }
    
  } catch (error) {
    logError('Invalid package.json format');
  }
}

// Test 3: TypeScript Configuration
async function testTypeScript() {
  logTest('TypeScript Configuration');
  
  if (fileExists('tsconfig.json')) {
    logPass('TypeScript configuration found');
    
    // Run TypeScript check
    const { error, stdout, stderr } = await runCommand('npx tsc --noEmit');
    if (error) {
      logError(`TypeScript errors found: ${stderr}`);
    } else {
      logPass('TypeScript compilation check passed');
    }
  } else {
    logWarn('No TypeScript configuration found');
  }
}

// Test 4: Next.js Configuration
async function testNextConfig() {
  logTest('Next.js Configuration');
  
  if (fileExists('next.config.js') || fileExists('next.config.mjs')) {
    logPass('Next.js configuration found');
  } else {
    logWarn('No Next.js configuration found (using defaults)');
  }
  
  // Test Next.js build
  console.log('   🔄 Testing Next.js build...');
  const { error, stdout, stderr } = await runCommand('npm run build');
  if (error) {
    logError(`Next.js build failed: ${stderr}`);
  } else {
    logPass('Next.js build successful');
  }
}

// Test 5: API Routes
async function testAPIRoutes() {
  logTest('API Routes');
  
  const criticalRoutes = [
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
  
  for (const route of criticalRoutes) {
    if (fileExists(route)) {
      logPass(`API route exists: ${route}`);
      
      const content = readFile(route);
      if (content) {
        // Check for proper exports
        if (content.includes('export async function GET') || content.includes('export async function POST')) {
          logPass(`Proper exports found in: ${route}`);
        } else {
          logWarn(`No proper exports in: ${route}`);
        }
        
        // Check for error handling
        if (content.includes('try') && content.includes('catch')) {
          logPass(`Error handling found in: ${route}`);
        } else {
          logWarn(`No error handling in: ${route}`);
        }
      }
    } else {
      logError(`Missing API route: ${route}`);
    }
  }
}

// Test 6: Dashboard Pages
async function testDashboardPages() {
  logTest('Dashboard Pages');
  
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
  
  for (const page of dashboardPages) {
    if (fileExists(page)) {
      logPass(`Dashboard page exists: ${page}`);
      
      const content = readFile(page);
      if (content) {
        // Check for proper React component
        if (content.includes('export default') || content.includes('export {')) {
          logPass(`Proper export found in: ${page}`);
        } else {
          logError(`No default export in: ${page}`);
        }
        
        // Check for subscription context usage
        if (content.includes('useSubscription')) {
          logPass(`Uses useSubscription: ${page}`);
        } else if (content.includes('usePlan')) {
          logWarn(`Uses deprecated usePlan: ${page}`);
        }
        
        // Check for credit consumption
        if (content.includes('useAIFeature')) {
          logPass(`Uses useAIFeature: ${page}`);
        } else if (content.includes('fetch(') && content.includes('api')) {
          logWarn(`May need credit integration: ${page}`);
        }
      }
    } else {
      logError(`Missing dashboard page: ${page}`);
    }
  }
}

// Test 7: Context and State Management
async function testContexts() {
  logTest('Context and State Management');
  
  if (fileExists('contexts/SubscriptionContext.tsx')) {
    logPass('SubscriptionContext found');
    
    const content = readFile('contexts/SubscriptionContext.tsx');
    if (content) {
      const requiredFunctions = ['useAIFeature', 'canUseFeature', 'forceRefresh'];
      for (const func of requiredFunctions) {
        if (content.includes(func)) {
          logPass(`Function found: ${func}`);
        } else {
          logError(`Missing function: ${func}`);
        }
      }
    }
  } else {
    logError('SubscriptionContext.tsx not found');
  }
}

// Test 8: Styling and UI
async function testStyling() {
  logTest('Styling and UI Configuration');
  
  if (fileExists('tailwind.config.js') || fileExists('tailwind.config.ts')) {
    logPass('Tailwind configuration found');
  } else {
    logError('Tailwind configuration missing');
  }
  
  if (fileExists('app/globals.css')) {
    logPass('Global CSS found');
  } else {
    logError('Global CSS missing');
  }
  
  // Check for common UI components
  const uiComponents = [
    'components',
    'lib/utils.ts',
    'lib/utils.js'
  ];
  
  for (const component of uiComponents) {
    if (fileExists(component)) {
      logPass(`UI component/utility found: ${component}`);
    }
  }
}

// Test 9: Database Schema and Migrations
async function testDatabase() {
  logTest('Database Configuration');
  
  const dbFiles = [
    'supabase/schema.sql',
    'scripts/database-cleanup.sql'
  ];
  
  for (const file of dbFiles) {
    if (fileExists(file)) {
      logPass(`Database file found: ${file}`);
    } else {
      logWarn(`Database file missing: ${file}`);
    }
  }
}

// Test 10: Security and Authentication
async function testSecurity() {
  logTest('Security Configuration');
  
  // Check for Clerk configuration
  const content = readFile('app/layout.tsx');
  if (content && content.includes('ClerkProvider')) {
    logPass('Clerk authentication configured');
  } else {
    logError('Clerk authentication not configured');
  }
  
  // Check for middleware
  if (fileExists('middleware.ts') || fileExists('middleware.js')) {
    logPass('Middleware file found');
  } else {
    logWarn('No middleware file found');
  }
}

// Test 11: Performance and Optimization
async function testPerformance() {
  logTest('Performance and Optimization');
  
  // Check for image optimization
  const nextConfig = readFile('next.config.js');
  if (nextConfig && nextConfig.includes('images')) {
    logPass('Image optimization configured');
  } else {
    logWarn('No image optimization configuration');
  }
  
  // Check for bundle analysis
  if (fileExists('.next')) {
    logPass('Next.js build directory exists');
  } else {
    logWarn('No build directory found - run npm run build');
  }
}

// Test 12: Deployment Configuration
async function testDeployment() {
  logTest('Deployment Configuration');
  
  const deploymentFiles = [
    'vercel.json',
    'netlify.toml',
    'Dockerfile',
    '.dockerignore'
  ];
  
  let deploymentConfigFound = false;
  for (const file of deploymentFiles) {
    if (fileExists(file)) {
      logPass(`Deployment configuration found: ${file}`);
      deploymentConfigFound = true;
    }
  }
  
  if (!deploymentConfigFound) {
    logWarn('No specific deployment configuration found (using defaults)');
  }
  
  // Check for environment variable documentation
  if (fileExists('.env.example') || fileExists('README.md')) {
    logPass('Environment documentation available');
  } else {
    logWarn('No environment variable documentation');
  }
}

// Main test runner
async function runAllTests() {
  console.log('Starting comprehensive test suite...\n');
  
  try {
    await testEnvironment();
    await testDependencies();
    await testTypeScript();
    await testNextConfig();
    await testAPIRoutes();
    await testDashboardPages();
    await testContexts();
    await testStyling();
    await testDatabase();
    await testSecurity();
    await testPerformance();
    await testDeployment();
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n✅ PASSED TESTS (${passed.length}):`);
    passed.forEach(test => console.log(`   ✅ ${test}`));
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach(error => console.log(`   ❌ ${error}`));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DEPLOYMENT READINESS ASSESSMENT');
    console.log('='.repeat(60));
    
    if (errors.length === 0) {
      if (warnings.length <= 5) {
        console.log('\n🚀 ✅ READY FOR DEPLOYMENT!');
        console.log('   All critical tests passed. Minor warnings can be addressed post-deployment.');
      } else {
        console.log('\n🔧 ⚠️  MOSTLY READY - Address warnings before deployment');
        console.log('   No critical errors, but several warnings should be resolved.');
      }
    } else if (errors.length <= 3) {
      console.log('\n🛠️  ❌ NEEDS FIXES - Critical issues found');
      console.log('   Please fix the errors above before deploying.');
    } else {
      console.log('\n🚨 ❌ NOT READY FOR DEPLOYMENT');
      console.log('   Multiple critical issues found. Significant work needed.');
    }
    
    console.log(`\n📈 Statistics:`);
    console.log(`   Total Tests: ${testCount}`);
    console.log(`   Passed: ${passed.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Success Rate: ${Math.round((passed.length / (passed.length + warnings.length + errors.length)) * 100)}%`);
    
    // Exit with appropriate code
    process.exit(errors.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();

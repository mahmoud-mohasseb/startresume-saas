#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

console.log('🧪 StartResume.io - Comprehensive Application Test Suite\n');

class AppTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  addResult(testName, passed, message = '') {
    this.results.tests.push({ testName, passed, message });
    if (passed) {
      this.results.passed++;
      this.log(`${testName}: PASSED ${message}`, 'success');
    } else {
      this.results.failed++;
      this.log(`${testName}: FAILED ${message}`, 'error');
    }
  }

  addWarning(testName, message) {
    this.results.warnings++;
    this.log(`${testName}: WARNING ${message}`, 'warning');
  }

  // Test 1: File Structure and Dependencies
  async testFileStructure() {
    this.log('Testing file structure and dependencies...', 'test');
    
    const criticalFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'tailwind.config.js',
      'app/layout.tsx',
      'app/page.tsx',
      'app/dashboard/layout.tsx',
      'app/dashboard/page.tsx',
      'contexts/SubscriptionContext.tsx',
      'lib/stripe-direct-credits.ts',
      'components/StripeDirectCreditWidget.tsx',
      'components/StripeDirectFeatureGuard.tsx'
    ];

    let missingFiles = [];
    
    for (const file of criticalFiles) {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    this.addResult(
      'Critical Files Check',
      missingFiles.length === 0,
      missingFiles.length > 0 ? `Missing: ${missingFiles.join(', ')}` : 'All critical files present'
    );
  }

  // Test 2: API Routes Structure
  async testAPIRoutes() {
    this.log('Testing API routes structure...', 'test');
    
    const requiredAPIRoutes = [
      'app/api/generate-resume/route.ts',
      'app/api/tailor-resume/route.ts',
      'app/api/cover-letters/route.ts',
      'app/api/user/credits/route.ts',
      'app/api/personal-brand/strategy/route.ts',
      'app/api/salary-research/route.ts',
      'app/api/openai/linkedin-optimize/route.ts',
      'app/api/openai/mock-interview/route.ts'
    ];

    let missingRoutes = [];
    
    for (const route of requiredAPIRoutes) {
      const routePath = path.join(process.cwd(), route);
      if (!fs.existsSync(routePath)) {
        missingRoutes.push(route);
      }
    }

    this.addResult(
      'API Routes Check',
      missingRoutes.length === 0,
      missingRoutes.length > 0 ? `Missing: ${missingRoutes.join(', ')}` : 'All API routes present'
    );
  }

  // Test 3: Credit System Integration
  async testCreditSystemIntegration() {
    this.log('Testing credit system integration...', 'test');
    
    const creditSystemFiles = [
      'lib/stripe-direct-credits.ts',
      'contexts/SubscriptionContext.tsx',
      'components/StripeDirectCreditWidget.tsx'
    ];

    // Check if files contain required functions/exports
    const checks = [
      {
        file: 'lib/stripe-direct-credits.ts',
        contains: ['checkAndConsumeStripeDirectCredits', 'getStripeDirectCredits'],
        name: 'Stripe Direct Credits Functions'
      },
      {
        file: 'contexts/SubscriptionContext.tsx',
        contains: ['SubscriptionProvider', 'useSubscription', 'refreshSubscription'],
        name: 'Subscription Context'
      },
      {
        file: 'components/StripeDirectCreditWidget.tsx',
        contains: ['StripeDirectCreditWidget', 'useSubscription'],
        name: 'Credit Widget Integration'
      }
    ];

    for (const check of checks) {
      const filePath = path.join(process.cwd(), check.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const missingFunctions = check.contains.filter(func => !content.includes(func));
        
        this.addResult(
          check.name,
          missingFunctions.length === 0,
          missingFunctions.length > 0 ? `Missing: ${missingFunctions.join(', ')}` : 'All functions present'
        );
      } else {
        this.addResult(check.name, false, 'File not found');
      }
    }
  }

  // Test 4: API Routes Credit Integration
  async testAPIRoutesCredits() {
    this.log('Testing API routes credit integration...', 'test');
    
    const apiRoutesWithCredits = [
      'app/api/generate-resume/route.ts',
      'app/api/tailor-resume/route.ts', 
      'app/api/cover-letters/route.ts',
      'app/api/personal-brand/strategy/route.ts',
      'app/api/salary-research/route.ts',
      'app/api/openai/linkedin-optimize/route.ts',
      'app/api/openai/mock-interview/route.ts'
    ];

    for (const route of apiRoutesWithCredits) {
      const routePath = path.join(process.cwd(), route);
      if (fs.existsSync(routePath)) {
        const content = fs.readFileSync(routePath, 'utf8');
        const hasStripeDirectImport = content.includes('checkAndConsumeStripeDirectCredits');
        const hasCreditCheck = content.includes('checkAndConsumeStripeDirectCredits(');
        
        this.addResult(
          `Credit Integration - ${path.basename(route)}`,
          hasStripeDirectImport && hasCreditCheck,
          !hasStripeDirectImport ? 'Missing Stripe-direct import' : 
          !hasCreditCheck ? 'Missing credit consumption call' : 'Properly integrated'
        );
      } else {
        this.addResult(`Credit Integration - ${path.basename(route)}`, false, 'Route file not found');
      }
    }
  }

  // Test 5: Frontend Credit Integration
  async testFrontendCreditIntegration() {
    this.log('Testing frontend credit integration...', 'test');
    
    const pagesWithCredits = [
      'app/dashboard/create/page.tsx',
      'app/dashboard/cover-letter/page.tsx',
      'app/dashboard/job-tailoring/page.tsx'
    ];

    for (const page of pagesWithCredits) {
      const pagePath = path.join(process.cwd(), page);
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        const hasSubscriptionImport = content.includes('useSubscription');
        const hasRefreshCall = content.includes('refreshSubscription');
        
        this.addResult(
          `Frontend Credit Integration - ${path.basename(page)}`,
          hasSubscriptionImport && hasRefreshCall,
          !hasSubscriptionImport ? 'Missing useSubscription import' :
          !hasRefreshCall ? 'Missing refreshSubscription call' : 'Properly integrated'
        );
      } else {
        this.addResult(`Frontend Credit Integration - ${path.basename(page)}`, false, 'Page file not found');
      }
    }
  }

  // Test 6: Environment Variables
  async testEnvironmentVariables() {
    this.log('Testing environment variables...', 'test');
    
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'CLERK_SECRET_KEY',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const envFilePath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    }

    const missingVars = requiredEnvVars.filter(varName => 
      !process.env[varName] && !envContent.includes(varName)
    );

    this.addResult(
      'Environment Variables',
      missingVars.length === 0,
      missingVars.length > 0 ? `Missing: ${missingVars.join(', ')}` : 'All required env vars configured'
    );
  }

  // Test 7: TypeScript Compilation
  async testTypeScriptCompilation() {
    this.log('Testing TypeScript compilation...', 'test');
    
    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit');
      this.addResult('TypeScript Compilation', true, 'No TypeScript errors');
    } catch (error) {
      this.addResult('TypeScript Compilation', false, `TypeScript errors found: ${error.message}`);
    }
  }

  // Test 8: Next.js Build
  async testNextJSBuild() {
    this.log('Testing Next.js build...', 'test');
    
    try {
      this.log('Running Next.js build (this may take a few minutes)...', 'info');
      const { stdout, stderr } = await execAsync('npm run build', { timeout: 300000 }); // 5 minute timeout
      
      if (stdout.includes('✓ Compiled successfully')) {
        this.addResult('Next.js Build', true, 'Build completed successfully');
      } else {
        this.addResult('Next.js Build', false, 'Build completed with warnings');
      }
    } catch (error) {
      this.addResult('Next.js Build', false, `Build failed: ${error.message}`);
    }
  }

  // Test 9: Package Dependencies
  async testPackageDependencies() {
    this.log('Testing package dependencies...', 'test');
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const criticalDependencies = [
        '@clerk/nextjs',
        '@stripe/stripe-js',
        'stripe',
        'openai',
        '@supabase/supabase-js',
        'next',
        'react',
        'framer-motion',
        'tailwindcss'
      ];

      const missingDeps = criticalDependencies.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
      );

      this.addResult(
        'Package Dependencies',
        missingDeps.length === 0,
        missingDeps.length > 0 ? `Missing: ${missingDeps.join(', ')}` : 'All critical dependencies present'
      );
    } catch (error) {
      this.addResult('Package Dependencies', false, `Error reading package.json: ${error.message}`);
    }
  }

  // Test 10: Unused Files Check
  async testUnusedFiles() {
    this.log('Testing for unused files...', 'test');
    
    const { unusedComponents, unusedPages, legacyRoutes } = require('../scripts/cleanup-unused-files.js');
    const allUnusedFiles = [...unusedComponents, ...unusedPages, ...legacyRoutes];
    
    let existingUnusedFiles = [];
    
    for (const file of allUnusedFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        existingUnusedFiles.push(file);
      }
    }

    if (existingUnusedFiles.length > 0) {
      this.addWarning('Unused Files', `Found ${existingUnusedFiles.length} unused files that can be removed`);
    } else {
      this.addResult('Unused Files', true, 'No unused files found');
    }
  }

  // Run all tests
  async runAllTests() {
    this.log('Starting comprehensive test suite...', 'info');
    
    await this.testFileStructure();
    await this.testAPIRoutes();
    await this.testCreditSystemIntegration();
    await this.testAPIRoutesCredits();
    await this.testFrontendCreditIntegration();
    await this.testEnvironmentVariables();
    await this.testPackageDependencies();
    await this.testUnusedFiles();
    await this.testTypeScriptCompilation();
    // Note: Build test is commented out as it's time-consuming
    // await this.testNextJSBuild();
    
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📊 Total Tests: ${this.results.tests.length}`);
    
    const successRate = ((this.results.passed / this.results.tests.length) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`   - ${test.testName}: ${test.message}`));
    }
    
    if (this.results.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      // Warnings are logged separately, so we don't need to list them again
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (this.results.failed === 0) {
      console.log('✅ All critical tests passed! Your application is ready for production.');
    } else {
      console.log('❌ Please fix the failed tests before deploying to production.');
    }
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Fix any failed tests');
    console.log('2. Run: node scripts/cleanup-unused-files.js (to remove unused files)');
    console.log('3. Run: npm run build (to verify production build)');
    console.log('4. Deploy to production');
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AppTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = AppTester;

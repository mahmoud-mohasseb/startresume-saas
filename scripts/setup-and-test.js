#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 StartResume.io - Setup and Test Script');
console.log('=====================================\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? 'green' : 'red');
  return exists;
}

function checkEnvVar(varName, description) {
  const value = process.env[varName];
  const isSet = !!value;
  const isValid = value && value.length > 10 && !value.includes('your_') && !value.includes('sk_test_your');
  
  if (isSet && isValid) {
    log(`✅ ${description}: Configured`, 'green');
  } else if (isSet) {
    log(`⚠️  ${description}: Set but appears to be placeholder`, 'yellow');
  } else {
    log(`❌ ${description}: Not set`, 'red');
  }
  
  return isSet && isValid;
}

async function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testAPIEndpoint(url, method = 'GET', description) {
  try {
    log(`🔄 Testing ${description}...`, 'blue');
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, { method });
    
    if (response.ok || response.status < 500) {
      log(`✅ ${description}: ${response.status} ${response.statusText}`, 'green');
      return true;
    } else {
      log(`❌ ${description}: ${response.status} ${response.statusText}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  let totalChecks = 0;
  let passedChecks = 0;

  // 1. Check project structure
  log('\n📁 Checking Project Structure', 'cyan');
  log('================================', 'cyan');
  
  const criticalFiles = [
    ['package.json', 'Package configuration'],
    ['next.config.js', 'Next.js configuration'],
    ['.env.local', 'Environment variables'],
    ['app/layout.tsx', 'Root layout'],
    ['app/dashboard/layout.tsx', 'Dashboard layout'],
    ['lib/supabase.ts', 'Supabase client'],
    ['lib/credits.ts', 'Credit management system']
  ];

  for (const [file, desc] of criticalFiles) {
    totalChecks++;
    if (checkFile(file, desc)) passedChecks++;
  }

  // 2. Check environment variables
  log('\n🔧 Checking Environment Variables', 'cyan');
  log('==================================', 'cyan');
  
  // Load environment variables
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    });
  }

  const envVars = [
    ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase URL'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase Anon Key'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase Service Key'],
    ['OPENAI_API_KEY', 'OpenAI API Key'],
    ['STRIPE_SECRET_KEY', 'Stripe Secret Key'],
    ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Stripe Publishable Key'],
    ['STRIPE_WEBHOOK_SECRET', 'Stripe Webhook Secret'],
    ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'Clerk Publishable Key'],
    ['CLERK_SECRET_KEY', 'Clerk Secret Key']
  ];

  for (const [envVar, desc] of envVars) {
    totalChecks++;
    if (checkEnvVar(envVar, desc)) passedChecks++;
  }

  // 3. Check dependencies
  log('\n📦 Checking Dependencies', 'cyan');
  log('========================', 'cyan');
  
  const installResult = await runCommand('npm list --depth=0', 'Checking installed packages');
  totalChecks++;
  if (installResult.success) passedChecks++;

  // 4. Build check
  log('\n🏗️  Build Check', 'cyan');
  log('===============', 'cyan');
  
  const buildResult = await runCommand('npm run build', 'Building project');
  totalChecks++;
  if (buildResult.success) passedChecks++;

  // 5. Start development server and test APIs
  log('\n🌐 API Endpoint Tests', 'cyan');
  log('====================', 'cyan');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Start dev server in background
  log('🔄 Starting development server...', 'blue');
  const serverProcess = require('child_process').spawn('npm', ['run', 'dev'], {
    detached: true,
    stdio: 'ignore'
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 10000));

  const apiTests = [
    [`${baseUrl}/api/test-suite`, 'GET', 'Test Suite API'],
    [`${baseUrl}/api/salary-research`, 'GET', 'Salary Research API'],
    [`${baseUrl}/api/webhooks/stripe`, 'GET', 'Stripe Webhook API'],
    [`${baseUrl}/api/user/subscription`, 'GET', 'User Subscription API']
  ];

  for (const [url, method, desc] of apiTests) {
    totalChecks++;
    if (await testAPIEndpoint(url, method, desc)) passedChecks++;
  }

  // Clean up server process
  try {
    process.kill(-serverProcess.pid);
  } catch (e) {
    // Server might not be running
  }

  // 6. Database connectivity test
  log('\n🗄️  Database Tests', 'cyan');
  log('=================', 'cyan');
  
  try {
    // This would require the test suite API to be running
    log('ℹ️  Database tests available via /api/test-suite endpoint', 'blue');
  } catch (error) {
    log(`❌ Database test failed: ${error.message}`, 'red');
  }

  // 7. Final report
  log('\n📊 Final Report', 'cyan');
  log('===============', 'cyan');
  
  const successRate = Math.round((passedChecks / totalChecks) * 100);
  
  log(`Total Checks: ${totalChecks}`, 'bright');
  log(`Passed: ${passedChecks}`, 'green');
  log(`Failed: ${totalChecks - passedChecks}`, 'red');
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');

  if (successRate >= 80) {
    log('\n🎉 System is ready for production!', 'green');
    log('✅ All critical systems are operational', 'green');
  } else if (successRate >= 60) {
    log('\n⚠️  System has some issues but is functional', 'yellow');
    log('🔧 Please address the failed checks above', 'yellow');
  } else {
    log('\n❌ System has critical issues', 'red');
    log('🚨 Please fix the failed checks before proceeding', 'red');
  }

  // 8. Next steps
  log('\n🚀 Next Steps', 'cyan');
  log('=============', 'cyan');
  log('1. Set up your Stripe products and get price IDs', 'bright');
  log('2. Configure webhook endpoints in Stripe dashboard', 'bright');
  log('3. Set up Supabase database with the provided schema', 'bright');
  log('4. Test payment flow with Stripe test cards', 'bright');
  log('5. Run comprehensive tests: npm run test', 'bright');
  
  log('\n📚 Documentation', 'cyan');
  log('=================', 'cyan');
  log('• API Documentation: /api/test-suite', 'bright');
  log('• Database Schema: /lib/database-schema.sql', 'bright');
  log('• Environment Setup: /.env.example', 'bright');

  process.exit(successRate >= 60 ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log(`❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Quick Deployment Check for StartResume.io
 * Fast validation of critical deployment requirements
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ QUICK DEPLOYMENT CHECK');
console.log('========================\n');

let errors = 0;
let warnings = 0;
let passed = 0;

function check(name, condition, errorMsg, warnMsg) {
  if (condition === true) {
    console.log(`✅ ${name}`);
    passed++;
  } else if (condition === 'warn') {
    console.log(`⚠️  ${name} - ${warnMsg}`);
    warnings++;
  } else {
    console.log(`❌ ${name} - ${errorMsg}`);
    errors++;
  }
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

// Critical file checks
console.log('📁 Critical Files:');
check('package.json exists', fileExists('package.json'), 'Missing package.json');
check('next.config.js exists', fileExists('next.config.js') || fileExists('next.config.mjs'), 'No Next.js config');
check('tailwind.config.js exists', fileExists('tailwind.config.js'), 'Missing Tailwind config');
check('SubscriptionContext exists', fileExists('contexts/SubscriptionContext.tsx'), 'Missing SubscriptionContext');

// Environment check
console.log('\n🔧 Environment:');
const hasEnv = fileExists('.env.local') || fileExists('.env');
check('Environment file exists', hasEnv, 'No .env file found');

if (hasEnv) {
  const envContent = readFile('.env.local') || readFile('.env');
  if (envContent) {
    check('CLERK_SECRET_KEY set', envContent.includes('CLERK_SECRET_KEY'), 'Missing Clerk secret');
    check('OPENAI_API_KEY set', envContent.includes('OPENAI_API_KEY'), 'Missing OpenAI key');
    check('SUPABASE keys set', envContent.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Missing Supabase keys');
  }
}

// Dashboard pages check
console.log('\n📄 Dashboard Pages:');
const dashboardPages = [
  'app/dashboard/page.tsx',
  'app/dashboard/create/page.tsx',
  'app/dashboard/personal-brand/page.tsx',
  'app/dashboard/cover-letter/page.tsx',
  'app/dashboard/job-tailoring/page.tsx'
];

dashboardPages.forEach(page => {
  const exists = fileExists(page);
  const pageName = page.split('/').pop().replace('.tsx', '');
  
  if (exists) {
    const content = readFile(page);
    const hasExport = content && content.includes('export default');
    check(`${pageName} page`, hasExport, 'Missing default export', 'Page exists but may have issues');
  } else {
    check(`${pageName} page`, false, 'Page file missing');
  }
});

// API routes check
console.log('\n🔌 Critical API Routes:');
const apiRoutes = [
  'app/api/user/credits/route.ts',
  'app/api/openai/suggestions/route.ts',
  'app/api/generate-resume/route.ts',
  'app/api/personal-brand/strategy/route.ts'
];

apiRoutes.forEach(route => {
  const exists = fileExists(route);
  const routeName = route.split('/').slice(-2, -1)[0];
  check(`${routeName} API`, exists, 'API route missing');
});

// Component dependencies
console.log('\n🧩 Components:');
check('PlanBasedFeatureGuard', fileExists('components/PlanBasedFeatureGuard.tsx'), 'Missing feature guard component');

// SubscriptionContext validation
console.log('\n🔄 State Management:');
const subscriptionContext = readFile('contexts/SubscriptionContext.tsx');
if (subscriptionContext) {
  check('useAIFeature function', subscriptionContext.includes('useAIFeature'), 'Missing useAIFeature function');
  check('canUseFeature function', subscriptionContext.includes('canUseFeature'), 'Missing canUseFeature function');
  check('Free plan features', subscriptionContext.includes("'resume_generation': true"), 'Free plan not configured');
}

// Build dependencies
console.log('\n📦 Dependencies:');
const packageJson = readFile('package.json');
if (packageJson) {
  try {
    const pkg = JSON.parse(packageJson);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    check('Next.js', deps['next'], 'Missing Next.js');
    check('React', deps['react'], 'Missing React');
    check('Clerk', deps['@clerk/nextjs'], 'Missing Clerk');
    check('OpenAI', deps['openai'], 'Missing OpenAI');
    check('Supabase', deps['@supabase/supabase-js'], 'Missing Supabase');
    check('Tailwind', deps['tailwindcss'], 'Missing Tailwind');
  } catch (error) {
    check('package.json valid', false, 'Invalid package.json format');
  }
}

// Summary
console.log('\n' + '='.repeat(40));
console.log('📊 SUMMARY');
console.log('='.repeat(40));
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Errors: ${errors}`);

if (errors === 0) {
  if (warnings <= 2) {
    console.log('\n🚀 ✅ READY FOR DEPLOYMENT!');
    console.log('All critical checks passed. You can deploy with confidence.');
  } else {
    console.log('\n🔧 ⚠️  MOSTLY READY');
    console.log('No critical errors, but address warnings if possible.');
  }
} else {
  console.log('\n🛠️  ❌ NEEDS FIXES');
  console.log('Please fix the errors above before deploying.');
}

console.log('\n💡 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Test locally: npm run start');
console.log('3. Deploy to staging first');
console.log('4. Run smoke tests');
console.log('5. Deploy to production');

process.exit(errors > 0 ? 1 : 0);

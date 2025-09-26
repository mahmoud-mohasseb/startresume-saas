#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting cleanup of unused files...\n');

// List of unused components to remove
const unusedComponents = [
  'components/UsageInsights.tsx',
  'components/CreditsWidget.tsx', 
  'components/FloatingCreditWidget.tsx',
  'components/GlobalCreditsDisplay.tsx',
  'components/UnifiedCreditWidget.tsx',
  'components/SimpleFloatingWidget.tsx',
  'components/FeatureGuard.tsx',
  'components/SimpleFeatureGuard.tsx',
  'components/CreditGuard.tsx',
  'components/SubscriptionDebug.tsx',
  'components/subscription-guard.tsx'
];

// List of unused pages/directories to remove
const unusedPages = [
  'app/dashboard/test-credits',
  'app/dashboard/test-subscription',
  'app/api/test',
  'app/api/debug',
  'app/api/emergency-credits',
  'app/api/test-credits'
];

// List of legacy API routes to remove
const legacyRoutes = [
  'app/api/credits/route.ts',
  'app/api/user/subscription/route.ts',
  'app/api/templates/route.ts',
  'lib/unified-credit-system.ts'
];

function removeFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed file: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🗑️  Removing unused components...');
  unusedComponents.forEach(removeFile);
  
  console.log('\n🗑️  Removing unused pages...');
  unusedPages.forEach(removeFile);
  
  console.log('\n🗑️  Removing legacy API routes...');
  legacyRoutes.forEach(removeFile);
  
  console.log('\n✨ Cleanup completed!');
  console.log('\n📊 Summary:');
  console.log(`- ${unusedComponents.length} unused components removed`);
  console.log(`- ${unusedPages.length} unused pages removed`);
  console.log(`- ${legacyRoutes.length} legacy routes removed`);
  
  console.log('\n🎯 Next steps:');
  console.log('1. Run: npm run build (to verify no broken imports)');
  console.log('2. Run: npm run test (to run the test suite)');
  console.log('3. Commit changes to git');
}

if (require.main === module) {
  main();
}

module.exports = { removeFile, unusedComponents, unusedPages, legacyRoutes };

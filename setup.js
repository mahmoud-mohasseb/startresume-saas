#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Resume SaaS Platform...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please copy .env.example to .env.local and fill in your environment variables.\n');
  process.exit(1);
}

// Install Puppeteer Chrome browser
console.log('📦 Installing Puppeteer Chrome browser...');
try {
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
  console.log('✅ Puppeteer Chrome browser installed successfully\n');
} catch (error) {
  console.log('⚠️  Warning: Could not install Puppeteer Chrome browser');
  console.log('You may need to run: npx puppeteer browsers install chrome\n');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 20) {
  console.log('⚠️  Warning: You are using Node.js ' + nodeVersion);
  console.log('Node.js 20 or later is recommended for better compatibility with Supabase.\n');
}

// Database setup instructions
console.log('🗄️  Database Setup Required:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Run the SQL schema from lib/database-schema.sql');
console.log('4. Create storage buckets:');
console.log('   - resume-exports (private)');
console.log('   - profile-pictures (private)');
console.log('   - cover-letter-exports (private)\n');

// Environment variables check
console.log('🔧 Environment Variables Check:');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

const envContent = fs.readFileSync(envPath, 'utf8');
const missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!envContent.includes(varName + '=') || envContent.includes(varName + '=your_')) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('❌ Missing or incomplete environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\nPlease update your .env.local file with the correct values.\n');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Final instructions
console.log('🎉 Setup Complete!');
console.log('\nNext steps:');
console.log('1. Ensure your Supabase database schema is created');
console.log('2. Run: npm run dev');
console.log('3. Visit http://localhost:3000 to test your application\n');

console.log('📚 Troubleshooting:');
console.log('- PDF Export Issues: Run "npx puppeteer browsers install chrome"');
console.log('- Database Issues: Check your Supabase connection and schema');
console.log('- DOCX Export: Now uses the docx library instead of html-docx-js\n');

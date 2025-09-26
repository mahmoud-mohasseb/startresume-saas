import { supabaseAdmin } from './supabase';
import { getUserSubscription, consumeCredits, CREDIT_COSTS } from './credits';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Test database connectivity and basic operations
 */
async function testDatabaseConnectivity(): Promise<TestResult[]> {
  const tests: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count(*)')
      .limit(1);

    tests.push({
      name: 'Database Connection',
      status: error ? 'fail' : 'pass',
      message: error ? `Connection failed: ${error.message}` : 'Database connected successfully',
      duration: Date.now() - startTime
    });

    // Test table existence
    const tables = ['users', 'resumes', 'subscriptions', 'templates', 'analytics_events'];
    for (const table of tables) {
      const tableStartTime = Date.now();
      const { error: tableError } = await supabaseAdmin
        .from(table)
        .select('count(*)')
        .limit(1);

      tests.push({
        name: `Table: ${table}`,
        status: tableError ? 'fail' : 'pass',
        message: tableError ? `Table error: ${tableError.message}` : `Table ${table} accessible`,
        duration: Date.now() - tableStartTime
      });
    }

  } catch (error) {
    tests.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Database connection failed: ${error}`,
      duration: Date.now() - startTime
    });
  }

  return tests;
}

/**
 * Test API endpoints
 */
async function testAPIEndpoints(): Promise<TestResult[]> {
  const tests: TestResult[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const endpoints = [
    { path: '/api/salary-research', method: 'GET' },
    { path: '/api/webhooks/stripe', method: 'GET' },
    { path: '/api/create-checkout-session', method: 'POST', requiresAuth: true },
    { path: '/api/resumes', method: 'GET', requiresAuth: true },
    { path: '/api/generate-resume', method: 'POST', requiresAuth: true },
    { path: '/api/export/pdf', method: 'POST', requiresAuth: true },
    { path: '/api/openai/suggestions', method: 'POST', requiresAuth: true },
  ];

  for (const endpoint of endpoints) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(endpoint.method === 'POST' && {
          body: JSON.stringify({ test: true })
        })
      });

      const isSuccess = response.status < 500; // Allow 4xx for auth-required endpoints
      
      tests.push({
        name: `${endpoint.method} ${endpoint.path}`,
        status: isSuccess ? 'pass' : 'fail',
        message: `Status: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        },
        duration: Date.now() - startTime
      });

    } catch (error) {
      tests.push({
        name: `${endpoint.method} ${endpoint.path}`,
        status: 'fail',
        message: `Request failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  return tests;
}

/**
 * Test credit system functionality
 */
async function testCreditSystem(): Promise<TestResult[]> {
  const tests: TestResult[] = [];
  const testUserId = 'test-user-' + Date.now();

  try {
    // Test getUserSubscription with non-existent user
    const startTime = Date.now();
    const subscription = await getUserSubscription(testUserId);
    
    tests.push({
      name: 'Get Non-existent Subscription',
      status: subscription === null ? 'pass' : 'fail',
      message: subscription === null ? 'Correctly returned null for non-existent user' : 'Should return null for non-existent user',
      duration: Date.now() - startTime
    });

    // Test credit costs configuration
    const creditCostTests = Object.entries(CREDIT_COSTS);
    for (const [action, cost] of creditCostTests) {
      tests.push({
        name: `Credit Cost: ${action}`,
        status: typeof cost === 'number' && cost >= 0 ? 'pass' : 'fail',
        message: `Cost: ${cost} credits`,
        details: { action, cost }
      });
    }

  } catch (error) {
    tests.push({
      name: 'Credit System Test',
      status: 'fail',
      message: `Credit system test failed: ${error}`,
    });
  }

  return tests;
}

/**
 * Test environment variables
 */
async function testEnvironmentVariables(): Promise<TestResult[]> {
  const tests: TestResult[] = [];

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    const isSet = !!value;
    const isValid = value && value.length > 10 && !value.includes('your_') && !value.includes('sk_test_your');

    tests.push({
      name: `Environment Variable: ${envVar}`,
      status: isSet && isValid ? 'pass' : isSet ? 'warning' : 'fail',
      message: !isSet ? 'Not set' : !isValid ? 'Set but appears to be placeholder' : 'Configured correctly',
      details: {
        isSet,
        length: value?.length || 0,
        prefix: value?.substring(0, 10) + '...'
      }
    });
  }

  return tests;
}

/**
 * Test Stripe integration
 */
async function testStripeIntegration(): Promise<TestResult[]> {
  const tests: TestResult[] = [];

  try {
    // Test Stripe configuration
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    tests.push({
      name: 'Stripe Secret Key',
      status: stripeSecretKey && stripeSecretKey.startsWith('sk_') ? 'pass' : 'fail',
      message: stripeSecretKey ? 'Stripe secret key configured' : 'Stripe secret key missing'
    });

    tests.push({
      name: 'Stripe Webhook Secret',
      status: webhookSecret && webhookSecret.startsWith('whsec_') ? 'pass' : 'fail',
      message: webhookSecret ? 'Webhook secret configured' : 'Webhook secret missing'
    });

    // Test price IDs
    const priceIds = [
      'STRIPE_BASIC_PRICE_ID',
      'STRIPE_STANDARD_PRICE_ID', 
      'STRIPE_PRO_PRICE_ID'
    ];

    for (const priceIdEnv of priceIds) {
      const priceId = process.env[priceIdEnv];
      tests.push({
        name: `Price ID: ${priceIdEnv}`,
        status: priceId && priceId.startsWith('price_') ? 'pass' : 'warning',
        message: priceId ? 'Price ID configured' : 'Price ID not configured'
      });
    }

  } catch (error) {
    tests.push({
      name: 'Stripe Integration',
      status: 'fail',
      message: `Stripe test failed: ${error}`
    });
  }

  return tests;
}

/**
 * Test OpenAI integration
 */
async function testOpenAIIntegration(): Promise<TestResult[]> {
  const tests: TestResult[] = [];

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    tests.push({
      name: 'OpenAI API Key',
      status: apiKey && apiKey.startsWith('sk-') ? 'pass' : 'fail',
      message: apiKey ? 'OpenAI API key configured' : 'OpenAI API key missing'
    });

    // Test basic OpenAI connectivity (optional - costs credits)
    if (apiKey && process.env.NODE_ENV !== 'production') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        tests.push({
          name: 'OpenAI API Connectivity',
          status: response.ok ? 'pass' : 'fail',
          message: response.ok ? 'OpenAI API accessible' : `API error: ${response.status}`,
          details: { status: response.status }
        });
      } catch (error) {
        tests.push({
          name: 'OpenAI API Connectivity',
          status: 'warning',
          message: `Could not test API connectivity: ${error}`
        });
      }
    }

  } catch (error) {
    tests.push({
      name: 'OpenAI Integration',
      status: 'fail',
      message: `OpenAI test failed: ${error}`
    });
  }

  return tests;
}

/**
 * Run comprehensive test suite
 */
export async function runFullTestSuite(): Promise<{
  suites: TestSuite[];
  overall: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    duration: number;
  };
}> {
  const startTime = Date.now();
  console.log('🧪 Starting comprehensive test suite...');

  const testSuites = [
    {
      name: 'Database Connectivity',
      testFunction: testDatabaseConnectivity
    },
    {
      name: 'API Endpoints',
      testFunction: testAPIEndpoints
    },
    {
      name: 'Credit System',
      testFunction: testCreditSystem
    },
    {
      name: 'Environment Variables',
      testFunction: testEnvironmentVariables
    },
    {
      name: 'Stripe Integration',
      testFunction: testStripeIntegration
    },
    {
      name: 'OpenAI Integration',
      testFunction: testOpenAIIntegration
    }
  ];

  const suites: TestSuite[] = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;

  for (const suite of testSuites) {
    console.log(`🔍 Running ${suite.name} tests...`);
    
    try {
      const tests = await suite.testFunction();
      const passed = tests.filter(t => t.status === 'pass').length;
      const failed = tests.filter(t => t.status === 'fail').length;
      const warnings = tests.filter(t => t.status === 'warning').length;

      suites.push({
        name: suite.name,
        tests,
        summary: {
          total: tests.length,
          passed,
          failed,
          warnings
        }
      });

      totalTests += tests.length;
      totalPassed += passed;
      totalFailed += failed;
      totalWarnings += warnings;

      console.log(`✅ ${suite.name}: ${passed}/${tests.length} passed`);
    } catch (error) {
      console.error(`❌ ${suite.name} failed:`, error);
      
      suites.push({
        name: suite.name,
        tests: [{
          name: 'Suite Execution',
          status: 'fail',
          message: `Suite failed to execute: ${error}`
        }],
        summary: {
          total: 1,
          passed: 0,
          failed: 1,
          warnings: 0
        }
      });

      totalTests += 1;
      totalFailed += 1;
    }
  }

  const duration = Date.now() - startTime;
  
  console.log(`🏁 Test suite completed in ${duration}ms`);
  console.log(`📊 Results: ${totalPassed}/${totalTests} passed, ${totalFailed} failed, ${totalWarnings} warnings`);

  return {
    suites,
    overall: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      warnings: totalWarnings,
      duration
    }
  };
}

/**
 * Generate test report
 */
export function generateTestReport(results: Awaited<ReturnType<typeof runFullTestSuite>>): string {
  const { suites, overall } = results;
  
  let report = `# Website Test Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Duration:** ${overall.duration}ms\n\n`;
  
  report += `## Overall Summary\n`;
  report += `- **Total Tests:** ${overall.total}\n`;
  report += `- **Passed:** ${overall.passed} ✅\n`;
  report += `- **Failed:** ${overall.failed} ❌\n`;
  report += `- **Warnings:** ${overall.warnings} ⚠️\n\n`;
  
  for (const suite of suites) {
    report += `## ${suite.name}\n`;
    report += `**Summary:** ${suite.summary.passed}/${suite.summary.total} passed\n\n`;
    
    for (const test of suite.tests) {
      const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
      report += `${icon} **${test.name}**: ${test.message}`;
      if (test.duration) {
        report += ` (${test.duration}ms)`;
      }
      report += '\n';
      
      if (test.details) {
        report += `   - Details: ${JSON.stringify(test.details, null, 2)}\n`;
      }
    }
    report += '\n';
  }
  
  return report;
}

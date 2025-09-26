import { NextRequest, NextResponse } from 'next/server';
import { runFullTestSuite, generateTestReport } from '@/lib/test-suite';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting comprehensive website test suite...');
    
    const results = await runFullTestSuite();
    const report = generateTestReport(results);
    
    // Return both JSON data and markdown report
    return NextResponse.json({
      success: true,
      results,
      report,
      timestamp: new Date().toISOString(),
      summary: {
        status: results.overall.failed === 0 ? 'healthy' : 'issues_detected',
        message: results.overall.failed === 0 
          ? 'All systems operational' 
          : `${results.overall.failed} issues detected`,
        ...results.overall
      }
    });

  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test suite execution failed',
      message: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { suite } = await request.json();
    
    // Allow running specific test suites
    if (suite) {
      // This would run only a specific test suite
      // Implementation depends on specific requirements
      return NextResponse.json({
        message: 'Specific test suite execution not yet implemented',
        availableSuites: [
          'database',
          'api',
          'credits',
          'environment',
          'stripe',
          'openai'
        ]
      });
    }
    
    // Run full suite by default
    const results = await runFullTestSuite();
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test suite POST failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test execution failed',
      message: String(error)
    }, { status: 500 });
  }
}

// Test suite utilities for API testing
export interface TestResult {
  name: string
  success: boolean
  message: string
  duration: number
  data?: any
}

export interface TestSuite {
  name: string
  tests: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
}

export class APITestRunner {
  private tests: Array<() => Promise<TestResult>> = []
  private suiteName: string

  constructor(suiteName: string) {
    this.suiteName = suiteName
  }

  addTest(name: string, testFn: () => Promise<any>): void {
    this.tests.push(async () => {
      const startTime = Date.now()
      try {
        const result = await testFn()
        const duration = Date.now() - startTime
        return {
          name,
          success: true,
          message: 'Test passed',
          duration,
          data: result
        }
      } catch (error) {
        const duration = Date.now() - startTime
        return {
          name,
          success: false,
          message: error instanceof Error ? error.message : 'Test failed',
          duration
        }
      }
    })
  }

  async run(): Promise<TestSuite> {
    const results: TestResult[] = []
    
    for (const test of this.tests) {
      const result = await test()
      results.push(result)
    }

    const passedTests = results.filter(r => r.success).length
    const failedTests = results.filter(r => !r.success).length
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

    return {
      name: this.suiteName,
      tests: results,
      totalTests: results.length,
      passedTests,
      failedTests,
      totalDuration
    }
  }
}

// Common test utilities
export async function testAPIEndpoint(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; data: any; headers: Headers }> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  let data
  try {
    data = await response.json()
  } catch {
    data = await response.text()
  }

  return {
    status: response.status,
    data,
    headers: response.headers
  }
}

export function createMockUser() {
  return {
    id: 'test_user_' + Date.now(),
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  }
}

export function createMockSubscription(plan: string = 'basic') {
  const plans = {
    free: { credits: 3, name: 'Free' },
    basic: { credits: 10, name: 'Basic' },
    standard: { credits: 50, name: 'Standard' },
    pro: { credits: 200, name: 'Pro' }
  }

  const planData = plans[plan as keyof typeof plans] || plans.basic

  return {
    plan,
    planName: planData.name,
    credits: planData.credits,
    usedCredits: 0,
    remainingCredits: planData.credits,
    isActive: true,
    status: 'active'
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateTestData(count: number = 10) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Test Item ${i + 1}`,
    value: Math.random() * 100,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString()
  }))
}

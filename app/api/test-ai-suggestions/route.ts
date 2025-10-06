import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧪 Testing AI suggestions API...')

    // Test the AI suggestions endpoint
    const testData = {
      step: 2,
      focusArea: 'summary',
      resumeData: {
        personalInfo: {
          name: 'Test User',
          title: 'Software Developer'
        },
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [
          {
            position: 'Frontend Developer',
            company: 'Tech Company',
            description: 'Developed web applications'
          }
        ]
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/openai/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || ''
      },
      body: JSON.stringify(testData)
    })

    const data = await response.json()

    console.log('🧪 AI suggestions test result:', {
      status: response.status,
      success: data.success,
      suggestionsCount: data.suggestions?.length || 0,
      error: data.error
    })

    return NextResponse.json({
      test: 'AI Suggestions API Test',
      status: response.status,
      success: data.success,
      suggestionsReceived: data.suggestions?.length || 0,
      data: data,
      message: response.ok ? 'AI suggestions working!' : 'AI suggestions failed',
      recommendations: [
        response.ok ? '✅ AI suggestions API is working' : '❌ AI suggestions API failed',
        data.suggestions?.length > 0 ? '✅ Suggestions generated successfully' : '❌ No suggestions generated',
        'Test completed'
      ]
    })

  } catch (error) {
    console.error('❌ AI suggestions test failed:', error)
    return NextResponse.json({
      test: 'AI Suggestions API Test',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test failed'
    }, { status: 500 })
  }
}

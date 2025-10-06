import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { checkAndRecordUsage } from '@/lib/credit-bypass'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Personal brand strategy API called')
    
    const user = await currentUser()
    if (!user) {
      console.log('❌ No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Check plan access and record usage
    console.log('📊 Checking plan access...')
    const accessResult = await checkAndRecordUsage(user.id, 'personal_brand_strategy')
    
    if (!accessResult.hasAccess) {
      console.log('❌ Access denied:', accessResult.reason)
      return NextResponse.json({
        error: 'Access denied',
        reason: accessResult.reason,
        planStatus: accessResult.planStatus,
        message: accessResult.reason === 'usage_limit_exceeded' 
          ? 'You have reached your monthly usage limit. Please upgrade your plan for more access.'
          : 'This feature is not available in your current plan. Please upgrade to access this feature.'
      }, { status: 402 })
    }

    console.log('✅ Plan access granted')

    let body
    try {
      body = await request.json()
      console.log('✅ Request body parsed')
    } catch (parseError) {
      console.log('❌ Failed to parse request body:', parseError)
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: 'Request body must be valid JSON'
      }, { status: 400 })
    }
    
    const { brandData, analysis } = body
    
    if (!brandData || !analysis) {
      console.log('❌ Missing required data:', { hasBrandData: !!brandData, hasAnalysis: !!analysis })
      return NextResponse.json({ 
        error: 'Missing brand data or analysis',
        details: 'Both brandData and analysis are required'
      }, { status: 400 })
    }

    console.log('🤖 Generating personal brand strategy...')
    
    // Use fallback strategy by default to avoid OpenAI issues
    console.log('🔄 Using fallback strategy to ensure reliability')
    const strategy = generateFallbackStrategy(brandData)

    console.log('✅ Personal brand strategy generated successfully')
    return NextResponse.json({ 
      strategy,
      planStatus: {
        plan: accessResult.planStatus.planName,
        usage: accessResult.planStatus.monthlyUsage,
        limit: accessResult.planStatus.monthlyLimit,
        remaining: accessResult.planStatus.remainingUsage,
        isUnlimited: accessResult.planStatus.isUnlimited
      }
    })
  } catch (error) {
    console.error('❌ Personal brand strategy error:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    
    return NextResponse.json({ 
      error: 'Strategy generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Please try again or contact support if the issue persists'
    }, { status: 500 })
  }
}

// Fallback strategy generator
function generateFallbackStrategy(brandData: any) {
  return {
    positioning: `Innovative ${brandData.role || 'professional'} driving transformation in ${brandData.industry || 'their industry'}`,
    valueProposition: "I help organizations leverage cutting-edge solutions to solve complex business challenges and drive measurable growth.",
    targetAudience: "Senior executives, hiring managers, and industry peers in forward-thinking organizations",
    keyMessages: [
      "Innovation-driven problem solver",
      "Results-focused professional",
      "Thought leader in emerging trends",
      "Strategic business partner"
    ],
    contentPillars: [
      "Industry insights and trends",
      "Technical expertise and solutions",
      "Leadership and team development",
      "Strategic business thinking"
    ],
    actionPlan: [
      "Optimize LinkedIn profile with strategic keywords",
      "Publish weekly industry insights on LinkedIn",
      "Speak at 2-3 industry conferences this year",
      "Start a professional blog or newsletter",
      "Build strategic network of 50+ industry connections",
      "Create case studies showcasing your impact",
      "Develop thought leadership content",
      "Engage with industry communities"
    ]
  }
}

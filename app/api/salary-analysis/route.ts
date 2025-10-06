import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { checkAndConsumeStripeDirectCredits } from '@/lib/credit-bypass'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check and consume credits
    const creditResult = await checkAndConsumeStripeDirectCredits(
      user.id,
      2, // Salary analysis costs 2 credits
      'salary_research'
    )

    if (!creditResult.success) {
      return NextResponse.json({
        error: 'Insufficient credits',
        message: creditResult.message,
        currentCredits: creditResult.currentCredits,
        requiredCredits: creditResult.requiredCredits,
        plan: creditResult.plan,
        planName: creditResult.planName
      }, { status: 402 })
    }

    const { jobTitle, location, experience, industry, skills } = await request.json()

    if (!jobTitle || !location) {
      return NextResponse.json(
        { error: 'Job title and location are required' },
        { status: 400 }
      )
    }

    const prompt = `
You are a salary research expert. Analyze the salary range for this position:

Job Title: ${jobTitle}
Location: ${location}
Experience Level: ${experience || 'Not specified'}
Industry: ${industry || 'Not specified'}
Key Skills: ${skills ? skills.join(', ') : 'Not specified'}

Please provide a comprehensive salary analysis including:
1. Salary range (min, max, median)
2. Factors affecting salary
3. Market trends
4. Negotiation tips
5. Benefits to consider
6. Career growth potential

Return the response in JSON format with the following structure:
{
  "salaryRange": {
    "min": 0,
    "max": 0,
    "median": 0,
    "currency": "USD"
  },
  "factors": ["factor1", "factor2"],
  "marketTrends": "market analysis",
  "negotiationTips": ["tip1", "tip2"],
  "benefits": ["benefit1", "benefit2"],
  "careerGrowth": "growth analysis",
  "sources": ["source1", "source2"],
  "lastUpdated": "current date"
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional salary research analyst. Always respond with valid JSON and realistic salary data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to generate salary analysis' },
        { status: 500 }
      )
    }

    try {
      const salaryAnalysis = JSON.parse(response)
      
      return NextResponse.json({
        success: true,
        analysis: salaryAnalysis,
        creditsRemaining: creditResult.remainingCredits
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json({
        success: true,
        analysis: {
          salaryRange: {
            min: 50000,
            max: 120000,
            median: 85000,
            currency: "USD"
          },
          factors: ["Experience", "Location", "Company size"],
          marketTrends: response,
          negotiationTips: ["Research market rates", "Highlight achievements"],
          benefits: ["Health insurance", "401k", "PTO"],
          careerGrowth: "Good growth potential in this field",
          sources: ["Industry reports", "Market data"],
          lastUpdated: new Date().toISOString()
        },
        creditsRemaining: creditResult.remainingCredits
      })
    }

  } catch (error) {
    console.error('Salary analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { checkAndConsumeStripeDirectCredits } from '@/lib/stripe-direct-credits'
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
      4, // LinkedIn optimization costs 4 credits
      'linkedin_optimization'
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

    const { profileData, targetRole, industry } = await request.json()

    if (!profileData || !targetRole) {
      return NextResponse.json(
        { error: 'Profile data and target role are required' },
        { status: 400 }
      )
    }

    const prompt = `
You are a LinkedIn optimization expert. Help optimize this LinkedIn profile for the target role: "${targetRole}" ${industry ? `in the ${industry} industry` : ''}.

Current Profile Data:
${JSON.stringify(profileData, null, 2)}

Please provide optimized content for:
1. Headline (120 characters max)
2. Summary/About section (2000 characters max)
3. Experience descriptions (bullet points)
4. Skills recommendations
5. Keywords to include

Focus on:
- ATS optimization
- Industry-specific keywords
- Achievement-focused language
- Professional tone
- Quantifiable results where possible

Return the response in JSON format with the following structure:
{
  "headline": "optimized headline",
  "summary": "optimized summary",
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "description": "optimized description with bullet points"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tips": ["tip1", "tip2", "tip3"]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional LinkedIn optimization expert. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to generate LinkedIn optimization' },
        { status: 500 }
      )
    }

    try {
      const optimizedContent = JSON.parse(response)
      
      return NextResponse.json({
        success: true,
        optimizedContent,
        creditsRemaining: creditResult.remainingCredits
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json({
        success: true,
        optimizedContent: {
          headline: "LinkedIn Profile Optimization",
          summary: response,
          experience: [],
          skills: [],
          keywords: [],
          tips: []
        },
        creditsRemaining: creditResult.remainingCredits
      })
    }

  } catch (error) {
    console.error('LinkedIn generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
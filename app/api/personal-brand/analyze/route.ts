import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandData = await request.json()
    
    const prompt = `
    Analyze this personal brand profile and provide a comprehensive SWOT analysis:

    Industry: ${brandData.industry}
    Role: ${brandData.role}
    Goals: ${brandData.goals}
    Strengths: ${brandData.strengths}
    
    Provide analysis in this JSON format:
    {
      "brandScore": number (0-100),
      "strengths": ["strength1", "strength2", "strength3"],
      "weaknesses": ["weakness1", "weakness2"],
      "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
      "threats": ["threat1", "threat2"]
    }
    
    Focus on actionable insights for career growth and personal branding.
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a personal branding expert and career strategist. Provide detailed, actionable analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
    })

    const analysisText = completion.choices[0].message.content
    let analysis

    try {
      analysis = JSON.parse(analysisText || '{}')
    } catch (parseError) {
      // Fallback analysis if AI response isn't valid JSON
      analysis = {
        brandScore: 75,
        strengths: [
          "Strong technical expertise in your field",
          "Clear career direction and goals",
          "Self-awareness of personal strengths"
        ],
        weaknesses: [
          "May need stronger online presence",
          "Could benefit from more networking"
        ],
        opportunities: [
          "Growing demand in your industry",
          "Potential for thought leadership",
          "Opportunities for skill development"
        ],
        threats: [
          "Increasing competition in the field",
          "Rapid technological changes"
        ]
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error analyzing brand:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

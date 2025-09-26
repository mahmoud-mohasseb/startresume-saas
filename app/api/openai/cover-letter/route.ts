import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { createCreditsProtectedHandler } from '@/lib/credit-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

async function handleCoverLetterGeneration(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobTitle, jobDescription, userInfo } = body

    if (!jobTitle) {
      return NextResponse.json({ 
        error: 'Job title is required' 
      }, { status: 400 })
    }

    const prompt = `Generate a professional cover letter for the following:
    
Job Title: ${jobTitle}
Job Description: ${jobDescription || 'Not provided'}

User Information:
- Name: ${userInfo?.name || 'Professional'}
- Experience: ${userInfo?.experience || 'Relevant experience'}
- Skills: ${userInfo?.skills || 'Professional skills'}

Create a compelling, personalized cover letter that:
1. Shows enthusiasm for the specific role
2. Highlights relevant experience and skills
3. Demonstrates knowledge of the company/role
4. Uses professional tone and formatting
5. Is concise but impactful (3-4 paragraphs)

Format as clean HTML with proper paragraph tags.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor and professional writer specializing in cover letters. Create compelling, personalized cover letters that help candidates stand out."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const coverLetter = completion.choices[0]?.message?.content

    if (!coverLetter) {
      return NextResponse.json({ 
        error: 'Failed to generate cover letter' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      coverLetter: coverLetter.trim(),
      usage: completion.usage 
    })

  } catch (error) {
    console.error('Cover letter generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate cover letter' 
    }, { status: 500 })
  }
}

// Export the credits-protected handler
export const POST = createCreditsProtectedHandler('cover_letter_generation', handleCoverLetterGeneration)

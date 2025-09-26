import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { checkAndRecordUsage } from '@/lib/plan-based-access'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📝 Cover letter generation: Checking plan access for user:', user.id)

    // Check plan access and record usage
    const accessResult = await checkAndRecordUsage(user.id, 'cover_letter_generation')
    
    if (!accessResult.success) {
      console.log('❌ Plan access denied:', accessResult.message)
      return NextResponse.json({
        error: 'Plan access denied',
        message: accessResult.message,
        planStatus: {
          plan: accessResult.planStatus.planName,
          usage: accessResult.planStatus.monthlyUsage,
          limit: accessResult.planStatus.monthlyLimit,
          remaining: accessResult.planStatus.remainingUsage,
          isUnlimited: accessResult.planStatus.isUnlimited
        }
      }, { status: 402 })
    }

    console.log('✅ Plan access granted. Usage recorded.')

    const body = await request.json()
    const { personalInfo, jobTitle, companyName, jobDescription, userInfo } = body

    // Generate cover letter
    const prompt = `Generate a professional cover letter for the following:

Job Title: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription || 'Not provided'}

Personal Information:
${JSON.stringify(personalInfo || userInfo, null, 2)}

Requirements:
1. Create a professional, personalized cover letter
2. Address it to the hiring manager or "Dear Hiring Manager"
3. Highlight relevant skills and experience
4. Show enthusiasm for the role and company
5. Keep it concise (3-4 paragraphs)
6. Return ONLY clean, readable text - NO HTML tags
7. Format as a proper business letter with proper spacing

Return only the letter content as plain text, no additional formatting.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional career coach. Generate clean, readable cover letters without any HTML formatting. Return only plain text that can be directly used in a text editor."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const coverLetterText = completion.choices[0]?.message?.content || ''
    
    return NextResponse.json({
      success: true,
      html: coverLetterText,
      message: 'Cover letter generated successfully!',
      planStatus: {
        plan: accessResult.planStatus.planName,
        usage: accessResult.planStatus.monthlyUsage,
        limit: accessResult.planStatus.monthlyLimit,
        remaining: accessResult.planStatus.remainingUsage,
        isUnlimited: accessResult.planStatus.isUnlimited
      }
    })

  } catch (error) {
    console.error('Error generating cover letter:', error)
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 })
  }
}

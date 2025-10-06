import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { checkAndConsumeStripeDirectCredits } from '@/lib/credit-bypass'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(' Mock interview: Checking and consuming Stripe-direct credits for user:', user.id)

    // Check and consume credits in one operation
    const creditResult = await checkAndConsumeStripeDirectCredits(user.id, 6, 'mock_interview')
    
    if (!creditResult.success) {
      console.log(' Insufficient credits or consumption failed:', creditResult)
      return NextResponse.json({
        error: 'Insufficient credits for mock interview',
        creditsRemaining: creditResult.remainingCredits,
        creditsRequired: 6,
        plan: creditResult.plan,
        planName: creditResult.planName
      }, { status: 402 })
    }

    const body = await request.json()
    const { action, jobTitle, jobDescription, question, answer, experienceLevel, resumeData } = body

    if (action === 'generate-questions') {
      return await generateQuestions(jobTitle, jobDescription, experienceLevel, resumeData, creditResult)
    } else if (action === 'provide-feedback') {
      return await provideFeedback(question, answer, jobTitle, experienceLevel, resumeData, creditResult)
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "generate-questions" or "provide-feedback"' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('OpenAI mock interview error:', error)
    return NextResponse.json(
      { error: 'Failed to process mock interview request. Please try again.' },
      { status: 500 }
    )
  }
}

async function generateQuestions(jobTitle: string, jobDescription?: string, experienceLevel?: string, resumeData?: any, creditResult?: any) {
  if (!jobTitle) {
    return NextResponse.json({ 
      error: 'Job title is required' 
    }, { status: 400 })
  }

  // Analyze user's experience level from resume data
  const userContext = analyzeUserExperience(resumeData, experienceLevel)
  
  const prompt = `Generate 30 comprehensive, challenging interview questions for the following position:

Job Title: ${jobTitle}
Job Description: ${jobDescription || 'Not provided'}
Experience Level: ${experienceLevel || 'Not provided'}
User Context: ${JSON.stringify(userContext, null, 2)}
Resume Data: ${JSON.stringify(resumeData, null, 2)}

Requirements:
1. Create exactly 30 diverse, challenging interview questions
2. Tailor complexity to the candidate's experience level:
   - Entry Level (0-2 years): Focus on fundamentals, learning ability, potential
   - Mid Level (3-7 years): Technical depth, project leadership, problem-solving
   - Senior Level (8+ years): Architecture, mentoring, strategic thinking, complex scenarios
3. Include a balanced mix of question types:
   - 5 Interview Setup questions (preparation, expectations, logistics)
   - 5 Position-related questions (role understanding, responsibilities, requirements)
   - 6 Technical/Skills-based questions (specific to role and resume)
   - 5 Behavioral questions (STAR method scenarios)
   - 4 Situational/Problem-solving questions
   - 3 Leadership/Teamwork questions
   - 2 Strategic/Vision questions (for senior roles)
4. Reference specific skills, projects, or experiences from their resume when possible
5. Make questions progressively challenging throughout the set
6. Include industry-specific scenarios and current trends
7. Test both hard skills and soft skills comprehensively

Question Categories and Focus Areas:
- Interview Setup: Preparation strategies, expectations, logistics, first impressions
- Position Understanding: Role clarity, responsibilities, requirements, expectations
- Technical Mastery: Deep dive into claimed skills and technologies
- Project Experience: Specific challenges from their background
- Problem-Solving: Complex scenarios requiring analytical thinking
- Leadership: Team management and influence (adjust for experience level)
- Communication: Explaining complex concepts and stakeholder management
- Adaptability: Handling change and learning new technologies
- Cultural Fit: Values alignment and work style preferences

Interview Setup Questions should cover:
- How to research the company and role effectively
- What questions to ask the interviewer
- How to present yourself professionally
- Understanding interview formats and expectations
- Preparation strategies for different interview types
- How to handle interview logistics and timing
- Making strong first impressions
- Follow-up best practices

Position-related Questions should cover:
- Understanding of the specific role and its responsibilities
- Knowledge of key requirements and qualifications
- Awareness of daily tasks and long-term objectives
- Understanding of how the position fits within the organization
- Knowledge of industry standards and best practices for the role
- Expectations for performance and success metrics
- Understanding of career progression and growth opportunities
- Awareness of challenges and opportunities in the position

Return the questions as a JSON array with this structure:
[
  {
    "id": 1,
    "question": "Detailed, specific question text here",
    "type": "interview_setup|position|technical|behavioral|situational|leadership|strategic",
    "difficulty": "entry|intermediate|advanced",
    "focus": "Specific skill or competency being assessed",
    "category": "Interview Setup|Position Understanding|Technical Skills|Problem Solving|Leadership|Communication|Adaptability|Cultural Fit"
  }
]

Ensure questions are:
- Specific to the role and industry
- Challenging but fair for the experience level
- Designed to reveal depth of knowledge and experience
- Realistic scenarios they might face in the actual role
- Progressive in difficulty to build confidence then challenge

Return only valid JSON, no additional text.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a senior technical interviewer and executive recruiter with 15+ years of experience. You specialize in creating comprehensive, challenging interview questions that accurately assess a candidate's true capabilities and potential. Your questions should:

1. Be tailored to the candidate's actual experience level and background
2. Reference specific technologies, projects, or achievements from their resume
3. Test both technical depth and practical application
4. Include realistic scenarios they would face in the role
5. Progress from foundational concepts to advanced problem-solving
6. Assess leadership potential and cultural fit appropriately for their level

Focus on creating questions that reveal:
- Technical mastery and practical experience
- Problem-solving approach and analytical thinking
- Communication skills and ability to explain complex concepts
- Leadership potential and team collaboration
- Adaptability and continuous learning mindset
- Strategic thinking and business acumen (for senior roles)

Make each question count - they should be challenging, specific, and designed to differentiate between good and exceptional candidates.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 3000,
    temperature: 0.8,
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error('Failed to generate interview questions')
  }

  try {
    const questions = JSON.parse(content)
    return NextResponse.json({
      success: true,
      questions,
      totalQuestions: questions.length,
      userContext,
      usage: completion.usage,
      creditResult
    })
  } catch (parseError) {
    console.error('Failed to parse questions JSON:', parseError)
    return NextResponse.json(
      { error: 'Failed to generate properly formatted questions' },
      { status: 500 }
    )
  }
}

// Helper function to analyze user's experience level and context
function analyzeUserExperience(resumeData: any, experienceLevel?: string) {
  if (!resumeData) {
    return {
      level: experienceLevel || 'entry',
      yearsOfExperience: 0,
      keySkills: [],
      industries: [],
      hasLeadershipExperience: false,
      complexityLevel: 'basic'
    }
  }

  const experience = resumeData.experience || []
  const skills = resumeData.skills || []
  const education = resumeData.education || []

  // Calculate years of experience
  const yearsOfExperience = experience.reduce((total: number, exp: any) => {
    if (exp.duration) {
      const years = exp.duration.match(/(\d+)/)?.[0] || '0'
      return total + parseInt(years)
    }
    return total
  }, 0)

  // Determine experience level
  let level = 'entry'
  let complexityLevel = 'basic'
  
  if (yearsOfExperience >= 8) {
    level = 'senior'
    complexityLevel = 'advanced'
  } else if (yearsOfExperience >= 3) {
    level = 'mid'
    complexityLevel = 'intermediate'
  }

  // Check for leadership experience
  const hasLeadershipExperience = experience.some((exp: any) => 
    exp.position?.toLowerCase().includes('lead') ||
    exp.position?.toLowerCase().includes('manager') ||
    exp.position?.toLowerCase().includes('director') ||
    exp.position?.toLowerCase().includes('senior') ||
    exp.description?.toLowerCase().includes('team') ||
    exp.description?.toLowerCase().includes('mentor')
  )

  // Extract key skills and industries
  const keySkills = skills.slice(0, 10) // Top 10 skills
  const industries = experience.map((exp: any) => exp.company).filter(Boolean)

  return {
    level,
    yearsOfExperience,
    keySkills,
    industries,
    hasLeadershipExperience,
    complexityLevel,
    educationLevel: education.length > 0 ? 'degree' : 'no-degree',
    totalExperiences: experience.length
  }
}

async function provideFeedback(question: string, answer: string, jobTitle: string, experienceLevel?: string, resumeData?: any, creditResult?: any) {
  if (!question || !answer) {
    return NextResponse.json({ 
      error: 'Question and answer must be provided' 
    }, { status: 400 })
  }

  const prompt = `Provide professional interview feedback for the following Q&A session:

Job Title: ${jobTitle}
Experience Level: ${experienceLevel || 'Not provided'}
Resume Data: ${JSON.stringify(resumeData, null, 2)}

Question and Answer:
Q: ${question}
A: ${answer}

Requirements:
1. Provide constructive feedback for the answer
2. Rate the answer on a scale of 1-10
3. Highlight strengths and areas for improvement
4. Give specific suggestions for a better response
5. Provide an overall assessment and interview tips
6. Be encouraging but honest in your evaluation

Return feedback as JSON with this structure:
{
  "overallScore": number (1-10),
  "overallFeedback": "General assessment and tips",
  "questionFeedback": {
    "score": number (1-10),
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "suggestion": "Specific advice for better response"
  }
}

Return only valid JSON, no additional text.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an experienced interview coach and HR professional. Provide constructive, actionable feedback that helps candidates improve their interview performance."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 2000,
    temperature: 0.7,
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error('Failed to generate interview feedback')
  }

  try {
    const feedback = JSON.parse(content)
    return NextResponse.json({
      feedback: feedback.overallFeedback,
      score: feedback.overallScore,
      strengths: feedback.questionFeedback.strengths,
      improvements: feedback.questionFeedback.improvements,
      suggestion: feedback.questionFeedback.suggestion,
      creditResult
    })
  } catch (parseError) {
    console.error('Failed to parse feedback JSON:', parseError)
    return NextResponse.json(
      { error: 'Failed to generate properly formatted feedback' },
      { status: 500 }
    )
  }
}

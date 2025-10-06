import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkAndConsumeStripeDirectCredits } from '@/lib/credit-bypass'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const templatePrompts = {
  modern: `Create a modern, clean resume with a professional layout. Use contemporary design elements with clear sections and good typography. Focus on readability and visual hierarchy.`,
  executive: `Create an executive-level resume with a bold, authoritative design. Use strong typography and professional formatting suitable for senior leadership positions.`,
  creative: `Create a creative resume with unique design elements while maintaining professionalism. Use creative layouts and visual elements that showcase personality.`,
  minimal: `Create a minimal, elegant resume with clean lines and plenty of white space. Focus on simplicity and clarity with subtle design elements.`
}

export async function POST(request: Request) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🎯 Resume generation: Checking credits with bypass system')

    // Check credits using bypass system
    const creditResult = await checkAndConsumeStripeDirectCredits(user.id, 1, 'resume_generation')
    
    if (!creditResult.success) {
      console.log('❌ Credit check failed:', creditResult)
      return NextResponse.json({ 
        error: 'Insufficient credits',
        message: creditResult.message,
        requiredCredits: creditResult.requiredCredits,
        currentCredits: creditResult.currentCredits
      }, { status: 402 });
    }

    console.log('✅ Credits validated - proceeding with resume generation')

    const { resumeData, template, colorTheme, jobDescription } = await request.json()

    if (!resumeData || !resumeData.personalInfo?.fullName) {
      return NextResponse.json({ error: 'Missing required resume data' }, { status: 400 })
    }

    const templatePrompt = templatePrompts[template as keyof typeof templatePrompts] || templatePrompts.modern

    const systemPrompt = `You are an expert resume writer and web designer. Create a complete, professional HTML resume based on the provided information. 

Requirements:
- Generate complete HTML with inline CSS styling
- Use the color theme: ${colorTheme}
- ${templatePrompt}
- Make it ATS-friendly with proper structure
- Include all provided information in a logical order
- Use professional typography and spacing
- Make it print-friendly (single page if possible)
- Include proper semantic HTML structure

${jobDescription ? `IMPORTANT: Tailor the resume content to match this job description: ${jobDescription}. Emphasize relevant skills and experience that align with the job requirements.` : ''}

Return only the HTML code, no explanations or markdown formatting.`

    const userPrompt = `Create a professional resume for:

Personal Information:
- Name: ${resumeData.personalInfo.fullName}
- Email: ${resumeData.personalInfo.email}
- Phone: ${resumeData.personalInfo.phone}
- Location: ${resumeData.personalInfo.location}
- LinkedIn: ${resumeData.personalInfo.linkedin || ''}
- Website: ${resumeData.personalInfo.website || ''}

Professional Summary:
${resumeData.professionalSummary || 'Create a compelling professional summary based on the experience and skills provided.'}

Work Experience:
${resumeData.experience?.map((exp: any) => `
- ${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})
  Location: ${exp.location}
  Description: ${exp.description}
`).join('\n') || 'No work experience provided'}

Education:
${resumeData.education?.map((edu: any) => `
- ${edu.degree} in ${edu.fieldOfStudy} from ${edu.school} (${edu.graduationDate})
  ${edu.gpa ? `GPA: ${edu.gpa}` : ''}
`).join('\n') || 'No education provided'}

Skills:
${resumeData.skills?.join(', ') || 'No skills provided'}

${resumeData.certifications?.length ? `Certifications:
${resumeData.certifications.map((cert: any) => `- ${cert.name} (${cert.issuer}, ${cert.date})`).join('\n')}` : ''}

${resumeData.projects?.length ? `Projects:
${resumeData.projects.map((project: any) => `- ${project.name}: ${project.description}`).join('\n')}` : ''}

${resumeData.achievements?.length ? `Achievements:
${resumeData.achievements.join('\n- ')}` : ''}`

    console.log('🤖 Generating resume with OpenAI...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    })

    const generatedHTML = completion.choices[0]?.message?.content

    if (!generatedHTML) {
      console.error('❌ OpenAI failed to generate resume content')
      return NextResponse.json({ error: 'Failed to generate resume content' }, { status: 500 })
    }

    console.log('✅ Resume generated successfully')
    
    return NextResponse.json({ 
      html: generatedHTML,
      creditsRemaining: creditResult.remainingCredits,
      creditsUsed: 1, // Resume generation costs 1 credit
      plan: creditResult.plan,
      planName: creditResult.planName
    })

  } catch (error) {
    console.error('❌ Resume generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

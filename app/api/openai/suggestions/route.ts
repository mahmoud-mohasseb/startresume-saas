import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
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

    // Parse request body
    const requestBody = await request.json()
    const { step, focusArea, resumeData } = requestBody

    if (!step || !focusArea) {
      return NextResponse.json(
        { error: 'Step and focusArea are required' },
        { status: 400 }
      )
    }

    console.log('🤖 AI Suggestions request (FREE):', {
      user: user.emailAddresses[0]?.emailAddress,
      step: step,
      focusArea: focusArea,
      hasResumeData: !!resumeData
    })

    // Generate suggestions based on step and focus area (NO CREDIT CHECK)
    const suggestions = await generateAISuggestions(step, focusArea, resumeData)

    console.log('✅ Generated suggestions (FREE):', suggestions.length)

    return NextResponse.json({
      success: true,
      suggestions,
      message: 'AI suggestions generated successfully (free feature)'
    })

  } catch (error) {
    console.error('❌ Error generating suggestions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

async function generateAISuggestions(step: number, focusArea: string, resumeData: any): Promise<any[]> {
  const prompts = {
    summary: `Based on the following resume information, generate 3-5 professional summary suggestions that are compelling and ATS-friendly:

Name: ${resumeData?.personalInfo?.name || 'Professional'}
Title: ${resumeData?.personalInfo?.title || 'Professional'}
Experience: ${resumeData?.experience?.map((exp: any) => `${exp.position} at ${exp.company}`).join(', ') || 'Various roles'}
Skills: ${resumeData?.skills?.join(', ') || 'Various skills'}

Create summaries that:
1. Are 2-3 sentences long
2. Highlight key achievements and skills
3. Are tailored to the person's experience level
4. Use action words and quantifiable results when possible
5. Are ATS-optimized with relevant keywords`,

    experience: `Based on the following information, generate 3-5 achievement-focused bullet points for work experience:

Position: ${resumeData?.currentExperience?.position || 'Professional Role'}
Company: ${resumeData?.currentExperience?.company || 'Company'}
Current Description: ${resumeData?.currentExperience?.description || 'Professional responsibilities'}
Skills: ${resumeData?.skills?.join(', ') || 'Various skills'}

Create bullet points that:
1. Start with strong action verbs
2. Include quantifiable results when possible
3. Highlight achievements over responsibilities
4. Are relevant to the role and industry
5. Are ATS-friendly with relevant keywords`,

    skills: `Based on the following resume information, suggest 5-8 relevant skills to add:

Current Skills: ${resumeData?.skills?.join(', ') || 'None listed'}
Experience: ${resumeData?.experience?.map((exp: any) => exp.position).join(', ') || 'Various roles'}
Industry Focus: ${resumeData?.personalInfo?.title || 'Professional'}

Suggest skills that:
1. Are relevant to the person's experience and goals
2. Include both technical and soft skills
3. Are commonly sought after in their industry
4. Complement their existing skill set
5. Are ATS-friendly and searchable`,

    general: `Based on the resume information provided, generate 3-5 general improvement suggestions:

${JSON.stringify(resumeData, null, 2)}

Provide suggestions for:
1. Overall resume structure and formatting
2. Content improvements and additions
3. ATS optimization tips
4. Industry-specific recommendations
5. Ways to better highlight achievements`
  }

  const prompt = prompts[focusArea as keyof typeof prompts] || prompts.general

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer and career coach. Provide specific, actionable suggestions that will improve the resume's effectiveness and ATS compatibility. Return suggestions as a JSON array of objects with 'id', 'type', 'content', 'category', 'icon', and 'confidence' fields."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content?.trim()
    
    if (!response) {
      throw new Error('No suggestions generated')
    }

    // Try to parse as JSON, fallback to creating structured suggestions
    try {
      const parsedSuggestions = JSON.parse(response)
      if (Array.isArray(parsedSuggestions)) {
        return parsedSuggestions.map((suggestion, index) => ({
          id: `suggestion-${Date.now()}-${index}`,
          type: focusArea,
          content: suggestion.content || suggestion,
          category: suggestion.category || focusArea,
          icon: suggestion.icon || '💡',
          confidence: suggestion.confidence || 85,
          preview: suggestion.preview || suggestion.content?.substring(0, 100)
        }))
      }
    } catch (parseError) {
      console.log('Response not JSON, creating structured suggestions from text')
    }

    // Fallback: split response into suggestions
    const suggestionTexts = response.split('\n').filter(line => 
      line.trim() && 
      !line.trim().startsWith('```') && 
      line.trim().length > 10
    )

    return suggestionTexts.slice(0, 5).map((text, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      type: focusArea,
      content: text.replace(/^\d+\.\s*/, '').trim(),
      category: focusArea,
      icon: getIconForFocusArea(focusArea),
      confidence: 80 + Math.floor(Math.random() * 15),
      preview: text.substring(0, 100)
    }))

  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate suggestions with AI')
  }
}

function getIconForFocusArea(focusArea: string): string {
  const icons: Record<string, string> = {
    summary: '📝',
    experience: '💼',
    skills: '🎯',
    education: '🎓',
    general: '💡'
  }
  return icons[focusArea] || '💡'
}

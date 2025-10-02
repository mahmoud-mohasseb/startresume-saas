import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase'
import { createCreditsProtectedHandler } from '@/lib/credit-middleware'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Calculate ATS score based on resume content
function calculateATSScore(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, ' ').toLowerCase()
  let score = 0
  
  // Check for key sections (40 points)
  const sections = ['experience', 'education', 'skills', 'summary', 'contact']
  sections.forEach(section => {
    if (text.includes(section)) score += 8
  })
  
  // Check for keywords and formatting (30 points)
  const keywords = ['responsible', 'managed', 'developed', 'implemented', 'achieved', 'improved']
  keywords.forEach(keyword => {
    if (text.includes(keyword)) score += 5
  })
  
  // Check for quantifiable achievements (20 points)
  const numbers = text.match(/\d+/g)
  if (numbers && numbers.length > 3) score += 20
  else if (numbers && numbers.length > 0) score += 10
  
  // Check for proper structure (10 points)
  if (htmlContent.includes('<h1>') || htmlContent.includes('<h2>')) score += 5
  if (htmlContent.includes('<ul>') || htmlContent.includes('<li>')) score += 5
  
  return Math.min(100, Math.max(0, score))
}

export async function POST(request: NextRequest) {
  async function handleResumeGeneration(request: NextRequest) {
    try {
      const user = await currentUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const { 
        personalInfo, 
        experience, 
        education, 
        skills, 
        jobTitle,
        saveToDatabase = true 
      } = body

      if (!personalInfo?.name) {
        return NextResponse.json({ 
          error: 'Personal information with name is required' 
        }, { status: 400 })
      }

      const prompt = `Create a professional, ATS-friendly resume in HTML format for ${personalInfo.name}. 

Personal Information:
- Name: ${personalInfo.name}
- Email: ${personalInfo.email || 'Not provided'}
- Phone: ${personalInfo.phone || 'Not provided'}
- Location: ${personalInfo.location || 'Not provided'}
- LinkedIn: ${personalInfo.linkedin || 'Not provided'}

Target Job Title: ${jobTitle || 'Professional'}

Experience: ${experience || 'Please include relevant work experience'}
Education: ${education || 'Please include educational background'}
Skills: ${skills || 'Please include relevant skills'}

Requirements:
1. Create clean, semantic HTML with proper structure
2. Include inline CSS for professional styling
3. Use a modern, clean design that's ATS-friendly
4. Include sections: Header, Summary, Experience, Education, Skills
5. Use proper heading tags (h1, h2, h3)
6. Make it visually appealing but professional
7. Ensure good readability and spacing
8. Use a color scheme that's professional (blues, grays)

Return ONLY the HTML content without any code blocks, explanations, or markdown formatting.`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional resume writer. Create clean, ATS-friendly HTML resumes with inline CSS. Return only the HTML content without any markdown code blocks or explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      })

      let htmlContent = completion.choices[0]?.message?.content || ''
      
      // Clean up the response - remove any markdown code blocks
      htmlContent = htmlContent
        .replace(/```html\s*/gi, '')
        .replace(/```\s*/g, '')
        .replace(/^html\s*/gi, '')
        .trim()

      // Ensure we have valid HTML
      if (!htmlContent.includes('<html>') && !htmlContent.includes('<!DOCTYPE')) {
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo.name}'s Resume</title>
</head>
<body>
${htmlContent}
</body>
</html>`
      }

      // Calculate ATS score
      const atsScore = calculateATSScore(htmlContent)

      // Save to database if requested
      let resumeId = null
      if (saveToDatabase) {
        try {
          const supabase = createAdminClient()
          
          // First, ensure user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!existingUser) {
            await supabase
              .from('users')
              .insert({
                id: user.id,
                email: personalInfo.email || '',
                first_name: personalInfo.name?.split(' ')[0] || '',
                last_name: personalInfo.name?.split(' ').slice(1).join(' ') || '',
              })
          }

          // Save resume
          const resumeTitle = `${personalInfo.name}'s Resume - ${jobTitle || 'Professional'}`
          const { data: resumeData, error: resumeError } = await supabase
            .from('resumes')
            .insert({
              user_id: user.id,
              title: resumeTitle,
              html_content: htmlContent,
              json_content: {
                personalInfo,
                experience,
                education,
                skills,
                jobTitle
              },
              ats_score: atsScore,
              theme_color: '#3B82F6'
            })
            .select('id')
            .single()

          if (resumeError) {
            console.error('Error saving resume:', resumeError)
          } else {
            resumeId = resumeData?.id
          }
        } catch (dbError) {
          console.error('Database error:', dbError)
          // Continue without saving to database
        }
      }

      return NextResponse.json({
        html: htmlContent,
        atsScore,
        resumeId,
        message: resumeId ? 'Resume generated and saved successfully!' : 'Resume generated successfully!'
      })

    } catch (error) {
      console.error('Resume generation error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to generate resume', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        },
        { status: 500 }
      )
    }
  }

  return handleResumeGeneration(request)
}

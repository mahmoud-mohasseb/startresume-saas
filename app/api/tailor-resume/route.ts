import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { OPENAI_CONFIG, SYSTEM_PROMPTS } from '@/lib/openai-config'
import { checkAndRecordUsage } from '@/lib/credit-bypass'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Rate limiting for resume tailoring
const userTailoringCount = new Map<string, { count: number, resetTime: number }>()
const TAILORING_RATE_LIMIT = 5 // Per hour per user (more expensive operation)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function checkTailoringRateLimit(userId: string): boolean {
  if (!OPENAI_CONFIG.FEATURES.ENABLE_RATE_LIMITING) return true
  
  const now = Date.now()
  const userLimit = userTailoringCount.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    userTailoringCount.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= TAILORING_RATE_LIMIT) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Resume tailoring API called')
    
    // Check authentication
    const user = await currentUser()
    if (!user) {
      console.log('❌ No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Parse request body with size validation
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB limit
      console.log('❌ Request too large:', contentLength)
      return NextResponse.json({ 
        error: 'Request too large. Please try with a shorter resume or job description.' 
      }, { status: 413 })
    }

    const body = await request.json()
    console.log('✅ Request body parsed')
    
    const { resume, jobData } = body

    // Validate required fields
    if (!resume || !jobData) {
      console.log('❌ Missing required fields:', { hasResume: !!resume, hasJobData: !!jobData })
      return NextResponse.json({ 
        error: 'Missing required fields: resume and jobData' 
      }, { status: 400 })
    }

    if (!resume.html_content || !jobData.jobDescription) {
      console.log('❌ Missing content:', { 
        hasResumeContent: !!resume.html_content, 
        hasJobDescription: !!jobData.jobDescription 
      })
      return NextResponse.json({ 
        error: 'Missing resume content or job description' 
      }, { status: 400 })
    }

    // Log payload info for debugging
    console.log('✅ Tailor resume request validated:', {
      userId: user.id,
      resumeId: resume.id,
      resumeContentLength: resume.html_content.length,
      jobDescriptionLength: jobData.jobDescription.length,
      requirementsCount: jobData.requirements?.length || 0,
      keywordsCount: jobData.keywords?.length || 0
    })

    // Check rate limiting
    if (!checkTailoringRateLimit(user.id)) {
      console.log('❌ Rate limit exceeded')
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 })
    }

    // Check plan access and record usage with bypass system
    console.log('💼 Job tailoring: Checking plan access with bypass system')
    const accessResult = await checkAndRecordUsage(user.id, 'job_tailoring')
    
    if (!accessResult.success) {
      console.log('❌ Plan access denied:', accessResult.message)
      return NextResponse.json({
        error: 'Plan access denied',
        message: accessResult.message,
        planStatus: accessResult.planStatus
      }, { status: 402 })
    }

    console.log('✅ Plan access granted. Usage recorded.')

    // Use actual AI tailoring instead of simulation
    const tailoredResume = await tailorResumeWithOpenAI(resume, jobData)
    const analysis = await analyzeTailoringResults(resume.html_content, tailoredResume, jobData)

    return NextResponse.json({
      tailoredResume,
      analysis,
      success: true,
      planStatus: accessResult.planStatus
    })

  } catch (error) {
    console.error('❌ Tailor resume API error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// AI tailoring function using OpenAI
async function tailorResumeWithOpenAI(resume: any, jobData: any): Promise<string> {
  try {
    const prompt = `
Tailor the resume to match the job description and requirements:

JOB TITLE: ${jobData.jobTitle || ''}
JOB DESCRIPTION: ${jobData.jobDescription || ''}
KEYWORDS: ${jobData.keywords?.join(', ') || ''}
REQUIREMENTS: ${jobData.requirements?.join(', ') || ''}

RESUME CONTENT:
${resume.html_content}

Tailor the resume to match the job requirements and return ONLY the tailored HTML content.
`

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content: "You are a resume tailoring expert. Tailor the resume to match the job requirements and return only the tailored HTML content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.2,
    })

    const responseText = completion.choices[0]?.message?.content || ''
    const cleanedContent = cleanTailoredContent(responseText)
    
    return cleanedContent
  } catch (error) {
    console.error('Error in AI tailoring:', error)
    throw error
  }
}

// Match analysis simulation function
async function analyzeMatch(resume: any, jobData: any): Promise<any> {
  const keywords = jobData.keywords || []
  const requirements = jobData.requirements || []
  
  // Simple keyword matching
  const resumeText = resume.html_content.toLowerCase()
  const matchedKeywords = keywords.filter((keyword: string) => 
    resumeText.includes(keyword.toLowerCase())
  )
  
  const matchScore = Math.min(95, Math.max(60, 
    Math.round((matchedKeywords.length / Math.max(keywords.length, 1)) * 100)
  ))

  return {
    matchScore,
    keywordMatches: matchedKeywords.length,
    missingKeywords: keywords.filter((keyword: string) => 
      !resumeText.includes(keyword.toLowerCase())
    ).slice(0, 10),
    suggestedChanges: [
      `Add more ${jobData.jobTitle || 'relevant'} experience`,
      `Include ${jobData.company || 'company'}-specific technologies`,
      'Quantify achievements with metrics',
      'Highlight leadership experience',
      'Add relevant certifications'
    ],
    strengthAreas: [
      'Technical skills alignment',
      'Experience level match',
      'Industry background',
      'Educational qualifications'
    ],
    improvementAreas: [
      'Keyword optimization',
      'Achievement quantification',
      'Skills highlighting',
      'Format consistency'
    ],
    tailoringQuality: matchScore >= 85 ? 'Excellent' : 
                     matchScore >= 75 ? 'Good' : 
                     matchScore >= 65 ? 'Fair' : 'Poor'
  }
}

// Clean up the tailored content
function cleanTailoredContent(content: string): string {
  // Remove markdown code blocks
  content = content.replace(/```html\s*/gi, '')
  content = content.replace(/```\s*/g, '')
  
  // Remove any explanatory text before HTML
  const htmlStartIndex = content.indexOf('<!DOCTYPE html>')
  if (htmlStartIndex > 0) {
    content = content.substring(htmlStartIndex)
  } else {
    // Try to find just <html> if DOCTYPE is missing
    const htmlTagIndex = content.indexOf('<html')
    if (htmlTagIndex > 0) {
      content = '<!DOCTYPE html>\n' + content.substring(htmlTagIndex)
    }
  }

  // Remove any text after the last HTML tag
  const htmlEndIndex = content.lastIndexOf('</html>')
  if (htmlEndIndex !== -1) {
    content = content.substring(0, htmlEndIndex + 7)
  }

  // Remove common AI explanatory phrases
  const cleanupPatterns = [
    /Here's the tailored resume:/gi,
    /I've tailored your resume/gi,
    /The tailored resume is:/gi,
    /Below is the tailored version:/gi,
    /```html/gi,
    /```/gi,
    /Here is the tailored HTML resume:/gi,
    /The following is the tailored resume:/gi
  ]

  cleanupPatterns.forEach(pattern => {
    content = content.replace(pattern, '')
  })

  // Ensure we have a complete HTML document
  if (!content.includes('<!DOCTYPE html>') && content.includes('<html')) {
    content = '<!DOCTYPE html>\n' + content
  }

  return content.trim()
}

// Analyze tailoring results and provide insights
async function analyzeTailoringResults(originalContent: string, tailoredContent: string, jobData: any) {
  try {
    const analysisPrompt = `
Compare the original and tailored resume versions and provide analysis:

ORIGINAL RESUME LENGTH: ${originalContent.length} characters
TAILORED RESUME LENGTH: ${tailoredContent.length} characters

JOB KEYWORDS: ${jobData.keywords?.join(', ') || 'None'}
JOB REQUIREMENTS: ${jobData.requirements?.join(', ') || 'None'}

TAILORED RESUME CONTENT (first 2000 chars):
${tailoredContent.substring(0, 2000)}...

Analyze and return ONLY a JSON object:
{
  "matchScore": 85, // Estimated ATS match score (0-100)
  "keywordMatches": 12, // Number of job keywords found in tailored resume
  "missingKeywords": ["keyword1", "keyword2"], // Important keywords still missing
  "suggestedChanges": ["change1", "change2", "change3"], // Top 3 improvements made
  "strengthAreas": ["area1", "area2", "area3"], // Top 3 strength areas
  "improvementAreas": ["area1", "area2"], // Areas that could be improved further
  "tailoringQuality": "Excellent" // "Excellent", "Good", "Fair", "Poor"
}
`

    const analysisCompletion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content: "You are an ATS and resume analysis expert. Analyze resume tailoring effectiveness and return only valid JSON."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 400,
      temperature: 0.2,
    })

    const analysisText = analysisCompletion.choices[0]?.message?.content || ''
    
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Error parsing analysis response:', parseError)
    }
    
    // Fallback analysis
    return generateFallbackAnalysis(originalContent, tailoredContent, jobData)
    
  } catch (error) {
    console.error('Error in tailoring analysis:', error)
    return generateFallbackAnalysis(originalContent, tailoredContent, jobData)
  }
}

// Generate fallback analysis when AI analysis fails
function generateFallbackAnalysis(originalContent: string, tailoredContent: string, jobData: any) {
  const tailoredLower = tailoredContent.toLowerCase()
  const keywords = jobData.keywords || []
  
  // Count keyword matches
  const keywordMatches = keywords.filter((keyword: string) => 
    tailoredLower.includes(keyword.toLowerCase())
  ).length
  
  // Calculate basic match score
  const matchScore = Math.min(90, Math.max(60, (keywordMatches / Math.max(keywords.length, 1)) * 100))
  
  // Find missing keywords
  const missingKeywords = keywords.filter((keyword: string) => 
    !tailoredLower.includes(keyword.toLowerCase())
  ).slice(0, 5)
  
  return {
    matchScore: Math.round(matchScore),
    keywordMatches,
    missingKeywords,
    suggestedChanges: [
      "Optimized professional summary for target role",
      "Enhanced relevant skills and experience",
      "Improved keyword density for ATS compatibility"
    ],
    strengthAreas: [
      "Strong keyword optimization",
      "Relevant experience highlighted",
      "Professional formatting maintained"
    ],
    improvementAreas: missingKeywords.length > 0 ? [
      "Consider adding more industry-specific keywords",
      "Further quantify achievements where possible"
    ] : [
      "Excellent keyword coverage achieved"
    ],
    tailoringQuality: matchScore >= 80 ? "Excellent" : 
                     matchScore >= 70 ? "Good" : 
                     matchScore >= 60 ? "Fair" : "Poor"
  }
}

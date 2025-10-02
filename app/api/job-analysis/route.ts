import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { OPENAI_CONFIG, SYSTEM_PROMPTS } from '@/lib/openai-config'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Rate limiting for job analysis
const userAnalysisCount = new Map<string, { count: number, resetTime: number }>()
const ANALYSIS_RATE_LIMIT = 20 // Per hour per user
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function checkAnalysisRateLimit(userId: string): boolean {
  if (!OPENAI_CONFIG.FEATURES.ENABLE_RATE_LIMITING) return true
  
  const now = Date.now()
  const userLimit = userAnalysisCount.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    userAnalysisCount.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= ANALYSIS_RATE_LIMIT) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkAnalysisRateLimit(userId)) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 })
    }

    const { jobDescription, jobTitle, company } = await request.json()

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json({ 
        error: 'Job description must be at least 50 characters long' 
      }, { status: 400 })
    }

    const analysisPrompt = `
Analyze this job description and extract key information in JSON format:

Job Title: ${jobTitle || 'Not specified'}
Company: ${company || 'Not specified'}
Job Description: ${jobDescription}

Extract and return ONLY a JSON object with these fields:
{
  "requirements": ["requirement1", "requirement2", ...], // 5-10 key technical/professional requirements
  "keywords": ["keyword1", "keyword2", ...], // 10-15 important keywords for ATS
  "industry": "industry name", // e.g., "Technology", "Healthcare", "Finance"
  "experienceLevel": "level", // e.g., "Entry Level", "Mid Level", "Senior Level", "Executive"
  "skills": ["skill1", "skill2", ...], // 8-12 technical and soft skills mentioned
  "qualifications": ["qual1", "qual2", ...], // Education, certifications, years of experience
  "responsibilities": ["resp1", "resp2", ...], // 5-8 main job responsibilities
  "companyType": "type", // e.g., "Startup", "Enterprise", "Non-profit", "Government"
  "workType": "type" // e.g., "Remote", "Hybrid", "On-site", "Not specified"
}

Focus on extracting the most important and specific requirements that would be crucial for resume tailoring.
`

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert HR analyst and ATS specialist. Extract key information from job descriptions for resume optimization. Return only valid JSON."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: OPENAI_CONFIG.MAX_TOKENS.SUGGESTIONS,
      temperature: OPENAI_CONFIG.TEMPERATURE.SUGGESTIONS,
    })

    const analysisText = completion.choices[0]?.message?.content || ''
    
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      const analysisData = JSON.parse(jsonMatch[0])
      
      // Validate required fields
      const requiredFields = ['requirements', 'keywords', 'industry', 'experienceLevel']
      for (const field of requiredFields) {
        if (!analysisData[field]) {
          analysisData[field] = field === 'requirements' || field === 'keywords' ? [] : 'Not specified'
        }
      }

      // Log cost usage
      if (OPENAI_CONFIG.FEATURES.ENABLE_COST_TRACKING) {
        const inputTokens = Math.ceil(analysisPrompt.length / 4)
        const outputTokens = Math.ceil(analysisText.length / 4)
        const inputCost = (inputTokens / 1000) * OPENAI_CONFIG.COSTS.INPUT_PER_1K_TOKENS
        const outputCost = (outputTokens / 1000) * OPENAI_CONFIG.COSTS.OUTPUT_PER_1K_TOKENS
        const totalCost = inputCost + outputCost
        
        console.log(`[JOB ANALYSIS COST] User: ${userId}, Input: ${inputTokens} tokens ($${inputCost.toFixed(4)}), Output: ${outputTokens} tokens ($${outputCost.toFixed(4)}), Total: $${totalCost.toFixed(4)}`)
      }

      return NextResponse.json({
        ...analysisData,
        success: true,
        message: 'Job description analyzed successfully'
      })

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', analysisText)
      
      // Fallback analysis using basic text processing
      const fallbackAnalysis = performFallbackAnalysis(jobDescription, jobTitle)
      
      return NextResponse.json({
        ...fallbackAnalysis,
        success: true,
        message: 'Job description analyzed successfully (fallback method)'
      })
    }

  } catch (error) {
    console.error('Error in job analysis:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze job description',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Fallback analysis using text processing when AI fails
function performFallbackAnalysis(jobDescription: string, jobTitle?: string) {
  const text = jobDescription.toLowerCase()
  
  // Common technical skills
  const techSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
    'kubernetes', 'git', 'agile', 'scrum', 'api', 'rest', 'graphql', 'mongodb',
    'postgresql', 'redis', 'elasticsearch', 'microservices', 'ci/cd', 'devops'
  ]
  
  // Common soft skills
  const softSkills = [
    'communication', 'leadership', 'teamwork', 'problem solving', 'analytical',
    'project management', 'collaboration', 'mentoring', 'strategic thinking'
  ]
  
  // Experience level indicators
  const experienceLevels = [
    { keywords: ['entry level', 'junior', '0-2 years', 'graduate'], level: 'Entry Level' },
    { keywords: ['mid level', '3-5 years', 'intermediate'], level: 'Mid Level' },
    { keywords: ['senior', '5+ years', '7+ years', 'lead'], level: 'Senior Level' },
    { keywords: ['principal', 'staff', 'architect', '10+ years'], level: 'Executive' }
  ]
  
  // Industry indicators
  const industries = [
    { keywords: ['software', 'technology', 'tech', 'startup', 'saas'], industry: 'Technology' },
    { keywords: ['healthcare', 'medical', 'hospital', 'pharma'], industry: 'Healthcare' },
    { keywords: ['finance', 'banking', 'fintech', 'investment'], industry: 'Finance' },
    { keywords: ['retail', 'ecommerce', 'commerce'], industry: 'Retail' },
    { keywords: ['education', 'university', 'school'], industry: 'Education' }
  ]
  
  // Extract found skills
  const foundTechSkills = techSkills.filter(skill => text.includes(skill))
  const foundSoftSkills = softSkills.filter(skill => text.includes(skill))
  
  // Determine experience level
  let experienceLevel = 'Mid Level' // default
  for (const level of experienceLevels) {
    if (level.keywords.some(keyword => text.includes(keyword))) {
      experienceLevel = level.level
      break
    }
  }
  
  // Determine industry
  let industry = 'Technology' // default
  for (const ind of industries) {
    if (ind.keywords.some(keyword => text.includes(keyword))) {
      industry = ind.industry
      break
    }
  }
  
  // Extract requirements (common phrases)
  const requirementPatterns = [
    /bachelor'?s degree/gi,
    /master'?s degree/gi,
    /\d+\+?\s*years?\s*of\s*experience/gi,
    /experience\s*with\s*[\w\s,]+/gi,
    /proficient\s*in\s*[\w\s,]+/gi,
    /knowledge\s*of\s*[\w\s,]+/gi
  ]
  
  const requirements = []
  for (const pattern of requirementPatterns) {
    const matches = jobDescription.match(pattern)
    if (matches) {
      requirements.push(...matches.slice(0, 2)) // Limit to 2 per pattern
    }
  }
  
  return {
    requirements: requirements.slice(0, 8),
    keywords: [...foundTechSkills, ...foundSoftSkills].slice(0, 12),
    skills: [...foundTechSkills, ...foundSoftSkills],
    industry,
    experienceLevel,
    qualifications: requirements.filter(req => 
      req.toLowerCase().includes('degree') || req.toLowerCase().includes('years')
    ),
    responsibilities: [],
    companyType: 'Not specified',
    workType: text.includes('remote') ? 'Remote' : 
              text.includes('hybrid') ? 'Hybrid' : 'Not specified'
  }
}

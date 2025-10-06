import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { checkAndRecordUsage } from '@/lib/credit-bypass'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔗 LinkedIn optimization: Checking plan access for user:', user.id)

    // Check plan access and record usage
    const accessResult = await checkAndRecordUsage(user.id, 'linkedin_optimization')
    
    if (!accessResult.hasAccess) {
      console.log('❌ Access denied:', accessResult.reason)
      return NextResponse.json({
        error: 'Access denied',
        reason: accessResult.reason,
        planStatus: accessResult.planStatus,
        message: accessResult.reason === 'usage_limit_exceeded' 
          ? 'You have reached your monthly usage limit. Please upgrade your plan for more access.'
          : 'This feature is not available in your current plan. Please upgrade to access this feature.'
      }, { status: 402 })
    }

    const { type, currentProfile, userContext } = await request.json()

    let prompt = ''
    
    if (type === 'headline') {
      prompt = `Create a professional LinkedIn headline for a ${userContext.role || 'professional'} in the ${userContext.industry || 'industry'} sector.
      
      Current skills: ${userContext.skills.join(', ')}
      Location: ${userContext.location || 'Not specified'}
      
      Requirements:
      - Make it highly specific to ${userContext.role || 'their role'} responsibilities
      - Include 2-3 most relevant skills for this role
      - Add value proposition specific to ${userContext.industry || 'the industry'}
      - Use keywords that recruiters search for in ${userContext.industry || 'this industry'}
      - Keep under 220 characters
      - Format: Role | Key Skills | Value/Impact
      
      Return only the headline text, no explanations.`
    } else if (type === 'summary') {
      prompt = `Create a professional LinkedIn summary for a ${userContext.role || 'professional'} in ${userContext.industry || 'the industry'}.
      
      Context:
      - Role: ${userContext.role || 'Professional'}
      - Industry: ${userContext.industry || 'Various'}
      - Skills: ${userContext.skills.join(', ')}
      - Experience: ${userContext.experience.join(', ')}
      - Location: ${userContext.location || 'Not specified'}
      
      Requirements:
      - Start with a strong opening about their ${userContext.role || 'role'} expertise
      - Include specific ${userContext.industry || 'industry'}-relevant achievements with metrics
      - Use emojis and bullet points for readability
      - Mention 3-5 key skills relevant to ${userContext.role || 'their role'}
      - Include industry-specific challenges they solve
      - End with their passion/vision for ${userContext.industry || 'the industry'}
      - Keep professional but engaging tone
      - 3-4 paragraphs, under 2000 characters
      
      Return only the summary text, no explanations.`
    } else if (type === 'skills') {
      prompt = `Suggest 10 highly relevant professional skills for a ${userContext.role || 'professional'} in ${userContext.industry || 'the industry'}.
      
      Current skills: ${userContext.skills.join(', ')}
      Role: ${userContext.role || 'Professional'}
      Industry: ${userContext.industry || 'Various'}
      
      Focus on skills that are:
      1. Specific to ${userContext.role || 'this role'} responsibilities
      2. In-demand in ${userContext.industry || 'this industry'}
      3. Complement existing skills without duplicating
      4. Mix of technical and soft skills relevant to the role
      5. Skills that would appear in job descriptions for ${userContext.role || 'this role'}
      
      Return as a JSON array of strings only, no explanations.
      Example: ["Skill 1", "Skill 2", "Skill 3"]`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a LinkedIn optimization expert specializing in ${userContext.industry || 'various industries'}. Create role-specific, keyword-rich content that attracts recruiters and networking opportunities in ${userContext.industry || 'the industry'} sector. Focus on ${userContext.role || 'professional'} responsibilities and achievements.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content?.trim()

    if (type === 'skills') {
      try {
        const skills = JSON.parse(content || '[]')
        return NextResponse.json({ 
          suggestions: skills,
          planStatus: {
            plan: accessResult.planStatus.planName,
            usage: accessResult.planStatus.monthlyUsage,
            limit: accessResult.planStatus.monthlyLimit,
            remaining: accessResult.planStatus.remainingUsage,
            isUnlimited: accessResult.planStatus.isUnlimited
          }
        })
      } catch {
        // Fallback role-specific skills
        const roleSpecificSkills = getRoleSpecificFallbackSkills(userContext.role, userContext.industry)
        return NextResponse.json({ 
          suggestions: roleSpecificSkills,
          planStatus: {
            plan: accessResult.planStatus.planName,
            usage: accessResult.planStatus.monthlyUsage,
            limit: accessResult.planStatus.monthlyLimit,
            remaining: accessResult.planStatus.remainingUsage,
            isUnlimited: accessResult.planStatus.isUnlimited
          }
        })
      }
    }

    return NextResponse.json({ 
      optimizedContent: content,
      planStatus: {
        plan: accessResult.planStatus.planName,
        usage: accessResult.planStatus.monthlyUsage,
        limit: accessResult.planStatus.monthlyLimit,
        remaining: accessResult.planStatus.remainingUsage,
        isUnlimited: accessResult.planStatus.isUnlimited
      }
    })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ error: 'Failed to optimize content' }, { status: 500 })
  }
}

function getRoleSpecificFallbackSkills(role: string, industry: string): string[] {
  const roleKey = role?.toLowerCase() || ''
  const industryKey = industry?.toLowerCase() || ''
  
  // Role-specific skills mapping
  const skillsMap: { [key: string]: string[] } = {
    'software engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'SQL', 'API Development', 'Agile'],
    'data scientist': ['Python', 'R', 'Machine Learning', 'SQL', 'Tableau', 'TensorFlow', 'Statistics', 'Data Visualization', 'Pandas', 'Jupyter'],
    'product manager': ['Product Strategy', 'Roadmap Planning', 'User Research', 'A/B Testing', 'Agile', 'Scrum', 'Analytics', 'Market Research', 'Wireframing', 'Stakeholder Management'],
    'marketing manager': ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Email Marketing', 'Campaign Management', 'Brand Strategy', 'Marketing Automation', 'Lead Generation'],
    'sales manager': ['Sales Strategy', 'CRM', 'Lead Generation', 'Negotiation', 'Account Management', 'Pipeline Management', 'Customer Relationship', 'Sales Forecasting', 'Team Leadership', 'Cold Calling'],
    'designer': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Wireframing', 'Design Systems', 'Sketch', 'InVision', 'User Testing'],
    'project manager': ['Project Management', 'Scrum', 'Agile', 'Risk Management', 'Budget Management', 'Team Leadership', 'Stakeholder Communication', 'Timeline Management', 'Resource Planning', 'PMP'],
    'business analyst': ['Business Analysis', 'Requirements Gathering', 'Process Improvement', 'SQL', 'Data Analysis', 'Stakeholder Management', 'Documentation', 'Workflow Design', 'Gap Analysis', 'Business Intelligence']
  }

  // Find role-specific skills
  for (const key in skillsMap) {
    if (roleKey.includes(key)) {
      return skillsMap[key]
    }
  }

  // Industry-specific fallback skills
  const industrySkills: { [key: string]: string[] } = {
    'technology': ['Problem Solving', 'Innovation', 'Technical Leadership', 'System Architecture', 'Code Review', 'DevOps', 'Cloud Computing', 'Cybersecurity', 'Automation', 'Software Development'],
    'finance': ['Financial Analysis', 'Risk Management', 'Excel', 'Financial Modeling', 'Compliance', 'Investment Analysis', 'Portfolio Management', 'Accounting', 'Budgeting', 'Financial Reporting'],
    'healthcare': ['Patient Care', 'Medical Knowledge', 'Healthcare Compliance', 'Electronic Health Records', 'Clinical Research', 'Healthcare Management', 'Medical Terminology', 'Quality Assurance', 'Patient Safety', 'Healthcare Analytics'],
    'marketing': ['Brand Management', 'Market Research', 'Customer Segmentation', 'Campaign Optimization', 'Content Strategy', 'Performance Marketing', 'Social Media Marketing', 'Email Marketing', 'SEO/SEM', 'Marketing Analytics'],
    'sales': ['Relationship Building', 'Sales Process', 'Customer Acquisition', 'Revenue Growth', 'Market Development', 'Sales Training', 'CRM Management', 'Lead Qualification', 'Closing Techniques', 'Account Management']
  }

  for (const key in industrySkills) {
    if (industryKey.includes(key)) {
      return industrySkills[key]
    }
  }

  // Default professional skills
  return ['Strategic Planning', 'Team Leadership', 'Project Management', 'Communication', 'Problem Solving', 'Innovation', 'Analytical Thinking', 'Collaboration', 'Time Management', 'Adaptability']
}

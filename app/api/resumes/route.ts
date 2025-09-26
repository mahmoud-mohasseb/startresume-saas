import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching resumes:', error)
      return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
    }

    return NextResponse.json({ resumes: data || [] })
  } catch (error) {
    console.error('Error in GET /api/resumes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, html_content, json_content, theme_color } = body

    if (!title || !json_content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // Calculate a basic ATS score (simplified version)
    const atsScore = calculateATSScore(json_content)

    const template_id = randomUUID()

    const resumeData = {
      user_id: userId,
      title,
      html_content: html_content || '',
      json_content,
      template_id,
      theme_color: theme_color || '#3b82f6',
      ats_score: atsScore,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert(resumeData)
      .select()
      .single()

    if (error) {
      console.error('Error saving resume:', error)
      return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      resume: data,
      ats_score: atsScore 
    })
  } catch (error) {
    console.error('Error in POST /api/resumes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simple ATS score calculation
function calculateATSScore(resumeData: any): number {
  let score = 0
  const maxScore = 100

  // Personal info completeness (20 points)
  const personalInfo = resumeData.personalInfo || {}
  if (personalInfo.fullName) score += 5
  if (personalInfo.email) score += 5
  if (personalInfo.phone) score += 5
  if (personalInfo.summary && personalInfo.summary.length > 50) score += 5

  // Experience section (30 points)
  const experience = resumeData.experience || []
  if (experience.length > 0) {
    score += 10
    const hasDetailedExperience = experience.some((exp: any) => 
      exp.company && exp.position && exp.description && exp.description.length > 100
    )
    if (hasDetailedExperience) score += 20
  }

  // Education section (20 points)
  const education = resumeData.education || []
  if (education.length > 0) {
    score += 10
    const hasCompleteEducation = education.some((edu: any) => 
      edu.school && edu.degree && edu.field
    )
    if (hasCompleteEducation) score += 10
  }

  // Skills section (15 points)
  const skills = resumeData.skills || []
  if (skills.length >= 3) score += 10
  if (skills.length >= 8) score += 5

  // Achievements section (15 points)
  const achievements = resumeData.achievements || []
  if (achievements.length > 0) score += 10
  if (achievements.length >= 3) score += 5

  return Math.min(score, maxScore)
}

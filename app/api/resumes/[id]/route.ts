import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // First verify the resume belongs to the user
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Delete the resume
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting resume:', deleteError)
      return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/resumes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    return NextResponse.json({ resume: data })
  } catch (error) {
    console.error('Error in GET /api/resumes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { title, html_content, json_content, theme_color, ats_score } = body

    if (!title || !json_content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // First verify the resume belongs to the user
    const { data: existingResume, error: fetchError } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Calculate ATS score if not provided
    const calculatedATSScore = ats_score || calculateATSScore(json_content)

    const updateData = {
      title,
      html_content: html_content || '',
      json_content,
      theme_color: theme_color || '#3b82f6',
      ats_score: calculatedATSScore,
      updated_at: new Date().toISOString()
    }

    // Update the resume
    const { data, error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating resume:', error)
      return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      resume: data,
      ats_score: calculatedATSScore,
      message: 'Resume updated successfully'
    })
  } catch (error) {
    console.error('Error in PUT /api/resumes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simple ATS score calculation (same as in main route)
function calculateATSScore(resumeData: any): number {
  let score = 0
  const maxScore = 100

  // Personal info completeness (20 points)
  const personalInfo = resumeData.personalInfo || {}
  if (personalInfo.name || personalInfo.fullName) score += 5
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

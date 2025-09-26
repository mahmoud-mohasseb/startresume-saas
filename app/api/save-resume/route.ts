import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, html_content, json_content, theme_color, template_id } = await request.json()

    if (!title || !html_content || !json_content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get or create user record
    let { data: user, error: userError } = await supabaseAdmin()
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabaseAdmin()
        .from('users')
        .insert({
          clerk_id: userId,
          email: '', // Will be updated from Clerk webhook
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      user = newUser
    }

    // Calculate basic ATS score based on content
    const calculateAtsScore = (htmlContent: string, jsonData: any) => {
      let score = 0
      
      // Check for key sections (40 points)
      if (jsonData?.personalInfo?.summary) score += 10
      if (jsonData?.experience?.length > 0) score += 15
      if (jsonData?.education?.length > 0) score += 10
      if (jsonData?.skills?.length > 0) score += 5
      
      // Check for contact information (20 points)
      if (jsonData?.personalInfo?.email) score += 5
      if (jsonData?.personalInfo?.phone) score += 5
      if (jsonData?.personalInfo?.location) score += 5
      if (jsonData?.personalInfo?.linkedin) score += 5
      
      // Check content quality (40 points)
      const wordCount = htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).length
      if (wordCount > 200) score += 20
      if (wordCount > 400) score += 10
      if (wordCount > 600) score += 10
      
      return Math.min(score, 100)
    }

    const atsScore = calculateAtsScore(html_content, json_content)

    // Save resume to database
    const { data: resume, error: saveError } = await supabaseAdmin()
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        html_content,
        json_content,
        theme_color: theme_color || '#3b82f6',
        ats_score: atsScore,
        template_id: null, // We'll use template_id from templates table later
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving resume:', saveError)
      return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      resume,
      ats_score: atsScore
    })
  } catch (error) {
    console.error('Error in save-resume API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

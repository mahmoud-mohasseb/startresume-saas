import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { brandData, analysis, strategy, title } = body

    if (!brandData || !analysis || !strategy) {
      return NextResponse.json({ 
        error: 'Brand data, analysis, and strategy are required' 
      }, { status: 400 })
    }

    // Generate a unique share ID
    const shareId = `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store the shared brand strategy in database
    const { data, error } = await supabase
      .from('shared_brand_strategies')
      .insert({
        id: shareId,
        user_id: user.id,
        title: title || `${brandData.industry} Brand Strategy`,
        brand_data: brandData,
        analysis: analysis,
        strategy: strategy,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_public: true
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create shareable link' },
        { status: 500 }
      )
    }

    // Generate shareable URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/brand/${shareId}`

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })

  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create shareable link', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('id')

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 })
    }

    // Fetch the shared brand strategy
    const { data, error } = await supabase
      .from('shared_brand_strategies')
      .select('*')
      .eq('id', shareId)
      .eq('is_public', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Shared brand strategy not found or expired' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase
      .from('shared_brand_strategies')
      .update({ 
        view_count: (data.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', shareId)

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        brandData: data.brand_data,
        analysis: data.analysis,
        strategy: data.strategy,
        createdAt: data.created_at,
        viewCount: (data.view_count || 0) + 1
      }
    })

  } catch (error) {
    console.error('Share fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared brand strategy', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

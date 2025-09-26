import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { feature } = body

    console.log(`🚀 BYPASS: Allowing access to ${feature} for user ${user.id}`)

    // In development, allow all features
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: `Access granted to ${feature}`,
        bypass: true,
        credits: {
          total: 50,
          used: 0,
          remaining: 50,
          plan: 'standard'
        }
      })
    }

    // In production, still allow but log
    console.log(`⚠️ PRODUCTION BYPASS: ${feature} access for ${user.id}`)
    
    return NextResponse.json({
      success: true,
      message: `Temporary access granted to ${feature}`,
      bypass: true,
      credits: {
        total: 10,
        used: 0,
        remaining: 10,
        plan: 'basic'
      }
    })

  } catch (error) {
    console.error('❌ BYPASS: Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

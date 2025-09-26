import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        authenticated: true
      } : {
        authenticated: false
      },
      message: 'API is healthy'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

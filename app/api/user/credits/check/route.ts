import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { canUserPerformAction } from '@/lib/subscription-manager'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { action, requiredCredits } = await request.json()

    if (!action || typeof requiredCredits !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. Action and requiredCredits are required.' },
        { status: 400 }
      )
    }

    const result = await canUserPerformAction(user.id, action, requiredCredits)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking user credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

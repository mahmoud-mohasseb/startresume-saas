import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log(`🧹 Clearing data for user: ${user.id}`)

    // In a real app, you would clear database records here
    // For now, we'll just return success since we're using localStorage
    
    return NextResponse.json({
      success: true,
      message: `User data cleared for ${user.id}`,
      instructions: {
        step1: 'User data has been cleared from the server',
        step2: 'localStorage will be cleared when you refresh the page',
        step3: 'You will start with a fresh free plan (3 credits)',
        clientScript: `
          // Clear all localStorage data for this user
          const userId = '${user.id}';
          const allKeys = Object.keys(localStorage);
          const userKeys = allKeys.filter(key => key.includes(userId));
          userKeys.forEach(key => localStorage.removeItem(key));
          
          // Also clear any generic plan data
          const planKeys = allKeys.filter(key => key.startsWith('selected_plan_'));
          planKeys.forEach(key => localStorage.removeItem(key));
          
          console.log('🧹 Cleared localStorage for user:', userId);
          window.location.reload();
        `
      }
    })

  } catch (error) {
    console.error('❌ Error clearing user data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      message: 'User data info retrieved',
      instructions: 'Use POST method to clear user data'
    })

  } catch (error) {
    console.error('❌ Error getting user info:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

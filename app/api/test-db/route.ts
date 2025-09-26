import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧪 Testing database with user:', user.id)

    // Test 1: Check if subscription exists with Clerk ID
    const { data: clerkSub, error: clerkError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('Test 1 - Clerk ID lookup:', { found: !!clerkSub, error: clerkError?.message })

    // Test 2: Check if user exists in users table
    const { data: dbUser, error: userError } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('clerk_id', user.id)
      .maybeSingle()

    console.log('Test 2 - User record:', { found: !!dbUser, error: userError?.message })

    // Test 3: If user exists, check subscription with UUID
    let uuidSub = null
    let uuidError = null
    if (dbUser) {
      const result = await getSupabaseAdmin()
        .from('subscriptions')
        .select('*')
        .eq('user_id', dbUser.id)
        .maybeSingle()
      
      uuidSub = result.data
      uuidError = result.error
      console.log('Test 3 - UUID lookup:', { found: !!uuidSub, error: uuidError?.message })
    }

    // Test 4: Try to create a basic subscription
    let createTest = null
    let createError = null
    
    try {
      const testSub = {
        user_id: user.id,
        plan: 'basic',
        credits: 10,
        credits_used: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const result = await getSupabaseAdmin()
        .from('subscriptions')
        .insert(testSub)
        .select()
        .single()

      createTest = result.data
      createError = result.error
      console.log('Test 4 - Create basic subscription:', { success: !!createTest, error: createError?.message })

      // Clean up test subscription
      if (createTest) {
        await getSupabaseAdmin()
          .from('subscriptions')
          .delete()
          .eq('id', createTest.id)
      }
    } catch (err) {
      createError = err
      console.log('Test 4 - Create failed:', err)
    }

    return NextResponse.json({
      success: true,
      tests: {
        clerkIdLookup: {
          found: !!clerkSub,
          data: clerkSub,
          error: clerkError?.message
        },
        userRecord: {
          found: !!dbUser,
          data: dbUser,
          error: userError?.message
        },
        uuidLookup: {
          found: !!uuidSub,
          data: uuidSub,
          error: uuidError?.message
        },
        createTest: {
          success: !!createTest,
          error: createError?.message || createError?.toString()
        }
      },
      user: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress
      }
    })

  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

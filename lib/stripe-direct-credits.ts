export async function getStripeDirectCredits(clerkUserId: string): Promise<StripeDirectCreditData> {
  try {
    console.log('🔍 Getting Stripe-direct credits with usage tracking for user:', clerkUserId)
    
    // Debug logging for development
    const isDebugUser = process.env.NODE_ENV === 'development' && clerkUserId.includes('debug')
    if (isDebugUser) {
      console.log('🐛 DEBUG USER DETECTED - Starting detailed logging')
    }
    
    // Search for customer by Clerk user ID in metadata
    const customers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${clerkUserId}'`
    })
    
    console.log(`Found ${customers.data.length} customers for user ${clerkUserId}`)
    
    if (isDebugUser) {
      console.log('🐛 DEBUG - Customer search results:', {
        searchQuery: `metadata['clerk_user_id']:'${clerkUserId}'`,
        customersFound: customers.data.length,
        customerDetails: customers.data.map(c => ({
          id: c.id,
          email: c.email,
          metadata: c.metadata,
          created: new Date(c.created * 1000).toISOString()
        }))
      })
    }

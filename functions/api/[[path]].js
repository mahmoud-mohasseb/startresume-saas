// Cloudflare Function to handle all API routes
// This replaces the Next.js API routes for Cloudflare Pages deployment

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Route handling
    if (path.startsWith('user/credits')) {
      return handleCreditsAPI(request, path, env);
    } else if (path.startsWith('openai/')) {
      return handleOpenAIAPI(request, path, env);
    } else if (path.startsWith('webhooks/stripe')) {
      return handleStripeWebhook(request, env);
    } else if (path === 'health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Default 404 response
    return new Response(JSON.stringify({ error: 'API route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Credits API handler
async function handleCreditsAPI(request, path, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Extract user ID from Clerk token
  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    // Mock response for now - replace with actual Supabase integration
    const mockCreditsData = {
      subscription: {
        plan: 'free',
        planName: 'Free Plan',
        totalCredits: 3,
        usedCredits: 0,
        remainingCredits: 3,
        isActive: true,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      plan: {
        name: 'Free Plan',
        price: 0
      }
    };

    if (path === 'user/credits') {
      return new Response(JSON.stringify(mockCreditsData), { headers: corsHeaders });
    } else if (path === 'user/credits/consume' && request.method === 'POST') {
      const body = await request.json();
      // Mock credit consumption
      return new Response(JSON.stringify({ 
        success: true, 
        subscription: {
          ...mockCreditsData.subscription,
          usedCredits: 1,
          remainingCredits: 2
        }
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Credits endpoint not found' }), {
      status: 404,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Credits API error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// OpenAI API handler
async function handleOpenAIAPI(request, path, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: corsHeaders
    });
  }

  try {
    const body = await request.json();
    
    // Mock OpenAI response for now
    const mockResponse = {
      success: true,
      data: {
        content: 'This is a mock response. Replace with actual OpenAI integration.',
        usage: { total_tokens: 100 }
      }
    };

    return new Response(JSON.stringify(mockResponse), { headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'OpenAI API error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Stripe webhook handler
async function handleStripeWebhook(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    // Mock webhook processing
    console.log('Stripe webhook received:', { body: body.substring(0, 100) });
    
    return new Response(JSON.stringify({ received: true }), { headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 400,
      headers: corsHeaders
    });
  }
}

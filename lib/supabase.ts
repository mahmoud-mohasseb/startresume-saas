import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Function to create a new client instance (for components)
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Client-side Supabase client (lazy initialization)
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export const supabase = (() => {
  if (typeof window === 'undefined') {
    // Server-side: return a mock object to prevent hydration issues
    return {} as ReturnType<typeof createSupabaseClient>
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  
  return supabaseInstance
})()

// For server-side operations that need elevated permissions
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Lazy admin client - only creates when actually needed
export const supabaseAdmin = (() => {
  let adminInstance: ReturnType<typeof createAdminClient> | null = null
  
  return () => {
    if (typeof window !== 'undefined') {
      // Client-side: return a mock object to prevent hydration issues
      return {} as ReturnType<typeof createAdminClient>
    }
    
    if (!adminInstance) {
      adminInstance = createAdminClient()
    }
    
    return adminInstance
  }
})()

// Database types
export interface Resume {
  id: string
  user_id: string
  title: string
  html_content: string
  json_content: any
  template_id?: string
  theme_color: string
  profile_picture_url?: string
  ats_score: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'basic' | 'standard' | 'pro'
  credits: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: 'active' | 'canceled' | 'past_due'
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  category: string
  preview_url: string
  html_template: string
  is_premium: boolean
  created_at: string
}

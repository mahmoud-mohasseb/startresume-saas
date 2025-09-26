# StartResume.io - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete StartResume.io platform with Stripe payments, Supabase database, and AI features.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project
- Stripe account (test mode)
- OpenAI API key
- Clerk account for authentication

## 🔧 Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd startresume.io
npm install
```

### 2. Environment Variables

Copy the example environment file and configure your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_BASIC_PRICE_ID=price_your_basic_plan_price_id
STRIPE_STANDARD_PRICE_ID=price_your_standard_plan_price_id
STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and API keys to `.env.local`

### 2. Run Database Migration

```bash
npm run db:migrate
```

This will:
- Create all necessary tables
- Set up Row Level Security (RLS)
- Create indexes for performance
- Seed default data

### 3. Manual Schema Setup (Alternative)

If the migration script doesn't work, you can manually run the SQL from `lib/database-schema.sql` in your Supabase SQL editor.

## 💳 Stripe Setup

### 1. Create Stripe Products

In your Stripe Dashboard:

1. **Products & Prices** → **Add Product**
2. Create three products:

   **Basic Plan**
   - Name: "Basic Plan"
   - Price: $9.99/month
   - Copy the Price ID to `STRIPE_BASIC_PRICE_ID`

   **Standard Plan**
   - Name: "Standard Plan"  
   - Price: $19.99/month
   - Copy the Price ID to `STRIPE_STANDARD_PRICE_ID`

   **Pro Plan**
   - Name: "Pro Plan"
   - Price: $49.99/month
   - Copy the Price ID to `STRIPE_PRO_PRICE_ID`

### 2. Configure Webhooks

1. **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Webhooks Locally

```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local development
npm run stripe:listen
```

## 🤖 AI Services Setup

### 1. OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Add it to `OPENAI_API_KEY` in `.env.local`

### 2. Optional: Web Search APIs

For enhanced salary research (optional):

```bash
# Brave Search API (recommended)
BRAVE_SEARCH_API_KEY=your_brave_search_api_key

# Alternative search APIs
SERP_API_KEY=your_serp_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
```

## 🔐 Authentication Setup

### 1. Clerk Configuration

1. Create a [Clerk](https://clerk.com) account
2. Create a new application
3. Copy your keys to the environment variables
4. Configure sign-in/sign-up URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

## 🧪 Testing & Verification

### 1. Run Comprehensive Tests

```bash
npm run test
```

This will check:
- ✅ Environment variables
- ✅ Database connectivity
- ✅ API endpoints
- ✅ Stripe integration
- ✅ OpenAI connectivity
- ✅ Credit system functionality

### 2. Manual Testing

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test API Endpoints**
   ```bash
   # Test suite API
   curl http://localhost:3000/api/test-suite

   # User subscription API
   curl http://localhost:3000/api/user/subscription

   # Stripe webhook API
   curl http://localhost:3000/api/webhooks/stripe
   ```

3. **Test Credit System**
   - Sign up for an account
   - Generate a resume (should consume 5 credits)
   - Check credit balance in dashboard

## 🚀 Production Deployment

### 1. Environment Variables

Set all environment variables in your production environment:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Railway: Project → Variables

### 2. Database Migration

Run the migration script in production:

```bash
npm run db:migrate
```

### 3. Stripe Webhook Configuration

Update your Stripe webhook endpoint URL to your production domain:
```
https://your-production-domain.com/api/webhooks/stripe
```

## 📊 Monitoring & Analytics

### 1. Subscription Analytics

Access analytics via the API:

```bash
curl https://your-domain.com/api/analytics/subscriptions
```

### 2. Credit Usage Tracking

Monitor credit usage in the Supabase dashboard:
- Table: `analytics_events`
- Filter by: `event_type = 'credit_usage'`

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Check Supabase URL and keys
- Verify RLS policies are set correctly
- Run `npm run db:migrate`

**2. Stripe Webhooks Not Working**
- Verify webhook secret is correct
- Check webhook endpoint URL
- Ensure webhook events are selected

**3. Credit System Not Working**
- Check if user has a subscription record
- Verify credit costs in `lib/credits.ts`
- Check analytics events for credit usage

**4. AI Features Not Working**
- Verify OpenAI API key is valid
- Check API usage limits
- Monitor API responses in logs

### Debug Commands

```bash
# Check system status
npm run test

# Test specific API
curl -v http://localhost:3000/api/test-suite

# Check database tables
npm run db:migrate

# Monitor Stripe webhooks
npm run stripe:listen
```

## 📚 Documentation

- **API Documentation**: Visit `/api/test-suite` for endpoint details
- **Database Schema**: See `lib/database-schema.sql`
- **Credit System**: Check `lib/credits.ts` for pricing
- **Webhook Handler**: Review `app/api/webhooks/stripe/route.ts`

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `npm run test` to identify specific problems
3. Review the logs in your development console
4. Check the database for proper table creation

## 🎉 Success!

Once everything is set up, you should have:

- ✅ Complete authentication system
- ✅ Subscription management with Stripe
- ✅ Credit-based AI feature usage
- ✅ Comprehensive testing suite
- ✅ Production-ready deployment

Your StartResume.io platform is now ready for users! 🚀

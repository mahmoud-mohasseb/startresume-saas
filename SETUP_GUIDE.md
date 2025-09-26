# 🚀 StartResume.io - Complete Setup Guide

## Overview
This guide will help you set up the complete subscription + credits system for StartResume.io with Stripe payments, Supabase database, and Clerk authentication.

## 📋 Prerequisites

- Node.js 18+ installed
- A Stripe account
- A Supabase project
- A Clerk account
- An OpenAI API key

## 🔧 1. Environment Setup

Copy the `.env.example` file to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### Required Environment Variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create these in your Stripe dashboard)
STRIPE_BASIC_PRICE_ID=price_basic_monthly
STRIPE_STANDARD_PRICE_ID=price_standard_monthly  
STRIPE_PRO_PRICE_ID=price_pro_monthly

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key
```

## 🗄️ 2. Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Copy your project URL and anon key

### Step 2: Run Database Schema
Execute the SQL schema in your Supabase SQL editor:

```sql
-- Run the contents of /supabase/schema.sql
-- This creates users, subscriptions, and credit_history tables
```

### Step 3: Configure Row Level Security (RLS)
The schema automatically sets up RLS policies, but verify they're enabled:

- `users` table: Users can only see their own data
- `subscriptions` table: Users can view their own, service role can manage all
- `credit_history` table: Users can view their own, service role can manage all

## 💳 3. Stripe Setup

### Step 1: Create Stripe Products & Prices

In your Stripe dashboard, create the following products:

#### Basic Plan
- **Product Name**: "Basic Plan"
- **Price**: $9.99/month
- **Billing**: Recurring monthly
- **Copy the Price ID** → `STRIPE_BASIC_PRICE_ID`

#### Standard Plan
- **Product Name**: "Standard Plan" 
- **Price**: $19.99/month
- **Billing**: Recurring monthly
- **Copy the Price ID** → `STRIPE_STANDARD_PRICE_ID`

#### Pro Plan
- **Product Name**: "Pro Plan"
- **Price**: $49.99/month
- **Billing**: Recurring monthly
- **Copy the Price ID** → `STRIPE_PRO_PRICE_ID`

### Step 2: Configure Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret → `STRIPE_WEBHOOK_SECRET`

## 🔐 4. Clerk Authentication Setup

### Step 1: Create Clerk Application
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Choose "Next.js" as your framework
4. Copy your publishable key and secret key

### Step 2: Configure Redirect URLs
In your Clerk dashboard:
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in**: `/dashboard`
- **After sign-up**: `/dashboard`

### Step 3: Enable OAuth Providers (Optional)
- Google OAuth
- GitHub OAuth
- Any other providers you want

## 🤖 5. OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add it to your environment variables
4. Ensure you have sufficient credits/billing set up

## 🚀 6. Installation & Deployment

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 2: Run Development Server
```bash
npm run dev
# or
yarn dev
```

### Step 3: Test the System

#### Test User Registration:
1. Go to `/sign-up`
2. Create a new account
3. Verify you're redirected to `/dashboard`

#### Test Subscription Flow:
1. Go to `/billing`
2. Click "Upgrade to Basic"
3. Complete Stripe checkout (use test card: `4242 4242 4242 4242`)
4. Verify webhook creates subscription in Supabase
5. Check that credits are allocated correctly

#### Test Credit System:
1. Go to `/dashboard/create`
2. Generate a resume
3. Verify 1 credit is deducted
4. Check credit history in Supabase

## 📊 7. System Architecture

### Credit Flow:
```
User Action → Credit Check → Feature Access → Credit Deduction → Database Update
```

### Subscription Flow:
```
Stripe Checkout → Webhook → Supabase Update → Credit Allocation → User Access
```

### Database Schema:
- **users**: Clerk user integration
- **subscriptions**: Plan, credits, Stripe IDs
- **credit_history**: Usage tracking and audit trail

## 🔍 8. Testing Checklist

### ✅ Authentication
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can sign out
- [ ] Redirects work correctly

### ✅ Subscription System
- [ ] Billing page displays correctly
- [ ] Stripe checkout works
- [ ] Webhooks create subscriptions
- [ ] Credits are allocated properly
- [ ] Plan upgrades work

### ✅ Credit System
- [ ] Credit widget displays correctly
- [ ] Features check credits before access
- [ ] Credits are deducted after successful operations
- [ ] Credit history is logged
- [ ] Users see accurate credit balances

### ✅ Core Features
- [ ] Resume generation works
- [ ] Credit deduction happens
- [ ] ATS scoring functions
- [ ] Database saves resumes
- [ ] Export functionality works

## 🐛 9. Troubleshooting

### Common Issues:

#### "Insufficient credits" error
- Check Supabase subscription table
- Verify webhook processed correctly
- Check credit allocation in database

#### Stripe webhook not working
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure endpoint is publicly accessible
- Check Stripe webhook logs

#### Database connection issues
- Verify Supabase URL and keys
- Check RLS policies
- Ensure service role key has proper permissions

#### Authentication issues
- Verify Clerk keys are correct
- Check redirect URLs match
- Ensure middleware is configured

## 📈 10. Production Deployment

### Environment Variables
Update all environment variables for production:
- Use production Stripe keys
- Use production Supabase project
- Use production Clerk application
- Set correct domain URLs

### Webhook Configuration
Update webhook URL to production domain:
```
https://yourdomain.com/api/stripe/webhook
```

### Database Backup
Set up automated backups in Supabase dashboard.

### Monitoring
- Set up Stripe webhook monitoring
- Monitor Supabase usage
- Set up error tracking (Sentry, etc.)

## 🎯 11. Key Features Implemented

### ✅ Subscription Management
- **3 Pricing Tiers**: Basic ($9.99), Standard ($19.99), Pro ($49.99)
- **Monthly Credit Allocation**: 10, 50, 200 credits respectively
- **Stripe Integration**: Complete checkout and webhook handling
- **Automatic Renewal**: Monthly credit refresh

### ✅ Credit System
- **Unified Pricing**: 1 credit per AI feature
- **Real-time Tracking**: Live credit balance updates
- **Usage History**: Complete audit trail
- **Feature Protection**: Credit checks before access

### ✅ User Experience
- **Expandable Credit Widget**: Shows detailed subscription info
- **Billing Page**: Clean pricing display with upgrade options
- **Dashboard Integration**: Real credit data throughout
- **Error Handling**: Clear messages and upgrade prompts

### ✅ Technical Features
- **Supabase Integration**: Complete database schema with RLS
- **Webhook Handling**: Automatic subscription management
- **Credit Protection**: Middleware for API route protection
- **Atomic Operations**: Credits deducted only after success

## 🔗 12. Important URLs

- **Landing Page**: `/`
- **Pricing**: `/billing`
- **Dashboard**: `/dashboard`
- **Sign In**: `/sign-in`
- **Sign Up**: `/sign-up`
- **About**: `/about`
- **Contact**: `/contact`
- **Blog**: `/blog`
- **Help**: `/help`

## 📞 13. Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all environment variables
3. Check Stripe webhook logs
4. Review Supabase database logs
5. Test with Stripe test cards

---

## 🎉 Congratulations!

You now have a complete subscription-based SaaS platform with:
- ✅ Stripe payment processing
- ✅ Supabase database integration
- ✅ Clerk authentication
- ✅ Credit-based feature access
- ✅ AI-powered resume generation
- ✅ Professional UI/UX

Your StartResume.io platform is ready for production! 🚀

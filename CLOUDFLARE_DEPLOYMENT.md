# Cloudflare Pages Deployment Guide

## Configuration Changes Made

### 1. Next.js Configuration Updates
- Changed `output` from `'standalone'` to `'export'` for static generation
- Added `trailingSlash: true` for better routing
- Set `distDir: 'out'` for Cloudflare Pages compatibility
- Added `unoptimized: true` for images (static export requirement)

### 2. Build Scripts
- Added `build:cloudflare` script for static export
- Updated build process for Cloudflare Pages

### 3. Cloudflare-Specific Files
- `_headers`: Security and caching headers
- `_redirects`: SPA routing fallback
- `wrangler.toml`: Cloudflare Pages configuration

## Important Notes

### API Routes Limitation
⚠️ **CRITICAL**: Next.js API routes (`/api/*`) don't work with static export.

**Options to handle API routes:**

1. **Cloudflare Functions** (Recommended)
   - Move API routes to `functions/` directory
   - Use Cloudflare Workers syntax
   - Example: `functions/api/user/credits.js`

2. **External API Service**
   - Deploy API routes to a separate service (Vercel, Railway, etc.)
   - Update frontend to call external API endpoints

3. **Cloudflare Workers**
   - Create separate Workers for API functionality
   - Use Workers KV for data storage

### ✅ API Routes Migration Complete:
- **Cloudflare Function**: `functions/api/[[path]].js` handles all API routes
- **Supported routes**:
  - `/api/user/credits` - User credit management
  - `/api/user/credits/consume` - Credit consumption
  - `/api/openai/*` - OpenAI API integration (mock for now)
  - `/api/webhooks/stripe` - Stripe webhook handling
  - `/api/health` - Health check endpoint
- **Mock responses**: Currently returns mock data, needs integration with actual services

## Deployment Steps

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Build for Cloudflare:**
   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Pages:**
   ```bash
   wrangler pages deploy out
   ```

## Environment Variables

Set these in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Next Steps Required

1. ✅ **Migrate API Routes**: Converted to Cloudflare Functions
2. **Complete API Integration**: Replace mock responses with actual service calls:
   - Integrate Supabase for user/credits endpoints
   - Integrate OpenAI API for AI features
   - Integrate Stripe for webhook processing
3. **Test Build**: Ensure static export works correctly
4. **Configure Webhooks**: Update Stripe webhook URLs for new deployment

## API Integration TODO

The `functions/api/[[path]].js` file currently returns mock data. To complete the integration:

1. **Add Supabase integration** for user/credits endpoints
2. **Add OpenAI API calls** for AI features
3. **Add proper Stripe webhook verification**
4. **Add authentication middleware** using Clerk
5. **Add error handling and logging**

# 🚀 StartResume.io Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Run Pre-Deployment Tests
```bash
npm run deploy:check
```

### 2. Environment Variables Setup
Create `.env.local` or set in your deployment platform:

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_BASIC_PRICE_ID=your_basic_plan_price_id
STRIPE_STANDARD_PRICE_ID=your_standard_plan_price_id
STRIPE_PRO_PRICE_ID=your_pro_plan_price_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DATABASE_URL=your_database_connection_string
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Set environment variables in Netlify dashboard

### Option 3: Docker Deployment
```bash
# Build Docker image
docker build -t startresume-app .

# Run container
docker run -p 3000:3000 --env-file .env.local startresume-app
```

### Option 4: Traditional VPS/Server
```bash
# Install dependencies
npm ci --production

# Build application
npm run build

# Start application
npm start
```

## 🔧 Post-Deployment Configuration

### 1. Clerk Authentication Setup
- Add your production domain to Clerk dashboard
- Configure redirect URLs
- Test authentication flow

### 2. Stripe Configuration
- Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Configure webhook events in Stripe dashboard
- Test payment flow

### 3. Supabase Database
- Ensure database tables are created
- Set up proper RLS policies
- Test database connectivity

### 4. Domain Configuration
- Point domain to deployment platform
- Set up SSL certificate (usually automatic)
- Configure DNS records

## 🧪 Testing Deployment

### Health Check
```bash
curl https://yourdomain.com/api/health
```

### API Endpoints Test
```bash
# Test authentication
curl https://yourdomain.com/api/user/profile

# Test AI features (requires auth)
curl -X POST https://yourdomain.com/api/generate-resume \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 🔍 Monitoring & Maintenance

### Performance Monitoring
- Set up Vercel Analytics (if using Vercel)
- Monitor Core Web Vitals
- Set up error tracking (Sentry recommended)

### Regular Maintenance
- Monitor API usage and costs
- Update dependencies regularly
- Backup database regularly
- Monitor security vulnerabilities

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Check ESLint errors: `npm run lint`
   - Verify all environment variables are set

2. **Authentication Issues**
   - Verify Clerk domain configuration
   - Check redirect URLs
   - Ensure API keys are correct

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check database permissions
   - Test connection from deployment environment

4. **Payment Processing Issues**
   - Verify Stripe webhook configuration
   - Check webhook secret
   - Test in Stripe test mode first

### Logs and Debugging
- Check deployment platform logs
- Use `console.log` for debugging (remove in production)
- Monitor API response times and errors

## 📊 Performance Optimization

### Recommended Settings
- Enable compression (already configured)
- Use CDN for static assets
- Implement caching strategies
- Optimize images and fonts
- Monitor bundle size

### Security Best Practices
- Keep dependencies updated
- Use HTTPS everywhere
- Implement rate limiting
- Regular security audits
- Monitor for vulnerabilities

## 🎯 Success Metrics
- Page load times < 3 seconds
- API response times < 500ms
- 99.9% uptime
- Zero critical security vulnerabilities
- Positive user feedback

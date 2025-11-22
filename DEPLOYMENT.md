# WanderPlan - Production Deployment Guide

This guide walks you through deploying WanderPlan to production using Vercel (frontend) and Railway/Supabase (database).

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository with your code
- ✅ Vercel account (free tier available)
- ✅ Railway/Supabase account for PostgreSQL database
- ✅ Stripe account (test mode → production mode)
- ✅ Resend account for email sending
- ✅ Vercel Blob Storage account (optional, for file uploads)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Stack                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend/API: Vercel (Next.js 14 App Router)         │
│  Database: Railway PostgreSQL / Supabase               │
│  Payments: Stripe (Production Mode)                    │
│  Email: Resend                                         │
│  File Storage: Vercel Blob Storage                     │
│  Domain: Custom domain via Vercel                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Database Setup (Railway or Supabase)

### Option A: Railway (Recommended)

1. **Create Railway Project**
   ```bash
   # Go to railway.app
   # Click "New Project" → "Provision PostgreSQL"
   ```

2. **Get Database Connection String**
   ```bash
   # In Railway dashboard:
   # 1. Click your PostgreSQL service
   # 2. Go to "Connect" tab
   # 3. Copy "Postgres Connection URL"

   # Format:
   # postgresql://postgres:PASSWORD@HOSTNAME:5432/railway
   ```

3. **Configure Connection Pooling (Recommended for Production)**
   ```bash
   # Railway provides connection pooling by default
   # Max connections: 100 (adjust in Railway settings if needed)
   ```

### Option B: Supabase

1. **Create Supabase Project**
   ```bash
   # Go to supabase.com
   # Click "New Project"
   # Choose region closest to your users
   ```

2. **Get Database Connection String**
   ```bash
   # In Supabase dashboard:
   # 1. Go to Settings → Database
   # 2. Copy "Connection string" (Connection pooling enabled)

   # Format:
   # postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
   ```

3. **Enable Connection Pooling**
   ```bash
   # Supabase provides Supavisor connection pooler
   # Use the pooled connection string (port 6543)
   ```

---

## Step 2: Run Database Migrations

1. **Set DATABASE_URL Locally**
   ```bash
   # Add to .env (do NOT commit this file)
   DATABASE_URL="your-production-database-url"
   ```

2. **Push Prisma Schema to Production Database**
   ```bash
   npx prisma db push
   ```

3. **Verify Migration**
   ```bash
   npx prisma studio
   # Should open Prisma Studio connected to production DB
   # Verify all tables exist
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

---

## Step 3: Stripe Setup (Production Mode)

1. **Switch to Live Mode**
   ```bash
   # In Stripe Dashboard:
   # 1. Toggle "Test mode" → "Live mode" (top right)
   # 2. Activate your Stripe account (business verification required)
   ```

2. **Get Live API Keys**
   ```bash
   # Stripe Dashboard → Developers → API Keys

   STRIPE_SECRET_KEY="sk_live_..."       # Keep this secret!
   STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Can be public
   ```

3. **Configure Webhook Endpoint**
   ```bash
   # Stripe Dashboard → Developers → Webhooks → Add endpoint

   # Endpoint URL: https://your-domain.com/api/stripe/webhook
   # Events to send:
   #   - checkout.session.completed
   #   - payment_intent.succeeded
   #   - payment_intent.payment_failed
   #   - customer.subscription.created
   #   - customer.subscription.updated
   #   - customer.subscription.deleted

   # After creating, copy the "Signing secret":
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

4. **Test Webhook (After Vercel Deployment)**
   ```bash
   # Use Stripe CLI to test webhook
   stripe listen --forward-to https://your-domain.com/api/stripe/webhook

   # Trigger test payment
   stripe trigger payment_intent.succeeded
   ```

---

## Step 4: Email Setup (Resend)

1. **Verify Domain**
   ```bash
   # Resend Dashboard → Domains → Add Domain
   # Add your domain (e.g., wanderplan.com)
   # Add DNS records provided by Resend
   ```

2. **Get API Key**
   ```bash
   # Resend Dashboard → API Keys → Create API Key

   RESEND_API_KEY="re_..."
   FROM_EMAIL="noreply@yourdomain.com"  # Must match verified domain
   FROM_NAME="WanderPlan"
   ```

3. **Test Email Sending**
   ```bash
   # After deployment, test password reset flow
   # Should receive email at verified sending address
   ```

---

## Step 5: Vercel Deployment

### 5.1 Connect GitHub Repository

1. **Import Project to Vercel**
   ```bash
   # Go to vercel.com → "Add New Project"
   # Import your GitHub repository
   # Select root directory
   ```

2. **Configure Build Settings**
   ```bash
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### 5.2 Set Environment Variables

**In Vercel Dashboard → Settings → Environment Variables**, add:

```bash
# Database
DATABASE_URL="postgresql://..." # From Railway/Supabase

# NextAuth
NEXTAUTH_URL="https://your-domain.com"  # Your production URL
NEXTAUTH_SECRET="..." # Generate: openssl rand -base64 32

# Email (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="WanderPlan"

# Stripe (LIVE mode)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# File Upload (Vercel Blob) - Optional
BLOB_READ_WRITE_TOKEN="..." # From Vercel Blob dashboard

# External APIs (Optional)
OPENWEATHER_API_KEY="..." # For weather forecasts
FOURSQUARE_API_KEY="..." # For POI search

# App Config
NODE_ENV="production"
```

**⚠️ CRITICAL SECURITY**:
- ✅ Use different `NEXTAUTH_SECRET` than development
- ✅ Use Stripe **LIVE** keys, not test keys
- ✅ Verify `DATABASE_URL` points to production database
- ✅ Set `NEXTAUTH_URL` to your production domain (no trailing slash)

### 5.3 Deploy

```bash
# Vercel will automatically deploy on:
# 1. Push to main branch
# 2. Manual deployment trigger

# First deployment:
# 1. Click "Deploy"
# 2. Wait ~2-5 minutes
# 3. Vercel will assign a URL: https://your-project.vercel.app
```

### 5.4 Custom Domain (Optional)

1. **Add Domain in Vercel**
   ```bash
   # Vercel Dashboard → Settings → Domains
   # Add your custom domain (e.g., wanderplan.com)
   ```

2. **Configure DNS**
   ```bash
   # Add DNS records (provided by Vercel):
   # Type: A, Name: @, Value: 76.76.21.21
   # Type: CNAME, Name: www, Value: cname.vercel-dns.com
   ```

3. **Update Environment Variables**
   ```bash
   # Update these to use custom domain:
   NEXTAUTH_URL="https://wanderplan.com"
   NEXT_PUBLIC_APP_URL="https://wanderplan.com"

   # Redeploy after updating
   ```

4. **Update Stripe Webhook URL**
   ```bash
   # Stripe Dashboard → Webhooks → Edit endpoint
   # Update URL to: https://wanderplan.com/api/stripe/webhook
   ```

---

## Step 6: Vercel Blob Storage (File Uploads)

1. **Enable Vercel Blob**
   ```bash
   # Vercel Dashboard → Storage → Create Database → Blob
   # Follow prompts to create blob store
   ```

2. **Get Access Token**
   ```bash
   # Vercel automatically creates environment variable:
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

   # This is auto-injected, no manual setup needed
   ```

3. **Verify Upload Functionality**
   ```bash
   # Test file upload in production (user avatar, trip photos)
   ```

---

## Step 7: Post-Deployment Verification

### 7.1 Health Checks

```bash
# 1. Visit your production URL
https://your-domain.com

# 2. Verify pages load:
✅ Homepage
✅ Login page
✅ Registration page
✅ Dashboard (after login)

# 3. Test authentication flow:
✅ Register new user
✅ Verify email (check inbox)
✅ Login
✅ Password reset

# 4. Test Stripe payment (LIVE mode - use real card):
⚠️ Use a real card to test (will be charged)
✅ Checkout session created
✅ Payment succeeds
✅ Webhook received
✅ Database updated

# 5. Test CRM features:
✅ Create client
✅ Create proposal
✅ Create invoice
✅ Email invoice

# 6. Test landing page lead capture:
✅ Visit public landing page
✅ Submit lead form
✅ Lead appears in CRM
```

### 7.2 Performance Check

```bash
# Run Lighthouse audit
# 1. Open Chrome DevTools (F12)
# 2. Go to "Lighthouse" tab
# 3. Select "Performance" + "Accessibility"
# 4. Click "Analyze page load"

# Target scores:
✅ Performance: >80
✅ Accessibility: >90
✅ Best Practices: >90
✅ SEO: >80
```

### 7.3 Error Monitoring

```bash
# Check Vercel logs for errors:
# Vercel Dashboard → Deployments → [Latest] → Logs

# Look for:
❌ 500 errors (server errors)
❌ Database connection failures
❌ Stripe webhook failures
❌ Email sending failures
```

---

## Step 8: Monitoring & Maintenance

### 8.1 Setup Vercel Analytics (Optional)

```bash
# Vercel Dashboard → Analytics → Enable
# Provides:
# - Page view tracking
# - Web vitals monitoring
# - User behavior insights
```

### 8.2 Database Backups

**Railway:**
```bash
# Railway provides automatic daily backups
# Manual backup:
# Railway Dashboard → PostgreSQL → Backups → Create Backup
```

**Supabase:**
```bash
# Supabase provides automatic backups
# Free tier: Daily backups (7-day retention)
# Pro tier: Point-in-time recovery
```

### 8.3 Security Headers

Vercel automatically sets secure headers. Verify:

```bash
# Check headers:
curl -I https://your-domain.com

# Should include:
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ Strict-Transport-Security: max-age=31536000
```

### 8.4 Rate Limiting Monitoring

```bash
# Monitor rate limit hits in logs
# If seeing many 429 errors, adjust limits in:
# src/lib/auth/rate-limit.ts

# For production, consider:
# - Redis for distributed rate limiting
# - Higher limits for authenticated users
```

---

## Troubleshooting

### Issue: Database Connection Timeout

**Problem**: Vercel functions timing out connecting to database

**Solution**:
```bash
# 1. Use connection pooling (Railway/Supabase provide this)
# 2. Increase Prisma connection timeout:
# In prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
  connectionLimit = 10
}

# 3. Use Prisma Data Proxy (Enterprise)
```

### Issue: Stripe Webhook Not Received

**Problem**: Payments succeed but database not updated

**Solution**:
```bash
# 1. Verify webhook URL in Stripe dashboard
# 2. Check webhook signing secret matches STRIPE_WEBHOOK_SECRET
# 3. Check Vercel logs for webhook errors
# 4. Test webhook manually:
stripe trigger payment_intent.succeeded --api-key sk_live_...

# 5. Ensure endpoint is accessible:
curl https://your-domain.com/api/stripe/webhook
# Should return 405 Method Not Allowed (means it's live)
```

### Issue: Email Not Sending

**Problem**: Password reset emails not received

**Solution**:
```bash
# 1. Verify domain is verified in Resend
# 2. Check FROM_EMAIL matches verified domain
# 3. Check spam folder
# 4. Test API key:
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

### Issue: Build Failing on Vercel

**Problem**: Deployment fails during build

**Solution**:
```bash
# 1. Check build logs in Vercel dashboard
# 2. Common issues:
#    - Missing environment variables (DATABASE_URL, etc.)
#    - TypeScript errors (run `npm run build` locally)
#    - Prisma client not generated
#    - Missing dependencies in package.json

# 3. Force Prisma client generation in build:
# Add to package.json:
"scripts": {
  "build": "prisma generate && next build"
}
```

### Issue: NEXTAUTH_URL Mismatch

**Problem**: Authentication redirects to wrong URL

**Solution**:
```bash
# 1. Verify NEXTAUTH_URL in Vercel environment variables
# 2. Should match your domain exactly (no trailing slash)
# 3. Redeploy after changing
# 4. Clear browser cookies and try again
```

---

## Rollback Procedure

If deployment fails or causes issues:

### Option 1: Instant Rollback (Vercel)

```bash
# Vercel Dashboard → Deployments → Previous deployment
# Click "..." → "Promote to Production"
# Takes effect immediately (~30 seconds)
```

### Option 2: Database Rollback

```bash
# Railway: Restore from backup
# Railway Dashboard → PostgreSQL → Backups → [Select backup] → Restore

# Supabase: Point-in-time recovery (Pro tier only)
# Supabase Dashboard → Database → Backups → Restore
```

### Option 3: Code Rollback

```bash
# Git revert and redeploy
git revert HEAD
git push origin main
# Vercel auto-deploys
```

---

## Production Checklist

Before going live, verify:

- [ ] Database migrated and verified
- [ ] All environment variables set in Vercel
- [ ] Stripe in LIVE mode with webhook configured
- [ ] Email domain verified and sending works
- [ ] Custom domain configured (if applicable)
- [ ] Authentication flow tested (register, login, reset)
- [ ] Payment flow tested with real card
- [ ] CRM features tested (clients, proposals, invoices)
- [ ] Landing page lead capture tested
- [ ] Lighthouse scores >80
- [ ] No errors in Vercel logs
- [ ] Database backups enabled
- [ ] Rate limiting tested and verified
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers present
- [ ] Test user data cleared from database

---

## Cost Estimation

### Free Tier (MVP/Testing)

```
Vercel:           Free (100GB bandwidth, 100 deployments/day)
Railway:          Free ($5 credit/month, ~500 hours)
Supabase:         Free (500MB database, 50,000 monthly active users)
Stripe:           Free (pay per transaction: 2.9% + $0.30)
Resend:           Free (3,000 emails/month)
Vercel Blob:      Free (100GB storage)

Total: $0/month (within free tier limits)
```

### Production (Small Business)

```
Vercel Pro:       $20/month (1TB bandwidth, unlimited deployments)
Railway:          $10/month (8GB RAM, 500GB bandwidth)
Stripe:           2.9% + $0.30 per transaction
Resend:           $20/month (50,000 emails/month)
Domain:           $12/year (via Vercel or Namecheap)

Total: ~$50/month + transaction fees
```

### Scaling (High Traffic)

```
Vercel Enterprise: Custom pricing
Railway Scale:     $20-100/month (based on usage)
Supabase Pro:      $25/month (8GB database, 100,000 MAU)
Stripe:            Lower fees with volume
Resend Business:   $80/month (200,000 emails/month)

Total: ~$200-500/month + transaction fees
```

---

## Next Steps

After deployment:

1. **Monitor Performance**: Set up Vercel Analytics
2. **User Feedback**: Create feedback form for early users
3. **Iterate**: Fix bugs, add features based on usage
4. **Scale**: Upgrade plans as traffic grows
5. **Security**: Regular dependency updates (`npm audit`)
6. **Backups**: Test restore procedure monthly

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Deployed successfully?** 🎉

Your WanderPlan instance is now live and ready for users!

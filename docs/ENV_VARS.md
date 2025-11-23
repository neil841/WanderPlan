# Environment Variables Guide

> Complete reference for all environment variables in WanderPlan

**Last Updated**: November 2024

---

## Table of Contents

1. [Required Variables](#required-variables)
2. [Optional Variables](#optional-variables)
3. [Environment-Specific](#environment-specific)
4. [Getting API Keys](#getting-api-keys)
5. [Security Best Practices](#security-best-practices)

---

## Required Variables

These variables MUST be set for WanderPlan to function.

### Database

#### `DATABASE_URL`
**Description**: PostgreSQL connection string

**Format**:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
```

**Example** (Local):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/wanderplan"
```

**Example** (Railway):
```env
DATABASE_URL="postgresql://postgres:PASSWORD@monorail.proxy.rlwy.net:12345/railway"
```

**Example** (Supabase):
```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
```

**Notes**:
- Use connection pooling URL for production (port 6543 for Supabase)
- Never commit this to git
- Different for each environment (dev, staging, production)

---

### Authentication

#### `NEXTAUTH_URL`
**Description**: Base URL of your application

**Format**: Full URL (no trailing slash)

**Example** (Local):
```env
NEXTAUTH_URL="http://localhost:3000"
```

**Example** (Production):
```env
NEXTAUTH_URL="https://wanderplan.com"
```

**Notes**:
- Must match your deployed URL exactly
- Used for OAuth callbacks
- Update when changing domains

---

#### `NEXTAUTH_SECRET`
**Description**: Secret key for encrypting session tokens

**How to Generate**:
```bash
openssl rand -base64 32
```

**Example**:
```env
NEXTAUTH_SECRET="jA3K9mN2pQ5rS8tU1vX4yZ7bC0dE6fG9hJ2kL5mN8pQ1rS4tU7vX0yZ3bC6dE9fG"
```

**Notes**:
- MUST be different in production vs development
- At least 32 characters
- Keep this secret - never commit to git
- Rotating this will invalidate all sessions

---

### Email (Resend)

#### `RESEND_API_KEY`
**Description**: API key for Resend email service

**How to Get**: [Sign up at resend.com](https://resend.com) → API Keys → Create

**Format**: Starts with `re_`

**Example**:
```env
RESEND_API_KEY="re_123456789_ABCdefGHIjklMNOpqrSTUvwxYZ"
```

**Notes**:
- Free tier: 3,000 emails/month
- Paid plans start at $20/month (50,000 emails)
- Different API keys for dev/production recommended

---

#### `FROM_EMAIL`
**Description**: Sender email address

**Format**: Valid email address from verified domain

**Example**:
```env
FROM_EMAIL="noreply@wanderplan.com"
```

**Notes**:
- Domain must be verified in Resend
- Cannot use generic domains (gmail.com, yahoo.com)
- Common sender names: noreply@, hello@, team@

---

#### `FROM_NAME`
**Description**: Sender display name

**Example**:
```env
FROM_NAME="WanderPlan"
```

**Notes**:
- Shown in email client as sender name
- Keep it short and recognizable

---

## Optional Variables

These variables enable additional features but aren't required for basic functionality.

### Payments (Stripe)

#### `STRIPE_SECRET_KEY`
**Description**: Stripe secret API key (server-side)

**How to Get**: [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API Keys

**Format**:
- Test mode: `sk_test_...`
- Live mode: `sk_live_...`

**Example**:
```env
STRIPE_SECRET_KEY="sk_test_51234567890abcdefghijklmnopqrstuvwxyz"
```

**Notes**:
- Use test keys in development
- Switch to live keys in production only
- Never expose secret keys in frontend code

---

#### `STRIPE_PUBLISHABLE_KEY`
**Description**: Stripe publishable API key (client-side)

**Format**:
- Test mode: `pk_test_...`
- Live mode: `pk_live_...`

**Example**:
```env
STRIPE_PUBLISHABLE_KEY="pk_test_51234567890abcdefghijklmnopqrstuvwxyz"
```

**Notes**:
- Safe to expose in frontend
- Must match secret key environment (test with test, live with live)

---

#### `STRIPE_WEBHOOK_SECRET`
**Description**: Webhook signing secret for verifying Stripe events

**How to Get**: Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret

**Format**: Starts with `whsec_`

**Example**:
```env
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdefghijklmnopqrstuvwxyz"
```

**Notes**:
- Different for each webhook endpoint
- Ensures webhook events come from Stripe
- Required for processing payments

---

#### `NEXT_PUBLIC_APP_URL`
**Description**: Public-facing app URL (for Stripe redirects)

**Format**: Full URL (no trailing slash)

**Example**:
```env
NEXT_PUBLIC_APP_URL="https://wanderplan.com"
```

**Notes**:
- Prefix `NEXT_PUBLIC_` makes it available in browser
- Used for Stripe success/cancel URLs

---

### File Storage (Vercel Blob)

#### `BLOB_READ_WRITE_TOKEN`
**Description**: Vercel Blob storage access token

**How to Get**: Vercel Dashboard → Storage → Blob → Connect

**Example**:
```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
```

**Notes**:
- Auto-generated when connecting Vercel Blob
- Free tier: 100GB storage
- Handles file uploads (avatars, trip photos, documents)

---

### Google Calendar Integration

#### `GOOGLE_CLIENT_ID`
**Description**: Google OAuth 2.0 Client ID

**How to Get**:
1. [Google Cloud Console](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI: `{NEXTAUTH_URL}/api/integrations/google-calendar/callback`

**Format**: Ends with `.apps.googleusercontent.com`

**Example**:
```env
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
```

---

#### `GOOGLE_CLIENT_SECRET`
**Description**: Google OAuth 2.0 Client Secret

**How to Get**: Same as Client ID (shown after creation)

**Example**:
```env
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```

**Notes**:
- Keep this secret
- Used for OAuth token exchange

---

#### `GOOGLE_REDIRECT_URI`
**Description**: OAuth callback URL

**Format**: `{NEXTAUTH_URL}/api/integrations/google-calendar/callback`

**Example**:
```env
GOOGLE_REDIRECT_URI="https://wanderplan.com/api/integrations/google-calendar/callback"
```

**Notes**:
- Must exactly match authorized redirect URI in Google Console
- Update when changing domains

---

### External APIs

#### `OPENWEATHER_API_KEY`
**Description**: OpenWeather API key for weather forecasts

**How to Get**: [OpenWeather](https://openweathermap.org/api) → Sign up → API Keys

**Example**:
```env
OPENWEATHER_API_KEY="1234567890abcdefghijklmnopqrstuvw"
```

**Notes**:
- Free tier: 60 calls/minute, 1M calls/month
- Optional - weather features disabled without it

---

#### `FOURSQUARE_API_KEY`
**Description**: Foursquare Places API key for POI search

**How to Get**: [Foursquare Developers](https://developer.foursquare.com) → Create app → API Key

**Example**:
```env
FOURSQUARE_API_KEY="fsq3abcdefghijklmnopqrstuvwxyz1234567890"
```

**Notes**:
- Free tier: 10,000 calls/month
- Optional - POI search uses OpenStreetMap as fallback

---

## Environment-Specific

### Development (.env.local)

```env
# Database (local PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/wanderplan"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-generate-with-openssl-rand-base64-32"

# Email (Resend - test mode)
RESEND_API_KEY="re_test_1234567890"
FROM_EMAIL="test@example.com"
FROM_NAME="WanderPlan Dev"

# Stripe (test mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional
OPENWEATHER_API_KEY="your-key-here"
FOURSQUARE_API_KEY="your-key-here"

# App Config
NODE_ENV="development"
```

---

### Production (Vercel)

Set in Vercel Dashboard → Settings → Environment Variables:

```env
# Database (Railway/Supabase - connection pooling enabled)
DATABASE_URL="postgresql://postgres:PASSWORD@production-host:5432/database"

# NextAuth
NEXTAUTH_URL="https://wanderplan.com"
NEXTAUTH_SECRET="production-secret-MUST-BE-DIFFERENT-from-dev"

# Email (Resend - verified domain)
RESEND_API_KEY="re_live_1234567890"
FROM_EMAIL="noreply@wanderplan.com"
FROM_NAME="WanderPlan"

# Stripe (LIVE mode - production keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_live_..."
NEXT_PUBLIC_APP_URL="https://wanderplan.com"

# Vercel Blob (auto-generated)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Google Calendar (production OAuth)
GOOGLE_CLIENT_ID="prod-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-prod-secret"
GOOGLE_REDIRECT_URI="https://wanderplan.com/api/integrations/google-calendar/callback"

# Optional
OPENWEATHER_API_KEY="your-key-here"
FOURSQUARE_API_KEY="your-key-here"

# App Config
NODE_ENV="production"
```

---

## Getting API Keys

### Resend (Email)

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Add and verify your domain:
   - Dashboard → Domains → Add Domain
   - Add DNS records (MX, TXT, CNAME)
   - Wait for verification (~10 minutes)
4. Create API Key:
   - Dashboard → API Keys → Create
   - Copy and save immediately

**Free Tier**: 3,000 emails/month

---

### Stripe (Payments)

1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Get test keys:
   - Dashboard → Developers → API Keys
   - Copy "Publishable key" and "Secret key"
4. Set up webhook:
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret
5. For production:
   - Activate account (business verification)
   - Switch to Live mode
   - Get live keys (same steps as test)

**Fees**: 2.9% + $0.30 per transaction

---

### Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "WanderPlan"
3. Enable Google Calendar API:
   - APIs & Services → Library
   - Search "Google Calendar API"
   - Enable
4. Create OAuth credentials:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/integrations/google-calendar/callback` (dev)
     - `https://wanderplan.com/api/integrations/google-calendar/callback` (prod)
   - Save and copy Client ID and Client Secret

**Cost**: Free (up to 1B requests/day)

---

### Vercel Blob

1. Go to Vercel Dashboard
2. Select your project
3. Storage → Create Database → Blob
4. Connect to your project
5. Token is auto-generated and added to environment variables

**Free Tier**: 100GB storage

---

### OpenWeather (Optional)

1. Go to [openweathermap.org](https://openweathermap.org)
2. Sign up for free account
3. API Keys → Create
4. Copy API key

**Free Tier**: 60 calls/minute, 1M calls/month

---

### Foursquare (Optional)

1. Go to [developer.foursquare.com](https://developer.foursquare.com)
2. Sign up
3. Create new app
4. Copy API key

**Free Tier**: 10,000 calls/month

---

## Security Best Practices

### Never Commit Secrets

**❌ Don't**:
```bash
# Committed .env file
git add .env
git commit -m "Add env file"
```

**✅ Do**:
```bash
# .gitignore includes .env
echo ".env" >> .gitignore
git add .gitignore
```

---

### Use Different Keys Per Environment

**❌ Don't**:
- Use production database in development
- Use live Stripe keys in development
- Share secrets between dev/prod

**✅ Do**:
- Separate dev/staging/production environments
- Different API keys for each
- Different database instances

---

### Rotate Secrets Regularly

**When to Rotate**:
- Every 90 days (scheduled)
- After team member leaves
- If key is compromised
- Before production launch

**How to Rotate**:
1. Generate new secret
2. Update in all environments
3. Deploy changes
4. Revoke old secret

---

### Use Environment-Specific Prefixes

```env
# Clear naming
DEV_DATABASE_URL="..."
STAGING_DATABASE_URL="..."
PROD_DATABASE_URL="..."
```

---

### Validate on Startup

Add to `src/lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith('re_'),
  FROM_EMAIL: z.string().email(),
});

export const env = envSchema.parse(process.env);
```

This ensures all required variables are set and valid at build time.

---

## Troubleshooting

### "Missing DATABASE_URL"

**Cause**: Environment variable not set

**Solution**:
```bash
# Check .env exists
ls -la .env

# Check value is set
cat .env | grep DATABASE_URL

# Restart dev server
npm run dev
```

---

### "Invalid NEXTAUTH_URL"

**Cause**: URL mismatch with deployed domain

**Solution**:
1. Verify `NEXTAUTH_URL` matches your domain exactly
2. No trailing slash
3. Must be HTTPS in production
4. Redeploy after changing

---

### "Stripe webhook signature verification failed"

**Cause**: Wrong webhook secret

**Solution**:
1. Get signing secret from Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET`
3. Ensure endpoint URL matches webhook URL in Stripe
4. Redeploy

---

### "Resend emails not sending"

**Cause**: Domain not verified or wrong API key

**Solution**:
1. Check domain verification in Resend dashboard
2. Verify DNS records are correct
3. Check `FROM_EMAIL` matches verified domain
4. Verify `RESEND_API_KEY` is correct
5. Check Resend logs for errors

---

## Quick Reference

### Minimal .env (Development)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/wanderplan"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
RESEND_API_KEY="re_..."
FROM_EMAIL="test@example.com"
FROM_NAME="WanderPlan"
```

### Full .env (Production)

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://wanderplan.com"
NEXTAUTH_SECRET="..."
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@wanderplan.com"
FROM_NAME="WanderPlan"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="https://wanderplan.com"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Google Calendar
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_REDIRECT_URI="https://wanderplan.com/api/integrations/google-calendar/callback"

# Optional
OPENWEATHER_API_KEY="..."
FOURSQUARE_API_KEY="..."
NODE_ENV="production"
```

---

## Support

For questions about environment variables:
- Check documentation: [docs.wanderplan.com](https://docs.wanderplan.com)
- Email: support@wanderplan.com
- GitHub Issues: Report configuration issues

---

**Last Updated**: November 2024

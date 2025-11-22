# Stripe Setup Guide - WanderPlan

Complete guide for setting up Stripe integration for local development and testing.

## Table of Contents

1. [Overview](#overview)
2. [Account Setup](#account-setup)
3. [Local Development Setup](#local-development-setup)
4. [Webhook Testing](#webhook-testing)
5. [Test Card Numbers](#test-card-numbers)
6. [Testing Scenarios](#testing-scenarios)
7. [Troubleshooting](#troubleshooting)
8. [Production Checklist](#production-checklist)

---

## Overview

WanderPlan uses Stripe for:

- 💳 **Subscription Payments** - Monthly/annual plans for travel agents
- 📄 **Invoice Payments** - Client invoice payments via link
- 🔔 **Webhooks** - Real-time payment status updates
- 📊 **Payment Analytics** - Track revenue and payment metrics

**Integration Type**: Stripe Checkout (hosted payment page)

**Stripe API Version**: 2024-11-20.acacia (configured in Stripe dashboard)

---

## Account Setup

### 1. Create Stripe Account

```bash
# Go to: https://stripe.com
# Click "Sign up" → Create account
# Choose "Start now" (free)
```

### 2. Complete Business Profile (Optional for Testing)

```bash
# Stripe Dashboard → Settings → Business settings
# Fill in:
# - Business name: WanderPlan (or your name)
# - Type: Individual (for testing)
# - Country: Your country

# ⚠️ For production: Full business verification required
```

### 3. Enable Test Mode

```bash
# Stripe Dashboard → Toggle "Test mode" (top right)
# Should show orange "Test mode" badge
# All API calls use test keys (sk_test_... / pk_test_...)
```

---

## Local Development Setup

### Step 1: Get API Keys

1. **Navigate to API Keys**
   ```bash
   # Stripe Dashboard → Developers → API keys
   # Ensure "Test mode" is enabled (orange badge)
   ```

2. **Copy Keys to .env**
   ```bash
   # Create/edit .env file in project root:

   # Stripe Test Keys
   STRIPE_SECRET_KEY="sk_test_51..." # Starts with sk_test_
   STRIPE_PUBLISHABLE_KEY="pk_test_51..." # Starts with pk_test_
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Webhook secret (we'll add this later after webhook setup)
   STRIPE_WEBHOOK_SECRET="whsec_..." # Leave blank for now
   ```

   **⚠️ SECURITY**: Never commit .env file to git!

3. **Verify .gitignore**
   ```bash
   # Ensure .env is in .gitignore:
   echo ".env" >> .gitignore
   ```

### Step 2: Install Stripe CLI (Required for Webhook Testing)

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (via Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

**Verify Installation:**
```bash
stripe --version
# Should output: stripe version X.X.X
```

### Step 3: Login to Stripe CLI

```bash
# Authenticate with your Stripe account
stripe login

# This will:
# 1. Open browser for authorization
# 2. Save credentials locally
# 3. Enable webhook forwarding
```

---

## Webhook Testing

Stripe webhooks allow your app to receive real-time payment updates. For local development, we use the Stripe CLI to forward webhooks to localhost.

### Step 1: Start Webhook Forwarding

```bash
# In a separate terminal, run:
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Output:
# > Ready! You are using Stripe API Version [2024-11-20]. Your webhook signing secret is whsec_... (^C to quit)

# Copy the webhook signing secret (whsec_...)
```

### Step 2: Add Webhook Secret to .env

```bash
# Update .env with the webhook signing secret:
STRIPE_WEBHOOK_SECRET="whsec_..."

# ⚠️ This secret changes each time you run `stripe listen`
# Update .env each time you restart webhook forwarding
```

### Step 3: Restart Your Dev Server

```bash
# Stop your dev server (Ctrl+C)
# Restart to load new STRIPE_WEBHOOK_SECRET
npm run dev
```

### Step 4: Verify Webhook Connection

```bash
# Keep webhook forwarding running
# In webhook terminal, you should see:
# > Ready! Listening for webhook events...

# Trigger a test event:
stripe trigger payment_intent.succeeded

# You should see in webhook terminal:
# --> payment_intent.succeeded [200]

# And in your dev server logs:
# [POST /api/stripe/webhook] Received event: payment_intent.succeeded
```

---

## Test Card Numbers

Use these test cards to simulate different payment scenarios:

### ✅ Success Scenarios

```bash
# Standard success
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)

# 3D Secure authentication required
Card: 4000 0027 6000 3184
# Triggers 3D Secure challenge popup
```

### ❌ Failure Scenarios

```bash
# Card declined (generic)
Card: 4000 0000 0000 0002

# Insufficient funds
Card: 4000 0000 0000 9995

# Card expired
Card: 4000 0000 0000 0069

# Incorrect CVC
Card: 4000 0000 0000 0127

# Processing error
Card: 4000 0000 0000 0119
```

### 🔄 Special Scenarios

```bash
# Refund success
Card: 4000 0000 0000 3220
# Use for testing refunds

# Dispute (chargeback)
Card: 4000 0000 0000 0259
# Triggers automatic dispute (wait 24h)
```

**Full list**: https://stripe.com/docs/testing#cards

---

## Testing Scenarios

### Scenario 1: Subscription Payment Flow

**Goal**: Test user subscribing to a monthly plan

**Steps**:

1. **Start webhook forwarding** (if not running)
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Start dev server**
   ```bash
   npm run dev
   ```

3. **Navigate to pricing page**
   ```bash
   http://localhost:3000/pricing
   ```

4. **Click "Subscribe" on a plan**

5. **Fill checkout form**
   ```
   Email: test@example.com
   Card: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   ZIP: 12345
   ```

6. **Click "Subscribe"**

7. **Verify success**
   - ✅ Redirected to success page
   - ✅ Webhook received: `checkout.session.completed`
   - ✅ Database updated: User subscription active
   - ✅ Check Stripe Dashboard → Payments (payment visible)

**Expected Webhook Events**:
```bash
--> checkout.session.completed [200]
--> payment_intent.succeeded [200]
--> customer.subscription.created [200]
```

### Scenario 2: Invoice Payment Flow

**Goal**: Test client paying an invoice via link

**Steps**:

1. **Create an invoice in CRM**
   ```bash
   # Login as travel agent
   # Navigate to CRM → Invoices → Create Invoice
   # Fill details, save as DRAFT
   ```

2. **Mark invoice as SENT**
   ```bash
   # Click "Send to Client"
   # Copy invoice payment link
   ```

3. **Open invoice link (new incognito tab)**
   ```bash
   http://localhost:3000/invoices/pay/[invoice-id]
   ```

4. **Click "Pay Now"**

5. **Fill checkout form**
   ```
   Card: 4242 4242 4242 4242
   (same as above)
   ```

6. **Verify payment**
   - ✅ Redirected to success page
   - ✅ Webhook received: `checkout.session.completed`
   - ✅ Database: Invoice status → PAID
   - ✅ Database: Invoice `paidAt` timestamp set
   - ✅ Stripe Dashboard: Payment visible

### Scenario 3: Failed Payment

**Goal**: Test handling of declined card

**Steps**:

1. **Navigate to checkout page** (pricing or invoice)

2. **Use declined card**
   ```
   Card: 4000 0000 0000 0002 (generic decline)
   ```

3. **Verify error handling**
   - ✅ Error message shown: "Your card was declined"
   - ✅ User remains on checkout page
   - ✅ Can retry with different card
   - ✅ No database changes
   - ✅ No webhook received (payment_intent.payment_failed not triggered for checkout)

### Scenario 4: Webhook Failure (Simulated)

**Goal**: Test webhook retry logic

**Steps**:

1. **Stop your dev server** (simulate downtime)

2. **Trigger payment in Stripe Dashboard**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

3. **Webhook fails** (server not running)
   ```bash
   # Webhook terminal shows:
   # --> payment_intent.succeeded [Connection refused]
   ```

4. **Restart dev server**

5. **Manually replay webhook**
   ```bash
   # Stripe Dashboard → Developers → Webhooks → Events
   # Find failed event → Click "Resend"
   # Or use CLI:
   stripe events resend evt_...
   ```

6. **Verify webhook processing**
   - ✅ Webhook processed successfully
   - ✅ Database updated retroactively

---

## Troubleshooting

### Issue: "Invalid API Key" Error

**Symptoms**:
```bash
Error: Invalid API key provided: sk_test_***
```

**Solution**:
```bash
# 1. Verify API key in .env starts with sk_test_
# 2. Check for extra spaces/newlines in .env
# 3. Restart dev server after changing .env
# 4. Verify test mode enabled in Stripe Dashboard
```

### Issue: Webhook Signature Verification Failed

**Symptoms**:
```bash
Error: Webhook signature verification failed
```

**Solution**:
```bash
# 1. Ensure STRIPE_WEBHOOK_SECRET in .env matches CLI output
# 2. Restart dev server after updating .env
# 3. Check webhook endpoint is exactly:
#    http://localhost:3000/api/stripe/webhook
# 4. Verify stripe listen is running
```

### Issue: Webhook Events Not Received

**Symptoms**:
- Payment succeeds in Stripe
- No webhook events logged in terminal
- Database not updated

**Solution**:
```bash
# 1. Check stripe listen is running:
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 2. Verify dev server is running on port 3000
npm run dev

# 3. Check firewall not blocking webhook forwarding
# 4. Try triggering test event:
stripe trigger payment_intent.succeeded

# 5. If still failing, check webhook endpoint code:
# src/app/api/stripe/webhook/route.ts
```

### Issue: Checkout Session Expired

**Symptoms**:
```bash
Error: This checkout session has expired
```

**Solution**:
```bash
# Stripe Checkout sessions expire after 24 hours
# Solution:
# 1. Create a new checkout session (don't reuse old links)
# 2. In code, check session expiration before redirecting:

const session = await stripe.checkout.sessions.retrieve(sessionId);
if (session.status === 'expired') {
  // Create new session
}
```

### Issue: Subscription Not Created

**Symptoms**:
- Checkout succeeds
- Webhook received
- But subscription not in database

**Solution**:
```bash
# 1. Check webhook handler code:
# src/app/api/stripe/webhook/route.ts

# 2. Look for errors in webhook processing:
# Console logs should show:
# [Webhook] Processing event: checkout.session.completed
# [Webhook] Subscription created: sub_...

# 3. Check database manually:
# Open Prisma Studio: npx prisma studio
# Check Subscription table for new entry

# 4. Common issues:
#    - User not found (userId mismatch)
#    - Subscription data not extracted correctly from event
#    - Database connection error
```

### Issue: 3D Secure Not Triggering

**Symptoms**:
- Using 3DS test card (4000 0027 6000 3184)
- But no authentication popup shown

**Solution**:
```bash
# This is expected in Stripe Checkout
# Stripe Checkout handles 3DS automatically
# In test mode, 3DS is simulated (not real popup)

# To test full 3DS flow:
# 1. Use Stripe Elements (custom form)
# 2. Or switch to live mode (requires real cards)
```

---

## Production Checklist

Before deploying to production:

### ✅ Pre-Deployment

- [ ] Switch Stripe account to **Live mode**
- [ ] Complete Stripe business verification
- [ ] Get **live API keys** (sk_live_..., pk_live_...)
- [ ] Configure **production webhook endpoint**
  - URL: `https://your-domain.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `payment_intent.succeeded`, etc.
- [ ] Update environment variables in Vercel:
  - `STRIPE_SECRET_KEY="sk_live_..."`
  - `STRIPE_PUBLISHABLE_KEY="pk_live_..."`
  - `STRIPE_WEBHOOK_SECRET="whsec_..."` (from production webhook)
- [ ] Test webhook endpoint is accessible:
  ```bash
  curl https://your-domain.com/api/stripe/webhook
  # Should return 405 (Method Not Allowed) - means it's live
  ```

### ✅ Post-Deployment

- [ ] Test live payment with **real card**
  - ⚠️ Use a real card (will be charged)
  - ⚠️ Use small amount ($0.50 test)
  - Refund immediately after verification
- [ ] Verify webhook received in production
  - Check Stripe Dashboard → Webhooks → Events
  - Should show successful delivery (200 OK)
- [ ] Check database updated correctly
- [ ] Monitor Stripe Dashboard for:
  - Failed payments
  - Webhook failures
  - Disputed payments
  - Refund requests

### ✅ Ongoing Monitoring

- [ ] Set up Stripe email notifications:
  - Failed payments
  - New disputes
  - Webhook failures
- [ ] Monitor Stripe Dashboard weekly:
  - Review payment success rate (target: >95%)
  - Check for unusual patterns
  - Address failed webhooks promptly
- [ ] Keep test mode active in parallel:
  - Test new features in test mode first
  - Use test mode for demos/screenshots

---

## Stripe Dashboard Navigation

### Key Pages

```bash
# Dashboard Home
https://dashboard.stripe.com

# Payments (test mode)
https://dashboard.stripe.com/test/payments

# Customers (test mode)
https://dashboard.stripe.com/test/customers

# Subscriptions (test mode)
https://dashboard.stripe.com/test/subscriptions

# Webhooks (test mode)
https://dashboard.stripe.com/test/webhooks

# API Keys (test mode)
https://dashboard.stripe.com/test/apikeys

# Events (webhook logs)
https://dashboard.stripe.com/test/events

# Logs (API request logs)
https://dashboard.stripe.com/test/logs
```

---

## Webhook Events Reference

WanderPlan listens for these Stripe webhook events:

### Payment Events

```bash
# Checkout session completed (subscription or invoice)
checkout.session.completed

# Payment succeeded (one-time or subscription)
payment_intent.succeeded

# Payment failed
payment_intent.payment_failed

# Refund issued
charge.refunded
```

### Subscription Events

```bash
# New subscription created
customer.subscription.created

# Subscription updated (plan change)
customer.subscription.updated

# Subscription cancelled
customer.subscription.deleted

# Subscription renewal (monthly billing)
invoice.payment_succeeded

# Subscription renewal failed (payment declined)
invoice.payment_failed
```

### Dispute Events

```bash
# Customer disputed payment (chargeback)
charge.dispute.created

# Dispute resolved (won or lost)
charge.dispute.closed
```

**Webhook Handler**: `src/app/api/stripe/webhook/route.ts`

---

## Useful Stripe CLI Commands

```bash
# Login to Stripe account
stripe login

# List recent events
stripe events list --limit 10

# Trigger test event
stripe trigger payment_intent.succeeded

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# View webhook event details
stripe events retrieve evt_...

# Resend failed webhook
stripe events resend evt_...

# View API request logs
stripe logs tail

# Create test customer
stripe customers create --email="test@example.com" --name="Test User"

# Create test subscription
stripe subscriptions create --customer=cus_... --price=price_...

# Create test payment intent
stripe payment_intents create --amount=1000 --currency=usd

# Refund payment
stripe refunds create --payment-intent=pi_...

# Cancel subscription
stripe subscriptions cancel sub_...
```

---

## Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing Guide**: https://stripe.com/docs/testing
- **Stripe CLI Reference**: https://stripe.com/docs/stripe-cli
- **Webhook Events**: https://stripe.com/docs/api/events/types
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## Support

**Issues with Stripe Integration?**

1. Check [Troubleshooting](#troubleshooting) section above
2. Review Stripe Dashboard → Events → Failed events
3. Check application logs for webhook errors
4. Consult Stripe documentation
5. Contact Stripe support (chat available in dashboard)

---

**Happy testing!** 🎉

Your Stripe integration is now ready for local development.

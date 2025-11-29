# Deployment Guide: Socket.IO Server on Railway

This guide walks you through deploying the standalone Socket.IO server to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- Your WanderPlan repository pushed to GitHub

## Step 1: Create New Railway Service

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **WanderPlan** repository
5. Railway will detect it as a Node.js project

## Step 2: Configure Environment Variables

In your Railway project settings, add these environment variables:

```env
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-app.vercel.app
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@hopper.proxy.rlwy.net:19585/railway
```

**Important**: 
- Replace `your-vercel-app.vercel.app` with your actual Vercel deployment URL
- You can add multiple origins separated by commas: `https://app1.vercel.app,https://app2.vercel.app`
- `DATABASE_URL` should be the same as your existing PostgreSQL connection

## Step 3: Configure Build Settings

Railway should auto-detect the start command from `railway.json`, but verify:

- **Build Command**: (leave empty, no build needed)
- **Start Command**: `node socketio-server.js`

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Railway will assign a public URL like: `https://socketio-server-production-xxxx.up.railway.app`

## Step 5: Update Vercel Environment Variables

Go to your Vercel project settings → Environment Variables:

Add or update:
```
NEXT_PUBLIC_SOCKET_URL=https://your-socketio-server.up.railway.app
```

Replace with your actual Railway Socket.IO server URL.

## Step 6: Redeploy Vercel

After updating the environment variable:
1. Go to Vercel dashboard
2. Trigger a new deployment (or push to GitHub)
3. The new deployment will use the Railway Socket.IO server

## Step 7: Test Real-Time Features

1. Open your Vercel app
2. Navigate to a trip
3. Open the same trip in another browser/tab
4. Test messaging or live updates
5. Check Railway logs to see WebSocket connections

## Monitoring

### Railway Logs
View real-time logs in Railway dashboard to see:
- Client connections
- Room joins/leaves
- Message broadcasts
- Errors

### Health Check
Your Socket.IO server has a health endpoint:
```
https://your-socketio-server.up.railway.app/health
```

## Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` includes your Vercel URL
- Check for `https://` (not `http://`)
- Ensure no trailing slashes

### Connection Failures
- Check Railway logs for errors
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
- Test the health endpoint

### Database Connection Issues
- Ensure `DATABASE_URL` is correct
- Check Railway PostgreSQL service is running

## Cost

Railway offers:
- **Free tier**: $5 credit/month (should be enough for Socket.IO server)
- **Pro plan**: $20/month for more resources

The Socket.IO server is lightweight and should run fine on the free tier for development/testing.

## Alternative: Deploy to Render

If you prefer Render over Railway:

1. Create account at https://render.com
2. New Web Service → Connect GitHub repo
3. Configure:
   - **Build Command**: (empty)
   - **Start Command**: `node socketio-server.js`
   - **Environment**: Add same variables as above
4. Deploy

Render also has a free tier.

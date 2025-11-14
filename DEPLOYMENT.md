# 🚀 Vercel Deployment Guide

## Prerequisites

1. ✅ GitHub account
2. ✅ Vercel account (https://vercel.com)
3. ✅ All environment variables from `.env.local`

---

## Step 1: Push to GitHub

```bash
cd "/home/arun/Downloads/GRC Startup/grc-platform"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: GRC Platform v1.0"

# Create GitHub repo (via GitHub website or CLI)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/grc-platform.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `pnpm build` (Vercel auto-detects)
   - **Output Directory:** `apps/web/.next`
   - **Install Command:** `pnpm install`

5. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_PB9z4DECHlGO@ep-cool-grass-ahfx8i8o-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVzaXJlZC1yb2Jpbi03Ny5jbGVyay5hY2NvdW50cy5kZXYk
   CLERK_SECRET_KEY=sk_test_6a7r7WQyXV74EkoVF6OKfBx7a6CnB7hD3qFjzkNbOW

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

6. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? grc-platform
# - In which directory is your code located? ./
# - Want to modify settings? Yes
# - Which settings? Build Command, Output Directory
# - Build Command: pnpm build
# - Output Directory: apps/web/.next

# Production deployment
vercel --prod
```

---

## Step 3: Configure Clerk for Production

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **"Domains"**
4. Add your Vercel domain: `your-app.vercel.app`
5. Update allowed redirect URLs

---

## Step 4: Update Database Connection

If needed, create a production database branch in Neon:

1. Go to https://console.neon.tech
2. Create a new branch for production
3. Update `DATABASE_URL` in Vercel environment variables

---

## Step 5: Run Database Migrations

After first deployment:

```bash
# Run Prisma migrations on production database
npx prisma migrate deploy
```

Or use Vercel CLI:

```bash
vercel env pull .env.production.local
pnpm db:push
```

---

## Troubleshooting

### Build fails with "Module not found"
- Check that all dependencies are in `package.json`
- Run `pnpm install` locally to verify

### Database connection fails
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon database allows connections from Vercel IPs

### Clerk authentication fails
- Verify domain is added in Clerk dashboard
- Check redirect URLs match production domain
- Ensure environment variables are set correctly

---

## Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] Landing page displays correctly
- [ ] Sign-up flow works
- [ ] Dashboard loads after authentication
- [ ] Company creation works
- [ ] Database writes succeed

---

## Continuous Deployment

Once connected to GitHub, Vercel automatically:
- ✅ Deploys on every push to `main`
- ✅ Creates preview deployments for PRs
- ✅ Runs build checks
- ✅ Provides deployment URLs

---

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Monitoring

- **Vercel Analytics:** https://vercel.com/docs/analytics
- **Vercel Logs:** View real-time logs in dashboard
- **Error Tracking:** We'll add Sentry in Phase 3

---

Built with 🔥 Let's ship to production!

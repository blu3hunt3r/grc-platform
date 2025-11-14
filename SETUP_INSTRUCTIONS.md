# 🚀 GRC Platform - Setup Instructions

## What We've Built So Far (Day 1 - Part 1)

✅ Project structure (monorepo with Turbo)
✅ Next.js 14 frontend with App Router
✅ Prisma database schema
✅ Landing page with features
✅ All dependencies installed

## Next Steps - YOU Need To Do This Now:

### 1. Get Your API Keys

#### **Clerk (Authentication)** - FREE
1. Go to: https://clerk.com
2. Sign up / Sign in
3. Create a new application
4. Go to "API Keys"
5. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

#### **Neon (PostgreSQL Database)** - FREE
1. Go to: https://neon.tech
2. Sign up / Sign in
3. Create a new project
4. Go to "Connection Details"
5. Copy the `DATABASE_URL` (make sure it has `?sslmode=require` at the end)

#### **Anthropic (Claude AI)** - $5 free credit
1. Go to: https://console.anthropic.com
2. Sign up / Sign in
3. Go to "API Keys"
4. Create a new API key
5. Copy the `ANTHROPIC_API_KEY`

### 2. Create Environment File

```bash
cd /home/arun/Downloads/GRC\ Startup/grc-platform
cp apps/web/.env.example apps/web/.env.local
```

Then edit `apps/web/.env.local` and add your keys:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Clerk URLs (keep these as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Anthropic (for later)
ANTHROPIC_API_KEY=sk-ant-xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Generate Prisma Client & Push Schema

```bash
cd /home/arun/Downloads/GRC\ Startup/grc-platform
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 4. Start Development Server

```bash
pnpm dev
```

Then open: http://localhost:3000

---

## What You Should See

✅ Landing page with hero section
✅ "Get Started Free" and "Sign In" buttons
✅ Features section
✅ Stats cards

---

## Once You've Done This

**Come back and tell me:**

Option A: ✅ "Everything works! I can see the landing page"

Option B: ❌ "I got an error: [paste error]"

Then I'll continue building the dashboard, company management, and more! 🚀

---

## Project Structure

```
grc-platform/
├── apps/
│   └── web/                 # Next.js frontend
│       ├── src/app/         # App Router pages
│       ├── src/components/  # React components
│       └── src/lib/         # Utilities
├── packages/
│   ├── database/            # Prisma schema
│   ├── shared/              # Shared types
│   └── agents/              # (Coming next!)
└── scripts/                 # Setup scripts
```

---

## Cost So Far: $0

- Node.js: FREE
- pnpm: FREE
- Next.js: FREE
- All libraries: FREE

**Once you add API keys:**
- Clerk: FREE (up to 10K users)
- Neon: FREE (0.5GB database)
- Anthropic: $5 free credit, then ~$10-20/month

**Total: $0-20/month** 🎉

---

Built with vibe coding! Let's keep shipping 🔥

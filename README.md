# 🚀 GRC Platform - AI-Powered Compliance Automation

**Architecture Reference:** Following `GRC_Platform_Architecture_COMPLETE_ENHANCED.md`

## Project Structure

```
grc-platform/
├── apps/
│   └── web/              # Next.js 14 frontend (App Router)
├── packages/
│   ├── database/         # Prisma ORM + PostgreSQL schema
│   ├── agents/           # AI agents (coming soon)
│   └── shared/           # Shared types and utilities
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
# 1. Copy apps/web/.env.example to apps/web/.env.local
# 2. Add your API keys (Clerk, Neon, Anthropic)

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Start development
pnpm dev
```

## Development

- Frontend: http://localhost:3000
- Database Studio: `pnpm db:studio`

## Tech Stack (Day 1)

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **UI:** shadcn/ui, Tailwind CSS
- **Database:** PostgreSQL (Neon), Prisma ORM
- **Auth:** Clerk
- **Hosting:** Vercel

## Cost: $0-20/month (Free tier everything!)

Built with vibe coding 🔥

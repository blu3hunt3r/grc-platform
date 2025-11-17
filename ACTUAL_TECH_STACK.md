# ACTUAL TECH STACK VERIFICATION

**Last Verified:** November 17, 2025

## ✅ CONFIRMED IN USE

### Infrastructure & Hosting
- **Vercel** - Frontend hosting (confirmed by user)
- **Neon** - PostgreSQL database (confirmed in `packages/database/.env`)
  - Connection: `postgresql://neondb_owner:npg_...@ep-cool-grass-ahfx8i8o-pooler.c-3.us-east-1.aws.neon.tech/neondb`
  - SSL Mode: Required
  - Pooler: Enabled

### Authentication & Authorization
- **Clerk** - User authentication (confirmed in `schema.prisma`)
  - User model has `clerkId String @unique` field
  - Email-based authentication
  - Role-based access control (UserRole enum)

### Database & ORM
- **PostgreSQL** (via Neon)
- **Prisma** ORM v5.22.0
  - Auto-generation on postinstall
  - Type-safe database access

### LLM Providers (Multi-Provider Strategy)
- **Gemini 2.5** (Primary - 3 tiers: Flash-Lite, Flash, Pro)
- **Claude Sonnet 4.5** (Fallback)
- **Helicone** - LLM observability & caching gateway

### Testing
- **Jest** v29.7.0
- **ts-jest** v29.1.5
- **@types/jest** v29.5.12

---

## ❌ NOT YET IMPLEMENTED

### Items Mentioned in Architecture But Not Configured:
- **WorkOS** - Enterprise SSO (not in use yet)
- **Doppler** - Secrets management (not in use yet)
- **Temporal** - Workflow orchestration (not in use yet)
- **LangGraph** - Agent state machines (not in use yet)
- **CrewAI** - Multi-agent coordination (not in use yet)
- **Redis/Upstash** - Caching layer (not in use yet)
- **Pinecone** - Vector database (not in use yet)
- **LangSmith** - LLM tracing (not in use yet)
- **Sentry** - Error monitoring (not in use yet)

---

## 📋 IMPLEMENTATION STATUS

### Phase 1: Foundation (COMPLETE)
- ✅ Neon PostgreSQL database
- ✅ Prisma ORM setup
- ✅ Clerk authentication schema
- ✅ LLM provider abstraction (Gemini + Claude)
- ✅ Helicone integration

### Phase 2: Database Layer (IN PROGRESS)
- ✅ Repository pattern implementation
- ✅ All 4 repositories created
- ✅ Jest configuration
- 🔄 Test execution (in progress - fixing foreign key issues)
- ⏳ Coverage measurement
- ⏳ Integration tests

### Phase 3+: Not Started
- Agent implementations
- Temporal workflows
- LangGraph state machines
- CrewAI coordination
- Additional integrations

---

## 🔧 CURRENT DEVELOPMENT ENVIRONMENT

### Database
```
Provider: Neon PostgreSQL
Region: us-east-1 (AWS)
Connection Pooling: Enabled
SSL: Required
ORM: Prisma 5.22.0
```

### Authentication
```
Provider: Clerk
User Identification: clerkId (unique string)
Email: Required unique field
Roles: Enum-based (USER, ADMIN, etc.)
```

### Testing
```
Framework: Jest
TypeScript: ts-jest
Coverage Target: >=80% (per SYSTEM_PROMPT.md)
Test Database: Shared Neon instance (needs test isolation strategy)
```

---

## ⚠️ ACTION ITEMS

1. **Test Database Strategy**: Currently tests run against production Neon DB
   - ❗ Need separate test database or better cleanup strategy
   - Consider: Neon branch databases for test isolation

2. **Secrets Management**: No Doppler yet
   - Using plain .env files
   - Need secure strategy before production

3. **Monitoring**: No observability stack yet
   - Helicone is configured for LLM calls only
   - Need Sentry for application errors

4. **Caching**: No Redis yet
   - Direct database queries
   - May need caching for production scale

---

## 📝 NOTES FOR DEVELOPMENT

- **ALWAYS check this file before assuming infrastructure is available**
- **Architecture docs describe FUTURE STATE, not current state**
- **Only use technologies listed in "✅ CONFIRMED IN USE" section**
- **Test against actual Neon database**
- **Use Clerk patterns for authentication (not WorkOS)**

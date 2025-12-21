# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokeranking is a Pokemon tier list ranking application with a NestJS backend and Next.js frontend. Users create personalized tier lists, manage Pokemon collections through "boxes," and participate in community features.

## Repository Structure

This is an npm workspace monorepo:

- `backend/` - NestJS 11 API server
- `frontend/` - Next.js 16 frontend (React 19, TailwindCSS 4, NextAuth)
- `packages/api-client/` - Generated TypeScript API client (Orval + TanStack Query)
- `frontend_old/` - Legacy Next.js frontend (deprecated)

## Common Commands

### Root Level

```bash
npm run api:export      # Export OpenAPI spec from backend
npm run api:build       # Generate and build API client
npm run api:full        # Export spec + build client (full pipeline)
```

### Backend (`cd backend`)

```bash
npm run dev       # Development server with watch mode
npm run build           # Build for production
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting

# Testing
npm run test            # Unit tests (src/**/*.spec.ts)
npm run test:watch      # Unit tests in watch mode
npm run test:e2e        # E2E tests (test/e2e/**/*.e2e-spec.ts)
npm run test:cov        # Tests with coverage

# Infrastructure
docker-compose up -d    # Start MongoDB (replica set) + Redis
```

### API Client (`cd packages/api-client`)

```bash
npm run generate        # Generate from OpenAPI spec via Orval
npm run build           # Generate + compile with tsup
```

### Frontend (`cd frontend`)

```bash
npm run dev             # Development server
npm run build           # Build for production
npm run lint            # ESLint
```

## Architecture

### Backend Module Structure

The backend follows NestJS modular architecture with global guards:

- **JwtAuthGuard** - Global authentication (use `@Public()` decorator to bypass)
- **RolesGuard** - Global role-based authorization (use `@Roles()` decorator)
- **LoggingInterceptor** - Request/response logging
- **I18nExceptionFilter** - Translates exceptions to user's language

Core modules: `AuthModule`, `UsersModule`, `PokemonModule`, `RankingsModule`, `BoxesModule`, `SupportModule`, `SentryModule`

### Key Patterns

- DTOs in `*.dto.ts` files for request/response validation
- Schemas in `*.schema.ts` with Mongoose decorators
- Services handle business logic, controllers are thin
- Redis caching via `CommonModule` (graceful degradation on failures)
- i18n translations in `src/i18n/` (en, pt-BR)

### Testing Setup

E2E tests use MongoDB Memory Server with fixtures in `test/fixtures/`. Tests run sequentially (`maxWorkers: 1`) due to shared database state. Redis and email services are mocked.

### API Client Generation

OpenAPI spec is exported to `packages/api-client/openapi.json` via `npm run export:openapi`. Orval generates typed hooks for TanStack Query.

## Environment Variables

Required for backend development:

```
MONGODB_URI=mongodb://localhost:27017/pokeranking?replicaSet=rs0
JWT_SECRET=<secret>
RESEND_API_KEY=<key>
RESEND_FROM_EMAIL=noreply@domain.com
UPSTASH_REDIS_URL=<url>
UPSTASH_REDIS_TOKEN=<token>
```

Optional for backend:

```
SENTRY_DSN=<dsn>              # Error tracking
SUPPORT_EMAIL=<email>         # Support notification emails
```

Required for frontend development:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=http://localhost:3000
```

Optional for frontend:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=<measurement-id>    # Google Analytics
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<key>          # Stripe donations
NEXT_PUBLIC_STRIPE_PRICE_ID=<price-id>            # Stripe price ID
NEXT_PUBLIC_GITHUB_URL=<url>                      # GitHub repo link
```

## Database Notes

MongoDB requires replica set mode for transaction support. The docker-compose setup handles this automatically with the `rs0` replica set.

## Commit Guidelines

When creating commits, do NOT include:
- Co-authored-by lines
- "Generated with Claude Code" or similar attribution lines

Keep commit messages clean and focused on the changes made.

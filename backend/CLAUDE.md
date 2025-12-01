# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokemon Ranking API - A NestJS backend application for managing Pokemon and user rankings with JWT authentication and role-based access control.

## Development Commands

```bash
# Install dependencies
npm install

# Development
npm run start:dev        # Watch mode with auto-reload
npm run start:debug      # Debug mode with watch

# Build
npm run build

# Production
npm run start:prod

# Testing
npm run test             # Unit tests
npm run test:watch       # Unit tests in watch mode
npm run test:e2e         # E2E tests (runs automatically in pre-commit hook)
npm run test:cov         # Test coverage report
npm run test:debug       # Debug tests with Node inspector

# Code Quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
```

## Architecture

### Core Structure

The application follows NestJS modular architecture with three main feature modules:

- **AuthModule** (`src/auth/`) - JWT-based authentication with local and JWT strategies
- **UsersModule** (`src/users/`) - User management with role-based access
- **PokemonModule** (`src/pokemon/`) - Pokemon resource management

### Global Configuration

**Guards** (Applied globally in `src/app.module.ts:38-46`):

- `JwtAuthGuard` - Validates JWT tokens on all routes by default
- `RolesGuard` - Enforces role-based access control

**Validation** (Configured in `src/main.ts:10-16`):

- Global ValidationPipe with whitelist, transform, and forbidNonWhitelisted enabled
- Uses class-validator and class-transformer for DTOs

### Authentication Flow

1. Routes are protected by default via global `JwtAuthGuard`
2. Public routes use `@Public()` decorator to bypass authentication (e.g., login, register)
3. Role-restricted routes use `@Roles(UserRole.Admin)` decorator for authorization
4. LocalStrategy validates credentials on login, JwtStrategy validates tokens on protected routes

**Key decorators:**

- `@Public()` - Bypasses JWT authentication (src/common/decorators/public.decorator.ts)
- `@Roles(...roles)` - Restricts access to specific user roles (src/common/decorators/roles.decorator.ts)

### Database Layer

MongoDB with Mongoose ODM:

- Connection configured in `src/config/database.config.ts`
- Environment validation in `src/config/environment.validation.ts`
- Schemas in `src/{module}/schemas/` directories
  - User schema: role (admin/member), email, username, password (select: false), pokemon references
  - Pokemon schema: name, image with timestamp tracking

### Testing Infrastructure

**E2E Tests** (`test/` directory):

- Uses MongoDB Memory Server for isolated test database
- Global setup/teardown in `test/setup-e2e.ts` and `test/teardown-e2e.ts`
- Test app factory in `test/utils/test-app.util.ts` replicates production setup (guards, validation)
- Fixtures in `test/fixtures/` for test data
- Auth helpers in `test/helpers/` for token generation
- E2E tests run automatically via Husky pre-commit hook

**Running single test file:**

```bash
npm run test:e2e -- test/e2e/auth.e2e-spec.ts
```

### API Documentation

Swagger UI available at `/api/docs` (development/staging only, disabled in production)

- Configured in `src/main.ts:18-52`
- Tags: auth, users, pokemon
- Bearer token authentication configured

### Environment Variables

Required (validated in `src/config/environment.validation.ts`):

- `NODE_ENV` - development | production | test
- `PORT` - Application port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret

Optional:

- `MONGODB_USER`, `MONGODB_PASSWORD` - MongoDB credentials
- `JWT_EXPIRATION` - Token expiration time (e.g., '1h')

## Important Patterns

### DTO Transformation

Use `toDto()` helper from `src/common/utils/transform.util.ts` to transform entities to response DTOs:

```typescript
return toDto(UserResponseDto, user);
```

This ensures consistent exclusion of sensitive fields (e.g., password is never included via select: false in schema).

### User Roles

Two roles defined in `src/common/enums/user-role.enum.ts`:

- `UserRole.Admin` - Full access, can register other admins
- `UserRole.Member` - Default role for new users

### Request Type

Use `AuthenticatedRequest` interface from `src/common/interfaces/authenticated-request.interface.ts` for typed request objects with user data in protected routes.

## Husky Git Hooks

Pre-commit hook runs `npm test` (e2e tests) before allowing commits. Configured in `.husky/pre-commit`.

## Code Quality Workflow

**IMPORTANT: Before running tests, ALWAYS run type check and lint check first:**

1. **Type Check** - Run `npm run build` to ensure TypeScript compilation succeeds
2. **Lint Check** - Run `npm run lint` to check for and auto-fix linting issues
3. **Tests** - Only after type and lint checks pass, run tests

This workflow prevents type errors and linting issues from appearing in test runs and ensures code quality before committing.

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:

gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:

- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results

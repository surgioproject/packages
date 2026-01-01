# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for the Surgio project containing multiple packages managed by pnpm workspaces, Lerna, and Turbo. Surgio is a network configuration management tool. The repository contains:

- **@surgio/gateway**: NestJS-based API Gateway backend that serves Surgio configuration
- **@surgio/gateway-frontend**: React-based frontend UI for the gateway (built with CRA/Craco, Tailwind CSS, MobX, shadcn/ui)
- **@surgio/logger**: Winston-based logging utility shared across packages
- **@surgio/eslint-config-surgio**: ESLint configuration for Surgio config stores

## Development Commands

### Monorepo-level Commands

```bash
# Install dependencies
pnpm install

# Build all packages (uses Turbo)
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Release management
pnpm release        # Create new version and publish
pnpm release:beta   # Create beta version and publish with beta tag
```

### Package-specific Commands

Navigate to specific packages for targeted development:

#### Gateway (packages/gateway)

```bash
# Build
pnpm build

# Development mode with watch
pnpm dev

# Start production server
pnpm start:prod

# Debug mode
pnpm debug

# Run all tests (unit + e2e)
pnpm test

# Run unit tests only
pnpm test:unit

# Run e2e tests only
pnpm test:e2e

# Watch mode for tests
pnpm test:watch

# Test with coverage
pnpm test:cov

# Lint
pnpm lint
```

#### Gateway Frontend (packages/gateway-frontend)

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Watch tests
pnpm test:watch

# Test with coverage
pnpm test:cov

# Lint
pnpm lint
```

#### Logger (packages/logger)

```bash
# Build
pnpm build

# Test
pnpm test

# Watch tests
pnpm test:watch

# Test with coverage
pnpm test:cov

# Lint
pnpm lint
```

## Architecture

### Monorepo Structure

- **Build System**: Turbo handles build orchestration with dependency-aware caching
- **Package Manager**: pnpm with workspaces (version: 10.27.0+)
- **Versioning**: Lerna with independent versioning and conventional commits
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Commit Convention**: Angular-style conventional commits (enforced by commitlint)

### Gateway Package Architecture

The gateway is a NestJS application that integrates with the main Surgio library:

**Core Bootstrap Flow**:
1. `main.ts` → `bootstrap()` in `bootstrap.ts`
2. Creates NestJS application with custom Express adapter
3. Initializes `SurgioModule` (global) with project directory from `SURGIO_PROJECT_DIR` env var
4. `SurgioHelper` loads Surgio config and initializes helper utilities
5. Serves static frontend from `@surgio/gateway-frontend/build`

**Module Organization**:
- `AppModule`: Root module, configures static file serving, global config, and middleware
- `SurgioModule`: Global module that provides `SurgioService` and `SurgioHelper` to entire app
- `ApiModule`: API endpoints for configuration management
- `AuthModule`: Authentication using Passport (cookie & bearer token strategies)

**Key Middleware**:
- `CookieParserMiddleware`: Parses cookies with secret from Surgio config hash
- `PrepareMiddleware`: Runs before controller actions (excluded from render routes)

**Deployment Options**:
- HTTP Server: `createHttpServer()` - Standard Node.js HTTP server
- Standalone: `startServer()` - Starts on configured port
- Serverless: `createLambdaHandler()` - AWS Lambda handler with lazy initialization

**Testing Strategy**:
- Unit tests: `*.spec.ts` files in `src/`
- E2E tests: `*.e2e-spec.ts` files in `__tests__/e2e/`
- Test fixtures in `__tests__/__fixtures__/`
- Separate Jest configs for unit vs e2e

### Gateway Frontend Architecture

Built with React 18, using:
- **State Management**: MobX with mobx-react-lite
- **Routing**: React Router v6
- **Data Fetching**: SWR (stale-while-revalidate)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind)
- **Styling**: Tailwind CSS with custom config
- **Build**: Create React App with Craco customization

The frontend is bundled into `build/` and served as static files by the gateway backend.

### Logger Package

Simple Winston-based logger factory:
- Provides `createLogger()` function
- Log level controlled by `SURGIO_LOG_LEVEL` env var (default: 'info')
- Formats: timestamp, label (service name), level, message
- Colorized output in non-production
- Used by gateway and main Surgio project

## Important Technical Details

### Surgio Integration

The gateway depends on the main `surgio` package (peer dependency). The `SurgioModule.register()` function:
1. Accepts `cwd` option (project directory)
2. Calls `loadConfig()` from `surgio/config` to load user's Surgio configuration
3. Creates `SurgioHelper` instance with loaded config
4. Makes helper available globally via dependency injection

### Frontend Version Tracking

The gateway sets `x-frontend-version` header on static assets (JS/CSS/JSON) to track frontend version in production.

### Workspace Dependencies

The gateway package uses `workspace:*` protocol to depend on `@surgio/gateway-frontend`, ensuring it always uses the local workspace version.

## Testing

### Running Single Tests

```bash
# Unit test for specific file
cd packages/gateway
pnpm test -- surgio.service.spec.ts

# E2E test for specific file
cd packages/gateway
pnpm test:e2e -- api.e2e-spec.ts

# Frontend test for specific file
cd packages/gateway-frontend
pnpm test -- App.test.tsx
```

### Test Setup Files

- Gateway unit tests: `__tests__/setup-tests.ts`
- Gateway e2e tests: `__tests__/setup-e2e-tests.ts`
- Frontend tests: `src/setupTests.ts`

## Release Process

1. Lerna manages versions independently for each package
2. Conventional commits determine version bumps automatically
3. `pnpm release` runs `lerna version` (prompts for confirmation) then `lerna publish from-git`
4. Beta releases use `--preid beta` flag and publish to `@beta` dist-tag
5. Build step runs automatically via `prepublishOnly` script

## Node Version Requirement

All packages require Node.js >= 18.0.0

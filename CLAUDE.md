# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for the Surgio project containing multiple packages managed by pnpm workspaces, Lerna, and Turbo. Surgio is a network configuration management tool. The repository contains:

- **@surgio/gateway**: NestJS-based API Gateway backend that serves Surgio configuration
- **@surgio/gateway-frontend**: React-based frontend UI for the gateway (built with Vite, Tailwind CSS, MobX, shadcn/ui)
- **@surgio/logger**: Winston-based logging utility shared across packages
- **@surgio/eslint-config-surgio**: ESLint configuration for Surgio config stores

## Development Commands

### Monorepo-level Commands

```bash
# Install dependencies
pnpm install

# Build all packages (uses Turbo)
pnpm run build

# Run tests across all packages
pnpm test

# Run TypeScript 6 and native TypeScript 7 checks
pnpm run test:types

# Run unit tests with Istanbul coverage
pnpm run coverage

# Validate ESM package contents and modern Node require compatibility
pnpm run test:package-output

# Run gateway e2e tests
pnpm run test:e2e

# Lint all packages
pnpm run lint

# Release management
pnpm release        # Create new version and publish
pnpm release:beta   # Create beta version and publish with beta tag
```

### Package-specific Commands

Navigate to specific packages for targeted development:

#### Gateway (packages/gateway)

```bash
# Build
pnpm run build

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
pnpm run test:e2e

# Watch mode for tests
pnpm test:watch

# Test with coverage
pnpm test:cov

# Lint
pnpm run lint
```

#### Gateway Frontend (packages/gateway-frontend)

```bash
# Development server
pnpm dev

# Build for production
pnpm run build

# Preview the production build
pnpm preview

# Run tests
pnpm test

# Watch tests
pnpm test:watch

# Test with coverage
pnpm test:cov

# Lint
pnpm run lint
```

#### Logger (packages/logger)

```bash
# Build
pnpm run build

# Test
pnpm test

# Watch tests
pnpm test:watch

# Test with coverage
pnpm test:cov

# Lint
pnpm run lint
```

## Architecture

### Monorepo Structure

- **Build System**: Turbo handles build orchestration with dependency-aware caching
- **Package Manager**: pnpm with workspaces (version: 11.22.0)
- **TypeScript**: TypeScript 6 is the configured compiler; native TypeScript 7 validates compatibility
- **Backend Framework**: NestJS 11 with Express 5
- **Frontend Build**: Vite 8 with the official React plugin
- **Test Runner**: Vitest 4 with Istanbul coverage and jsdom for frontend tests
- **Linting**: ESLint 10 with typescript-eslint and @eslint-react
- **Module System**: Native ESM with `module-sync` compatibility for Node.js `require()`
- **Formatter**: Prettier 3 (also required by the NestJS schematics toolchain)
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
- Express 5 middleware routes use named wildcards such as `{*splat}`
- The Express query parser is set to `extended` to preserve nested and array query parameters

**Deployment Options**:

- HTTP Server: `createHttpServer()` - Standard Node.js HTTP server
- Standalone: `startServer()` - Starts on configured port
- Serverless: `createLambdaHandler()` - AWS Lambda handler with lazy initialization

**Testing Strategy**:

- Unit tests: `*.spec.ts` files in `src/`
- E2E tests: `*.e2e-spec.ts` files in `__tests__/e2e/`
- Test fixtures in `__tests__/__fixtures__/`
- Separate Vitest configs for unit vs e2e
- E2E coverage includes the standard HTTP server and AWS Lambda entrypoints

### Gateway Frontend Architecture

Built with React 19, using:

- **State Management**: MobX 7 with mobx-react-lite
- **Routing**: React Router v7 declarative routes
- **Data Fetching**: SWR (stale-while-revalidate)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind)
- **Styling**: Tailwind CSS 4 with CSS-first theme configuration
- **Build**: Vite with the official React plugin

The frontend is bundled into `build/` and served as static files by the gateway backend. The Vite development server runs on port 3000 and proxies `/api`, `/get-artifact`, `/export-providers`, and `/render` to the gateway on port 4000.

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

The gateway is built as NodeNext ESM and requires Surgio v4. It imports Surgio's
native ESM subpath exports directly. User `surgio.conf.js` and provider files
remain CommonJS and are loaded with `createRequire()`.

### Frontend Version Tracking

The gateway sets `x-frontend-version` header on static assets (JS/CSS/JSON) to track frontend version in production.

### Workspace Dependencies

The gateway package uses `workspace:*` protocol to depend on `@surgio/gateway-frontend`, ensuring it always uses the local workspace version.

## Testing

### Running Single Tests

```bash
# Unit test for specific file
cd packages/gateway
pnpm run test:unit -- surgio.service.spec.ts

# E2E test for specific file
cd packages/gateway
pnpm run test:e2e -- api.e2e-spec.ts

# Frontend test for specific file
cd packages/gateway-frontend
pnpm run test:ci -- src/libs/utils.test.ts
```

### Test Setup Files

- Gateway unit tests: `__tests__/setup-tests.ts`
- Gateway e2e tests: `__tests__/setup-e2e-tests.ts`
- Frontend tests: `src/setupTests.ts`

### CI Validation

CI builds all packages, runs TypeScript 6 and native TypeScript 7 checks,
lints the workspace, validates package output, collects unit-test coverage,
and runs gateway e2e tests. Coverage is generated with Vitest and Istanbul.

The ESM and CommonJS TypeScript consumer fixtures validate the public
declarations for gateway, gateway frontend, and logger with both compilers.
The package-output test runs `pnpm pack --dry-run --json` for every published
package and checks ESM entrypoints, `module-sync` require compatibility,
declaration files, and excluded test output. It also parses the built frontend
HTML and verifies that every local JavaScript and CSS asset is present in the
published tarball.

## Release Process

1. Lerna manages versions independently for each package
2. Conventional commits determine version bumps automatically
3. `pnpm release` runs `lerna version` (prompts for confirmation) then `lerna publish from-git`
4. Beta releases use `--preid beta` flag and publish to `@beta` dist-tag
5. Build step runs automatically via `prepublishOnly` script

## Node Version Requirement

All packages require Node.js >= 22.22.2. Published packages contain one native
ESM runtime build; synchronous CommonJS consumers use Node.js `module-sync`
interop rather than a separate CommonJS artifact.

# Noitool Agent Instructions

## Overview

This is a React/TypeScript web application for Noita seed analysis and search. It uses Vite for building, Vitest for testing, and has a complex architecture involving Web Workers for computational tasks and seed searching.

## Node.js Version Requirements

**Critical:** This project requires Node.js 22.x. Node 24+ is incompatible with some native dependencies (segfault-handler).

Always use Node 22 with nvm:

```bash
source ~/.nvm/nvm.sh && nvm use 22
```

## Build & Development Commands

**Development:**

```bash
npm run dev      # Start dev server (port 3000) with hot reload
npm run dev-win  # Start server + frontend only (no C++ file watching)
```

**Build:**

```bash
npm run build           # Build for production (runs tsc && vite build)
npm run console-build   # Build console search client for compute nodes
```

**Testing:**

```bash
npm test                          # Run all tests with Vitest
npm run e2e                       # Run Cypress e2e tests (builds first)
npm test path/to/file.spec.ts     # Run a single test file
```

**Code Quality:**

```bash
npm run lint    # ESLint with TypeScript and React rules
```

Pre-commit hooks automatically run `prettier` on staged files via lint-staged.

**Validation:**

```bash
./validate-dev.sh     # Quick validation without starting servers
./validate-setup.sh   # Comprehensive validation of all fixes
```

## External API Key Handling

The app gracefully handles missing API keys and environment variables:

### Patreon Integration

If `VITE_PATREON_ID`, `VITE_PATREON_REDIRECT_URL` (frontend) or `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET` (backend) are missing:

- Backend shows warning: "Patreon OAuth client ID and secret not configured. Patreon integration will be disabled."
- Frontend shows user-friendly message instead of crashing
- Patreon-related features are disabled, core app functionality works normally

### Discord Integration

If `DISCORD_TOKEN` or `DISCORD_CLIENT_ID` are missing:

- Shows warning: "Discord integration disabled"
- Discord bot is not started (no crash)

### Backblaze B2

If `B2_APP_KEY_ID` or `B2_APP_KEY` are missing:

- Uses alternative file storage
- No functional impact

**Best Practice:** Always check for missing env vars and show warnings instead of throwing errors. Use flags like `isConfigured` to skip operations gracefully.

## Code Style Guidelines

**Formatting:**

- Prettier with `printWidth: 120` and `arrowParens: avoid`
- No semicolons (inferred from codebase style)
- Single quotes for strings (inferred from codebase style)

## Build & Development Commands

**Development:**

```bash
npm run dev      # Start dev server (port 3000) with hot reload
```

**Build:**

```bash
npm run build           # Build for production (runs tsc && vite build)
npm run console-build   # Build console search client for compute nodes
```

**Testing:**

```bash
npm test                          # Run all tests with Vitest
npm run e2e                       # Run Cypress e2e tests (builds first)
npm test path/to/file.spec.ts     # Run a single test file
```

**Code Quality:**

```bash
npm run lint    # ESLint with TypeScript and React rules
```

Pre-commit hooks automatically run `prettier` on staged files via lint-staged.

## Code Style Guidelines

**Formatting:**

- Prettier with `printWidth: 120` and `arrowParens: avoid`
- No semicolons (inferred from codebase style)
- Single quotes for strings (inferred from codebase style)

**Imports:**

- Use absolute imports for cross-module imports: `import { db } from "../../services/db"`
- Use relative imports within same module
- Follow existing import order: React/Basics → Libraries → Absolute imports → Relative imports
- Use barrel pattern: create `index.tsx` files for clean re-exports

**TypeScript:**

- Enable strict mode but `noImplicitAny: false` for flexibility
- Interface names prefixed with `I`: `IRule`, `IRandom`, `ILogicRules`
- Type aliases for unions: `IRules = IRuleRules | ILogicRules`
- Generic types for reusable components: `useLocalStorage<T>()`

**React Components:**

- Functional components with TypeScript (use `FC` type)
- PascalCase for component files: `SeedInfo.tsx`, `SearchSeeds.tsx`
- Lazy loading via `React.lazy()` for route-based code splitting
- Suspense with `LoadingComponent` as fallback
- Hooks for state management (useState, useEffect, useContext)

**Naming:**

- Components: PascalCase (e.g., `SeedInfo`, `SearchSeeds`)
- Utilities: camelCase (e.g., `helpers.ts`, `utils.ts`)
- Boolean variables: prefix with `is`, `has`, `should` (e.g., `isDev`, `hasDBError`)
- Global constants: UPPER_SNAKE_CASE (e.g., `NOITA_VERSION`)

**Error Handling:**

- Use `console.error()` for logging errors
- Wrap JSON parsing and external API calls in try/catch
- Chain `.catch()` on promises
- App-level error boundaries handle `WasmError`, `DBError`, `OutdatedVersion`

**File Structure:**

```
src/
  components/           # React components organized by feature
    SeedInfo/           # Info display components
    SearchSeeds/        # Search UI components
    LiveSeedStats/      # Live game helper
    Compute/            # Compute client UI
  services/             # Business logic
    SeedInfo/           # Core seed generation logic
      infoHandler/      # Info providers for each game system
      random/           # Random number generation
    db/                 # Database operations
    ...
  workers/              # Web Workers for heavy computations
```

**Testing:**

- Co-located test files: `*.spec.ts` or `*.spec.tsx` next to source
- Use Vitest (replaced Jest)
- Test core algorithms: seed generation, info providers, utilities
- E2E tests with Cypress in `cypress/` directory

## Key Architectural Patterns

1. **Provider Pattern**: `GameInfoProvider` orchestrates multiple `InfoProviders` for different game systems
2. **Strategy Pattern**: Separate info providers for each feature (Perk, Map, Alchemy, Shop)
3. **Worker Pattern**: Heavy computations (seed search) run in Web Workers
4. **Context Pattern**: Global state via React Context (Theme, Profile, Alchemy config)
5. **Lazy Loading**: Components loaded on-demand via `React.lazy`
6. **Modular Design**: Clear separation between UI, business logic, and data layers

## Performance Considerations

- WASM modules for computationally intensive operations
- Web Workers for seed searching to avoid blocking main thread
- Lazy loading components for better initial load time
- React.memo and useMemo where appropriate for expensive calculations

## Important Notes

- The project uses C++ code compiled to WASM for Noita's random number generation
- Map generation is incomplete and has known edge cases
- The app can run without backend except for daily seed feature
- Emscripten is required for working with C++ code
- Noita game data files need to be extracted and linked for full functionality
- **Port Conflicts:** If ports 3000/3001 are in use, Vite automatically finds alternatives (3002, 3003, etc.)
- **C++ Development:** Requires `chokidar-cli` installed globally (`npm install -g chokidar-cli`) for Node 22

## Troubleshooting

**Server crashes on startup:**

- Ensure using Node 22: `source ~/.nvm/nvm.sh && nvm use 22`
- Check for port conflicts: `lsof -ti:3000; lsof -ti:3001`
- Verify all dependencies installed: `rm -rf node_modules && npm install`

**chokidar command not found:**

```bash
source ~/.nvm/nvm.sh && nvm use 22 && npm install -g chokidar-cli
```

**Module import errors:** Ensure using Node 22, as Node 24+ has breaking changes in V8 APIs.

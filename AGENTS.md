# PROJECT KNOWLEDGE BASE

**Generated:** Thu Apr 09 2026
**Commit:** b7a6b27
**Branch:** experimental

## OVERVIEW

This is a React/TypeScript web application for Noita seed analysis and search. It uses Vite for building, Vitest for testing, and has a complex architecture involving Web Workers for computational tasks and seed searching.

## STRUCTURE

```
.
├── src/                     # Main source code
│   ├── components/          # React components organized by feature
│   ├── services/            # Business logic and data handling
│   └── workers/             # Web Workers for heavy computations
├── server/                  # Backend Node.js server
├── dataScripts/             # Data processing scripts
└── cypress/                 # End-to-end tests
```

## WHERE TO LOOK

| Task                      | Location                                   | Notes                                            |
| ------------------------- | ------------------------------------------ | ------------------------------------------------ |
| Frontend UI components    | src/components/                            | React/TypeScript components organized by feature |
| Business logic            | src/services/                              | Core seed generation logic, database operations  |
| Seed searching algorithms | src/services/seedSearcher.ts, src/workers/ | Computational tasks in Web Workers               |
| Data processing           | dataScripts/                               | Scripts for parsing Noita game data              |
| Backend server            | server/                                    | Node.js Express server with WebSocket support    |
| Tests                     | src/\*_/_.spec.ts, cypress/                | Unit tests with Vitest, E2E with Cypress         |

## CODE MAP

| Symbol           | Type    | Location                                         | Refs   | Role                                         |
| ---------------- | ------- | ------------------------------------------------ | ------ | -------------------------------------------- |
| GameInfoProvider | Class   | src/services/SeedInfo/infoHandler/index.ts       | High   | Central orchestrator for game data providers |
| SeedSearcher     | Class   | src/services/seedSearcher.ts                     | High   | Core seed search algorithm implementation    |
| InfoProviders    | Pattern | src/services/SeedInfo/infoHandler/InfoProviders/ | High   | Strategy pattern for different game systems  |
| Web Workers      | Pattern | src/workers/                                     | Medium | Parallel processing for seed computation     |

## CONVENTIONS

- No semicolons (inferred from codebase style)
- Single quotes for strings
- Prettier with `printWidth: 120` and `arrowParens: avoid`
- Functional React components with TypeScript (FC type)
- PascalCase for component files (SeedInfo.tsx, SearchSeeds.tsx)
- Barrel pattern: create `index.tsx` files for clean re-exports
- Interface names prefixed with `I`: `IRule`, `IRandom`, `ILogicRules`
- Lazy loading via `React.lazy()` for route-based code splitting

## ANTI-PATTERNS (THIS PROJECT)

- Absolute language in comments: "DO NOT", "NEVER", "ALWAYS", "DEPRECATED"
- Large files (>500 lines) in core logic modules
- Auto-generated files should not be manually modified
- Missing public directory for static assets

## UNIQUE STYLES

- Data-driven map implementations with auto-generated code
- Provider pattern for game data systems
- Worker pattern for heavy computations
- Context pattern for global state management

## COMMANDS

```bash
npm run dev      # Start dev server (port 3000) with hot reload
npm run build    # Build for production (runs tsc && vite build)
npm test         # Run all tests with Vitest
npm run e2e      # Run Cypress e2e tests (builds first)
npm run lint     # ESLint with TypeScript and React rules
```

## NOTES

- Requires Node.js 22.x (Node 24+ incompatible with segfault-handler)
- C++ code compiled to WASM for Noita's random number generation
- Map generation is incomplete and has known edge cases
- Port conflicts: Vite automatically finds alternatives (3002, 3003, etc.)
- chokidar-cli required globally for Node 22: `npm install -g chokidar-cli`

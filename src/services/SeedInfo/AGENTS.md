# SEED INFO SYSTEM

## OVERVIEW

Core seed analysis system that orchestrates multiple info providers to extract game data from Noita seeds.

## STRUCTURE

```
SeedInfo/
├── data/                # Static game data files
├── infoHandler/         # Main orchestrator and providers
├── noita_random/        # WASM-based random number generation
└── random/              # JavaScript random utilities
```

## WHERE TO LOOK

| Task                       | Location                   | Notes                                           |
| -------------------------- | -------------------------- | ----------------------------------------------- |
| Add new seed info type     | infoHandler/InfoProviders/ | Create new provider following existing patterns |
| Modify seed analysis logic | infoHandler/index.ts       | GameInfoProvider orchestrator class             |
| Random number generation   | noita_random/              | C++ compiled to WASM                            |
| Performance optimization   | performance.spec.ts        | Benchmark tests for seed analysis               |

## CONVENTIONS

- infoHandler/ contains all provider orchestration logic
- GameInfoProvider class is central to seed analysis
- Providers follow strategy pattern in InfoProviders/
- Random number generation uses WASM for performance
- Data files stored in data/ directory

## ANTI-PATTERNS

- Bypassing GameInfoProvider for seed analysis
- Direct modification of static data files without process
- Inconsistent provider interface implementation
- Performance-heavy operations not in Web Workers

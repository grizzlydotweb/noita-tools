# INFO PROVIDERS

## OVERVIEW

Strategy pattern implementation for different Noita game systems. Each provider extracts specific game data for seed analysis.

## STRUCTURE

```
InfoProviders/
├── Alchemy/
├── FungalShift/
├── Map/
├── Perk/
├── Shop/
├── Weather/
└── ... (20+ provider types)
```

## WHERE TO LOOK

| Task                           | Location                        | Notes                                  |
| ------------------------------ | ------------------------------- | -------------------------------------- |
| Add new game system provider   | Create new subdir with index.ts | Follow existing provider patterns      |
| Modify existing provider logic | ProviderName/index.ts           | Contains main provider class and logic |
| Provider testing               | ProviderName/\*.spec.ts         | Unit tests for each provider           |
| Shared provider utilities      | helpers.ts                      | Common functions used across providers |

## CONVENTIONS

- Each game system has its own provider directory
- Providers follow index.ts pattern with main class
- Providers typically have spec.ts unit tests
- Providers may have subdirectories for complex logic
- All providers implement IInfoProvider interface

## ANTI-PATTERNS

- Direct modification of provider data without abstraction
- Adding provider logic outside of provider directory structure
- Inconsistent naming between provider classes and directories
- Duplicated provider logic instead of shared utilities

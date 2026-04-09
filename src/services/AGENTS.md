# SERVICES LAYER

## OVERVIEW

Business logic layer containing core application services, data handling, and computational algorithms.

## STRUCTURE

```
services/
├── SeedInfo/           # Core seed analysis system
├── compute/            # Compute node coordination
├── imageActions/       # Image processing utilities
├── db.ts               # Database operations
├── helpers.ts          # Shared utility functions
├── seedSearcher.ts     # Seed search algorithms
└── ... (various service modules)
```

## WHERE TO LOOK

| Task                 | Location        | Notes                                 |
| -------------------- | --------------- | ------------------------------------- |
| Database operations  | db.ts           | All database interactions             |
| Seed search logic    | seedSearcher.ts | Core search algorithms                |
| Shared utilities     | helpers.ts      | Common functions used across services |
| Compute coordination | compute/        | Multi-machine search coordination     |
| Image processing     | imageActions/   | OCR and image manipulation            |

## CONVENTIONS

- Services organized by function/feature
- Clear separation between data access and business logic
- Shared utilities in helpers.ts
- Complex algorithms in dedicated modules
- Integration with Web Workers for heavy computation

## ANTI-PATTERNS

- Mixing UI logic with service logic
- Duplicated utility functions across services
- Inconsistent error handling patterns
- Direct database access outside db.ts
- Blocking operations not delegated to Web Workers

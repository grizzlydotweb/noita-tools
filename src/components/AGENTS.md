# REACT COMPONENTS

## OVERVIEW

React/TypeScript UI components organized by feature. Contains main application views and shared UI elements.

## STRUCTURE

```
components/
├── SeedInfo/           # Seed analysis UI
├── SearchSeeds/        # Seed search functionality
├── LiveSeedStats/      # Live game helper
├── Compute/            # Compute client UI
├── Profile/            # User profile management
└── ... (10+ feature directories)
```

## WHERE TO LOOK

| Task                 | Location          | Notes                              |
| -------------------- | ----------------- | ---------------------------------- |
| Add new UI feature   | Create new subdir | Follow existing component patterns |
| Modify existing view | Feature directory | Components organized by feature    |
| Shared UI elements   | misc/, Icons/     | Reusable components and icons      |
| UI testing           | \*.spec.tsx files | Component unit tests               |

## CONVENTIONS

- Components organized by feature in subdirectories
- Functional components with TypeScript (FC type)
- PascalCase for component files
- Barrel pattern with index.tsx files
- Lazy loading via React.lazy() for route splitting
- Context pattern for global state management

## ANTI-PATTERNS

- Large components with multiple responsibilities
- Direct DOM manipulation instead of React patterns
- Inconsistent component naming or structure
- Missing TypeScript types or interfaces

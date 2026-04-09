# SEED SEARCH SYSTEM

## OVERVIEW

Complex seed search functionality with rule-based filtering and Web Worker processing.

## STRUCTURE

```
SearchSeeds/
├── SearchViews/        # Search UI components
├── RuleList.tsx        # Main rule construction UI
├── RuleConstructor.tsx # Rule building components
├── SearchContext.tsx   # Search state management
└── ruleReducer.tsx     # Search rule state logic
```

## WHERE TO LOOK

| Task                     | Location                          | Notes                              |
| ------------------------ | --------------------------------- | ---------------------------------- |
| Add new search rule type | RuleList.tsx, RuleConstructor.tsx | Main UI for rule construction      |
| Modify search algorithm  | workers/                          | Computational logic in Web Workers |
| Search state management  | SearchContext.tsx                 | React context for search state     |
| Rule processing logic    | ruleReducer.tsx                   | Redux-style reducer for rules      |

## CONVENTIONS

- Rule-based search with drag-and-drop UI
- Heavy computation in Web Workers
- Context pattern for search state management
- Complex UI state with reducer pattern
- Integration with seedSearcher.ts backend

## ANTI-PATTERNS

- Blocking main thread with search computations
- Inconsistent rule processing logic
- Direct manipulation of search state outside context
- Poor performance with large rule sets

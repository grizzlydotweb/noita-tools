# MAP IMPLEMENTATIONS

## OVERVIEW

Auto-generated map implementation classes for Noita biomes. Contains over 140 files, each representing a different biome map.

## STRUCTURE

```
Map/impl/
├── Alchemistsecret.ts
├── Bossarenatop.ts
├── Bossarena.ts
├── Bosslimbsarena.ts
├── Bossvictoryroom.ts
├── Bridge.ts
├── Clouds.ts
├── Coalminealt.ts
├── Coalmine.ts
├── Crypt.ts
└── ... (130+ more biome implementations)
```

## WHERE TO LOOK

| Task                      | Location                | Notes                                                   |
| ------------------------- | ----------------------- | ------------------------------------------------------- |
| New biome implementation  | Copy existing impl file | All files follow same pattern with g\_\* config arrays  |
| Modify biome properties   | Individual .ts files    | Each file contains g_small_enemies, g_big_enemies, etc. |
| Auto-generation templates | dataScripts/            | Source data that generates these TS files               |

## CONVENTIONS

- Each file represents one biome/map type
- Files contain g\_\* configuration arrays for entity spawning
- Many spawn\_\* methods with "$ TODO: AUTO_GEN not implemented" placeholders
- Files are auto-generated - do not modify manually
- All extend Base.ts map class

## ANTI-PATTERNS

- Manually editing auto-generated files
- Adding custom logic to spawn\_\* methods that should be auto-generated
- Modifying g\_\* arrays without understanding data source

# Copilot Instructions

## Project Overview

`aos-army-builder` is a web application for building Age of Sigmar 4.0 army lists. It fetches unit data from BattleScribe XML catalogues hosted on the [BSData GitHub repository](https://github.com/BSData/age-of-sigmar-4), parses the XML into typed data structures, and allows users to compose armies with regiments, lores, and battle formations.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build tool**: Vite
- **State management**: React Context API (`src/store/armyStore.ts`)
- **Linting**: ESLint (flat config) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`
- **No test framework is currently configured**

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint the codebase
npm run lint
```

## Repository Structure

```
src/
├── App.tsx                  # Root component — renders <ArmyBuilder />
├── main.tsx                 # Entry point
├── index.css                # Global styles
├── components/              # React UI components (each has a paired .css file)
│   ├── ArmyBuilder.tsx      # Main container; manages army list collection and view state
│   ├── BuildTab.tsx         # Army building UI: regiments, lores, formations
│   ├── UnitBrowser.tsx      # Browse/search units from a faction catalogue
│   ├── ArmyRoster.tsx       # Display and edit the active army roster
│   ├── ArmySummary.tsx      # Summary view of the complete army
│   ├── AbilitiesSummary.tsx # Ability and profile summary view
│   ├── ProfileViewer.tsx    # Reusable component that renders BattleScribe profiles
│   └── ImportModal.tsx      # Modal to import an army list from New Recruit text
├── services/                # Business logic and data access
│   ├── dataFetcher.ts       # Fetches .gst/.cat XML files (local /data/ first, then GitHub)
│   ├── xmlParser.ts         # Parses BattleScribe XML into typed objects
│   ├── regimentService.ts   # Regiment validation helpers and profile collection
│   └── listParser.ts        # Parses New Recruit army list text exports
├── store/
│   └── armyStore.ts         # React Context store definition and useArmyStore hook
└── types/
    └── battlescribe.ts      # Complete TypeScript types for all BattleScribe/AoS data models
```

## Key Architecture Decisions

- **Data source**: BattleScribe XML catalogues are fetched at runtime from `/public/data/` (local) or the BSData GitHub API (remote fallback). Responses are cached in-memory.
- **XML parsing**: `xmlParser.ts` uses the browser's `DOMParser` with namespace-aware queries to convert raw XML into the types defined in `battlescribe.ts`.
- **State**: All mutable army state lives in `ArmyBuilder.tsx` and is provided to children via the `ArmyStoreContext`. Use `useArmyStore()` to access it from any component.
- **Regiment system**: A regiment is a leader + up to N companion units. Validity is determined by `getValidRegimentUnits()` in `regimentService.ts`, which checks `EnabledAffectIds` and `ConditionalCategoryIds`. Two force IDs are supported: `GHB_2025_FORCE_ID` and `GHB_2024_FORCE_ID`.
- **Wargear & enhancements**: Each `ArmyUnit` may carry `selectedWargear` (`SelectedWargear[]`), `selectedEnhancements` (`SelectedEnhancement[]`), and `selectedCommandModels` (`string[]`). Helper functions `collectAllWargearGroups()` and `collectAllCommandModelOptions()` in `regimentService.ts` recurse through `SelectionEntry` sub-entries to gather available options.
- **Per-roster uniqueness**: Heroic Traits, Artefacts of Power, and similar enhancements are enforced as unique across the entire army — each option may only be assigned to one unit per roster.
- **Styling**: Each component has a co-located `.css` file. There is no CSS preprocessor or CSS-in-JS library.

## Coding Conventions

- Use **TypeScript** for all source files (`.ts` / `.tsx`). Avoid `any`; prefer types from `battlescribe.ts`.
- React components use **function components** with hooks. No class components.
- Prefer named exports for components and utilities; default export only for `App`.
- Co-locate a `.css` file next to every new component file.
- Keep service functions **pure** where possible; side effects (fetch, cache) belong in `services/`.
- When adding new unit/catalogue types, update `src/types/battlescribe.ts` first.
- XML attribute names from BattleScribe are **camelCased** in the TypeScript types (e.g., `publicationId` not `publication-id`).
- New wargear types (`WargearOption`, `WargearOptionGroup`, `SelectedWargear`) and enhancement types (`SelectedEnhancement`) live in `battlescribe.ts` alongside the unit types that reference them.

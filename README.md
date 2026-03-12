# AoS Army Builder

A web application for building **Age of Sigmar 4.0** army lists. It fetches unit data from [BattleScribe XML catalogues](https://github.com/BSData/age-of-sigmar-4th) hosted on the BSData GitHub repository, parses them into typed data structures, and lets you compose armies with regiments, lores, and battle formations.

## Features

- **Multiple Army Lists** — Create, manage, and switch between multiple named army lists in a single session.
- **All AoS 4.0 Factions** — Supports 27+ factions and dozens of subfactions (Regiments of Renown included).
- **Regiment Builder** — Compose regiments with a leader and companion units; real-time validation enforces regiment rules.
- **Points Tracking** — Live points total with a configurable points limit (default 2 000 pts).
- **Wargear & Enhancements** — Select wargear options, Heroic Traits, Artefacts of Power, and other enhancements per unit (unique-per-roster enforcement built in).
- **Command Models** — Assign Champion, Musician, Standard Bearer, and other command model options.
- **Lore & Formation Selection** — Pick Spell Lores, Prayer Lores, Manifestation Lores, and Battle Formations for each army.
- **Auxiliary Units & Faction Terrain** — Add auxiliary units and a faction terrain piece outside of regiments.
- **Handbook Support** — Supports General's Handbook 2025-26, General's Handbook 2024-25, and multiple Path to Glory formats.
- **Army Summary** — Condensed read-only view of the complete army list ready to share.
- **Abilities Summary** — Full ability and weapon profile reference for every unit in the army.
- **Import from New Recruit** — Paste a New Recruit text export to instantly populate an army list.
- **Offline-friendly** — Catalogue files are bundled in `/public/data/` for instant local loading; GitHub is used as a fallback.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 with TypeScript |
| Build Tool | Vite |
| State Management | React Context API |
| Linting | ESLint (flat config) + `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |
| Data Source | BattleScribe XML (`.gst` / `.cat`) from [BSData/age-of-sigmar-4th](https://github.com/BSData/age-of-sigmar-4th) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/deReeperJosh/aos-army-builder.git
cd aos-army-builder

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Output is written to the `dist/` directory. Serve it with any static file host.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
├── public/
│   └── data/               # Bundled BattleScribe XML catalogues (.gst / .cat)
└── src/
    ├── App.tsx             # Root component — renders <ArmyBuilder />
    ├── main.tsx            # Entry point
    ├── index.css           # Global styles
    ├── components/         # React UI components (each has a paired .css file)
    │   ├── ArmyBuilder.tsx     # Main container; army list collection and view state
    │   ├── BuildTab.tsx        # Army building UI: regiments, lores, formations
    │   ├── UnitBrowser.tsx     # Browse/search units from a faction catalogue
    │   ├── ArmyRoster.tsx      # Display and edit the active army roster
    │   ├── ArmySummary.tsx     # Summary view of the complete army
    │   ├── AbilitiesSummary.tsx# Ability and profile summary view
    │   ├── ProfileViewer.tsx   # Renders BattleScribe profiles (weapons, abilities)
    │   └── ImportModal.tsx     # Import an army list from New Recruit text
    ├── services/           # Business logic and data access
    │   ├── dataFetcher.ts      # Fetches .gst/.cat XML (local /data/ first, then GitHub)
    │   ├── xmlParser.ts        # Parses BattleScribe XML into typed objects
    │   ├── regimentService.ts  # Regiment validation helpers and profile collection
    │   └── listParser.ts       # Parses New Recruit army list text exports
    ├── store/
    │   └── armyStore.ts        # React Context store definition and useArmyStore hook
    └── types/
        └── battlescribe.ts     # TypeScript types for all BattleScribe/AoS data models
```

## Architecture Overview

### Data Flow

1. **Fetch** — `dataFetcher.ts` loads `.gst`/`.cat` XML files from `/public/data/` first (faster, works offline), then falls back to the BSData GitHub repository. All responses are cached in-memory.
2. **Parse** — `xmlParser.ts` uses the browser's `DOMParser` with namespace-aware queries to convert raw XML into the typed structures defined in `battlescribe.ts`.
3. **State** — All mutable army state lives in `ArmyBuilder.tsx` and is provided to the component tree via `ArmyStoreContext`. Any component can access it with the `useArmyStore()` hook.
4. **Validation** — `regimentService.ts` exposes `getValidRegimentUnits()`, which inspects `EnabledAffectIds` and `ConditionalCategoryIds` to determine which units may join a regiment alongside a given leader.

### Regiment System

A regiment consists of one **leader** and up to N **companion units**. Valid companion units are determined per-leader using the BattleScribe category link data parsed from the catalogue. Two force IDs are fully supported:

| Handbook | Force ID |
|----------|---------|
| General's Handbook 2025-26 | `f079-501a-2738-6845` |
| General's Handbook 2024-25 | `f079-501a-2738-6844` |

### Wargear & Enhancements

Each `ArmyUnit` may carry:
- `selectedWargear` (`SelectedWargear[]`) — individual weapon / equipment choices.
- `selectedEnhancements` (`SelectedEnhancement[]`) — Heroic Traits, Artefacts of Power, Big Names, etc.
- `selectedCommandModels` (`string[]`) — Champion, Musician, Standard Bearer, etc.

Heroic Traits, Artefacts of Power, and similar enhancements are enforced as **unique across the entire army** — each option may only be assigned to one unit per roster.

## Supported Factions

Beasts of Chaos · Blades of Khorne · Bonesplitterz · Cities of Sigmar · Daughters of Khaine · Disciples of Tzeentch · Flesh-eater Courts · Fyreslayers · Gloomspite Gitz · Hedonites of Slaanesh · Helsmiths of Hashut · Idoneth Deepkin · Ironjawz · Kharadron Overlords · Kruleboyz · Lumineth Realm-lords · Maggotkin of Nurgle · Nighthaunt · Ogor Mawtribes · Ossiarch Bonereapers · Seraphon · Skaven · Slaves to Darkness · Sons of Behemat · Soulblight Gravelords · Stormcast Eternals · Sylvaneth

Plus all associated subfaction catalogues and Regiments of Renown.

## Data Source

Unit and rules data is sourced from the community-maintained [BSData/age-of-sigmar-4th](https://github.com/BSData/age-of-sigmar-4th) BattleScribe repository. The catalogue files in `/public/data/` are snapshots of that repository bundled for offline use.

## Contributing

Pull requests are welcome! Please ensure your changes pass the linter before submitting:

```bash
npm run lint
```

## Disclaimer

This project is an unofficial community tool and is not affiliated with or endorsed by Games Workshop. Age of Sigmar is a trademark of Games Workshop Ltd. All unit names and rules data are property of Games Workshop.
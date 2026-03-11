// BattleScribe data types for Age of Sigmar 4.0

export interface CostType {
  id: string;
  name: string;
  defaultCostLimit: number;
  hidden: boolean;
}

export interface CharacteristicType {
  id: string;
  name: string;
}

export interface ProfileType {
  id: string;
  name: string;
  sortIndex: number;
  characteristicTypes: CharacteristicType[];
}

export interface Characteristic {
  typeId: string;
  name: string;
  value: string;
}

export interface Profile {
  id: string;
  name: string;
  typeId: string;
  typeName: string;
  hidden: boolean;
  characteristics: Characteristic[];
}

export interface Cost {
  name: string;
  typeId: string;
  value: number;
}

export interface CategoryLink {
  id: string;
  name: string;
  targetId: string;
  primary: boolean;
}

export interface ForceEntry {
  id: string;
  name: string;
  hidden: boolean;
  sortIndex: number;
  childForcesLabel: string;
}

export interface GameSystem {
  id: string;
  name: string;
  revision: number;
  costTypes: CostType[];
  profileTypes: ProfileType[];
  forceEntries: ForceEntry[];
}

export interface Faction {
  id: string;
  name: string;
  filename: string;
  gameSystemId: string;
}

export interface Subfaction {
  id: string;
  name: string;
  factionName: string;
  subfactionName: string;
  filename: string;
}

export interface CatalogueLink {
  id: string;
  name: string;
  targetId: string;
  type: string;
}

export interface SelectionEntry {
  id: string;
  name: string;
  type: string; // unit, model, upgrade, etc.
  hidden: boolean;
  profiles: Profile[];
  costs: Cost[];
  categoryLinks: CategoryLink[];
  subEntries: SelectionEntry[];
}

export interface EntryLink {
  id: string;
  name: string;
  targetId: string;
  type: string;
  hidden: boolean;
  costs: Cost[];
}

export interface Catalogue {
  id: string;
  name: string;
  library: boolean;
  gameSystemId: string;
  revision: number;
  catalogueLinks: CatalogueLink[];
  selectionEntries: SelectionEntry[];
  entryLinks: EntryLink[];
}

// Army builder types
export interface ArmyUnit {
  id: string; // unique id in the army
  entryLinkId: string;
  targetId: string;
  name: string;
  pointsCost: number;
  profiles: Profile[];
  categoryLinks: CategoryLink[];
}

export interface ArmyForce {
  id: string;
  forceEntryId: string;
  name: string;
  units: ArmyUnit[];
}

export interface ArmyList {
  id: string;
  name: string;
  faction: Faction | null;
  subfaction: Subfaction | null;
  forceEntry: ForceEntry | null;
  pointsLimit: number;
  units: ArmyUnit[];
}

export interface AppState {
  armyLists: ArmyList[];
  activeArmyListId: string | null;
  gameSystem: GameSystem | null;
  loadedCatalogues: Record<string, Catalogue>;
  factions: Faction[];
  subfactions: Subfaction[];
  loading: boolean;
  error: string | null;
}

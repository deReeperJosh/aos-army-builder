// BattleScribe data types for Age of Sigmar 4.0

export interface FactionOption {
  id: string;
  name: string;
  profiles: Profile[];
  targetGroupId?: string; // For lores: references a group in Lores.cat
  hidden: boolean;
}

export interface FactionOptionGroup {
  id: string;
  name: string;
  options: FactionOption[];
}

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
  categoryLinks: CategoryLink[];
  isRegimentalLeader: boolean;
  enabledAffectIds: string[];
  // Categories dynamically added to this unit when it joins a regiment as a non-leader
  // (e.g. "Voice of the Everwinter" for Huskard units in an Ogor Mawtribes Frostlord regiment)
  conditionalCategoryIds: string[];
}

export interface RenownRegiment {
  id: string;
  name: string;      // e.g. "Regiment of Renown: The Blacktalons"
  profiles: Profile[];
  allowedCatalogueIds: string[]; // Faction catalogue IDs that may include this regiment
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
  // Faction rules data extracted from sharedSelectionEntryGroups
  selectionEntryGroups: FactionOptionGroup[]; // All parsed sharedSelectionEntryGroups
  battleTraitProfiles: Profile[];             // Profiles from 'Battle Traits: X' entry
  battleFormations: FactionOption[];          // Available battle formations
  spellLores: FactionOption[];                // Available spell lore options
  prayerLores: FactionOption[];               // Available prayer lore options
  manifestationLores: FactionOption[];        // Available manifestation lore options
  renownRegiments: RenownRegiment[];          // Only populated in Regiments of Renown.cat
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
  isRegimentalLeader: boolean;
}

export interface ArmyRegiment {
  id: string;
  leader: ArmyUnit | null;
  units: ArmyUnit[];
  isRegimentOfRenown: boolean;
  renownForceEntryId?: string;
  renownName?: string;
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
  regiments: ArmyRegiment[];
  auxiliaryUnits: ArmyUnit[];
  factionTerrainUnit: ArmyUnit | null;         // Selected faction terrain unit
  // Faction rules selections
  generalUnitId: string | null;                // ID of the army unit that is the General
  battleTraitProfiles: Profile[];              // Battle trait profiles for the selected faction
  battleFormation: FactionOption | null;       // Selected battle formation
  spellLore: FactionOption | null;             // Selected spell lore (with loaded profiles)
  prayerLore: FactionOption | null;            // Selected prayer lore (with loaded profiles)
  manifestationLore: FactionOption | null;     // Selected manifestation lore (with loaded profiles)
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

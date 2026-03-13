// Spearhead Army data types for Age of Sigmar 4.0

export interface SpearheadWeapon {
  name: string;
  type: 'Melee' | 'Ranged';
  range?: string; // for ranged weapons only
  attacks: string;
  hit: string;
  wound: string;
  rend: string;
  damage: string;
  ability?: string;
}

export interface SpearheadAbility {
  name: string;
  timing: string; // e.g. "Passive", "Your Hero Phase", "Any Combat Phase", "End of Any Turn"
  effect: string;
  declare?: string;
  keywords?: string[];
}

export interface SpearheadUnit {
  id: string;
  name: string;
  count: string; // e.g. "1x", "5x", "10x | 10x"
  isGeneral: boolean;
  keywords: string[];
  move: string;
  health: string;
  save: string;
  ward?: string;
  control: string;
  rangedWeapons: SpearheadWeapon[];
  meleeWeapons: SpearheadWeapon[];
  abilities: SpearheadAbility[];
}

export interface SpearheadArmy {
  id: string;
  name: string; // faction name, e.g. "Ossiarch Bonereapers"
  battleTraits: SpearheadAbility[];
  regimentalAbilities: SpearheadAbility[];
  enhancements: SpearheadAbility[];
  units: SpearheadUnit[];
}

/** User-configurable choices made for a Spearhead army */
export interface SpearheadSelection {
  armyId: string;
  selectedRegimentalAbilityIndex: number;
  selectedEnhancementIndex: number;
}

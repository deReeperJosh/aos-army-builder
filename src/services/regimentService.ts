import type { SelectionEntry, Profile, CategoryLink, WargearOptionGroup } from '../types/battlescribe';

export const GHB_2025_FORCE_ID = 'f079-501a-2738-6845';
export const REGIMENTAL_LEADER_CAT = 'd1f3-921c-b403-1106';
export const REGIMENTAL_OPTION_CAT = 'db3a-7199-c92e-f3cf';

export interface UnitOption {
  linkId: string;
  targetId: string;
  name: string;
  points: number;
  entry: SelectionEntry | null;
  profiles: Profile[];
  categoryLinks: CategoryLink[];
  isRegimentalLeader: boolean;
  enabledAffectIds: string[];
  // Categories conditionally gained by this unit when it joins a regiment as a non-leader
  conditionalCategoryIds: string[];
  /** Wargear option groups available for this unit (e.g. "Wargear Options": Chaintrap / Blood Vulture). */
  wargearGroups: WargearOptionGroup[];
  /** Enhancement group references (Heroic Traits, Artefacts of Power, Big Names) from the entry link. */
  enhancementGroupRefs: { name: string; targetId: string }[];
}

/**
 * Recursively collects all profiles from a SelectionEntry and all of its sub-entries.
 * Weapon profiles (Melee Weapon, Ranged Weapon) are stored in nested sub-entries
 * (unit → model → upgrade), so we must walk the full tree to collect them.
 */
export function collectAllProfiles(entry: SelectionEntry): Profile[] {
  const profiles: Profile[] = [...(entry.profiles ?? [])];
  for (const sub of entry.subEntries ?? []) {
    profiles.push(...collectAllProfiles(sub));
  }
  return profiles;
}

/**
 * Recursively collects all wargear option groups from a SelectionEntry and its sub-entries.
 * Wargear groups are typically on the model-level sub-entry (one level below the unit entry).
 */
export function collectAllWargearGroups(entry: SelectionEntry): WargearOptionGroup[] {
  const groups: WargearOptionGroup[] = [...(entry.wargearGroups ?? [])];
  for (const sub of entry.subEntries ?? []) {
    groups.push(...collectAllWargearGroups(sub));
  }
  return groups;
}

/**
 * Returns the units valid for a leader's regiment.
 * A unit is valid if:
 *  - It is not itself a regimental leader, OR it is specifically referenced by the leader
 *  - Its categoryLinks include a category ID that the leader enables, OR its linkId is in enabledAffectIds
 * If the leader has no enabledAffectIds, all non-leader units are considered valid.
 */
export function getValidRegimentUnits(
  leader: UnitOption,
  allUnits: UnitOption[]
): UnitOption[] {
  const { enabledAffectIds } = leader;

  if (enabledAffectIds.length === 0) {
    return allUnits.filter((u) => !u.isRegimentalLeader);
  }

  return allUnits.filter((unit) => {
    // A leader unit is only valid if specifically referenced by linkId OR if it gains a
    // conditional category that the leader enables (e.g. "Voice of the Everwinter" heroes
    // in an Ogor Mawtribes regiment led by a Frostlord on Stonehorn).
    if (unit.isRegimentalLeader) {
      return (
        enabledAffectIds.includes(unit.linkId) ||
        unit.conditionalCategoryIds.some((id) => enabledAffectIds.includes(id))
      );
    }
    // Non-leader: valid if category or linkId matches
    const hasEnabledCategory = unit.categoryLinks.some((cl) =>
      enabledAffectIds.includes(cl.targetId)
    );
    const hasEnabledLink = enabledAffectIds.includes(unit.linkId);
    return hasEnabledCategory || hasEnabledLink;
  });
}

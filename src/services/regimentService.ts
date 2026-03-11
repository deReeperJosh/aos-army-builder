import type { SelectionEntry, Profile, CategoryLink } from '../types/battlescribe';

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
    // A leader unit is only valid if specifically referenced by linkId
    if (unit.isRegimentalLeader) {
      return enabledAffectIds.includes(unit.linkId);
    }
    // Non-leader: valid if category or linkId matches
    const hasEnabledCategory = unit.categoryLinks.some((cl) =>
      enabledAffectIds.includes(cl.targetId)
    );
    const hasEnabledLink = enabledAffectIds.includes(unit.linkId);
    return hasEnabledCategory || hasEnabledLink;
  });
}

import { useState, useCallback } from 'react';
import type {
  ArmyList,
  ArmyRegiment,
  ArmyUnit,
  Faction,
  Subfaction,
  ForceEntry,
  SelectionEntry,
  FactionOption,
  Profile,
  SelectedWargear,
  SelectedEnhancement,
} from '../types/battlescribe';
import { parseNewRecruitList, type ParsedList, type ParsedUnit } from '../services/listParser';
import { fetchCatalogue } from '../services/dataFetcher';
import { KNOWN_FACTIONS, KNOWN_SUBFACTIONS, KNOWN_FORCE_ENTRIES } from '../services/dataFetcher';
import type { UnitOption } from '../services/regimentService';
import { collectAllProfiles, collectAllWargearGroups, collectAllCommandModelOptions } from '../services/regimentService';
import './ImportModal.css';

let nextId = 1;
function generateId() {
  return `import-${Date.now()}-${nextId++}`;
}

interface ImportModalProps {
  onImport: (army: ArmyList) => void;
  onClose: () => void;
}

// ---- Unit option building (mirrors BuildTab logic) ----
const infraPatterns = [
  'Battle Traits', 'Battle Wound', 'Warlord', 'Renown',
  'Configuration', 'Army List', 'Allegiance',
];

// BattleScribe category ID for FACTION TERRAIN units (mirrors BuildTab)
const FACTION_TERRAIN_CAT_ID = 'cdd6-ffa1-9b32-4cb8';

function buildUnitOptions(
  factionCat: Awaited<ReturnType<typeof fetchCatalogue>>,
  subfactionCat: Awaited<ReturnType<typeof fetchCatalogue>> | null,
  libraryCat: Awaited<ReturnType<typeof fetchCatalogue>> | null
): UnitOption[] {
  const entryMap = new Map<string, SelectionEntry>();
  if (libraryCat) {
    for (const entry of libraryCat.selectionEntries) {
      entryMap.set(entry.id, entry);
    }
  }

  const allLinks = [
    ...factionCat.entryLinks,
    ...(subfactionCat?.entryLinks ?? []),
  ];

  const options: UnitOption[] = allLinks
    .filter(
      (link) =>
        link.type === 'selectionEntry' &&
        !link.hidden &&
        link.name !== '' &&
        !infraPatterns.some((p) => link.name.startsWith(p))
    )
    .map((link) => {
      const entry = entryMap.get(link.targetId) ?? null;
      const pts = link.costs.find((c) => c.name === 'pts')?.value ?? 0;
      const entryCats = entry?.categoryLinks ?? [];
      const categoryLinks =
        link.categoryLinks.length > 0
          ? [
              ...link.categoryLinks,
              ...entryCats.filter(
                (ecl) => !link.categoryLinks.some((lcl) => lcl.targetId === ecl.targetId)
              ),
            ]
          : entryCats;

      return {
        linkId: link.id,
        targetId: link.targetId,
        name: link.name,
        points: pts,
        entry,
        profiles: entry ? collectAllProfiles(entry) : [],
        categoryLinks,
        isRegimentalLeader: link.isRegimentalLeader,
        enabledAffectIds: link.enabledAffectIds,
        conditionalCategoryIds: link.conditionalCategoryIds,
        wargearGroups: entry ? collectAllWargearGroups(entry) : [],
        enhancementGroupRefs: link.enhancementGroupRefs,
        commandModelOptions: entry ? collectAllCommandModelOptions(entry) : [],
      };
    });

  // Deduplicate by name+points (same as BuildTab)
  const seen = new Set<string>();
  const unique: UnitOption[] = [];
  for (const u of options) {
    const k = u.name + '|' + u.points;
    if (!seen.has(k)) {
      seen.add(k);
      unique.push(u);
    }
  }
  return unique;
}

function makeArmyUnit(unit: UnitOption): ArmyUnit {
  // Set default wargear: first option in each wargear group
  const selectedWargear: SelectedWargear[] = unit.wargearGroups.map((group) => {
    const firstOpt = group.options[0];
    return {
      groupId: group.id,
      optionId: firstOpt?.id ?? '',
      optionName: firstOpt?.name ?? '',
      profiles: firstOpt?.profiles ?? [],
    };
  }).filter((w) => w.optionId !== '');

  return {
    id: generateId(),
    entryLinkId: unit.linkId,
    targetId: unit.targetId,
    name: unit.name,
    pointsCost: unit.points,
    profiles: unit.profiles,
    categoryLinks: unit.categoryLinks,
    isRegimentalLeader: unit.isRegimentalLeader,
    selectedWargear,
    selectedEnhancements: [],
    selectedCommandModels: [],
  };
}

/**
 * Strip leading count prefix ("1x ", "2x ", etc.) from an upgrade name,
 * then normalize whitespace.
 */
function normalizeUpgradeName(raw: string): string {
  return raw.replace(/^\d+x\s*/i, '').trim();
}

/** Find a UnitOption by name (case-insensitive). Returns the best match or null. */
function findUnit(name: string, units: UnitOption[]): UnitOption | null {
  const lower = name.toLowerCase();
  // Exact match first
  const exact = units.find((u) => u.name.toLowerCase() === lower);
  if (exact) return exact;
  // Partial match (name starts with search term or vice versa)
  const partialMatch = units.find((u) => u.name.toLowerCase().startsWith(lower) || lower.startsWith(u.name.toLowerCase()));
  return partialMatch ?? null;
}

/** Match a force/handbook name from the text to a known ForceEntry. */
function matchForce(forceName: string, entries: ForceEntry[]): ForceEntry | null {
  const lower = forceName.toLowerCase();
  // Try substring match in either direction
  return (
    entries.find(
      (fe) =>
        fe.name.toLowerCase().includes(lower) ||
        lower.includes(fe.name.toLowerCase().replace(/[✦•]/g, '').trim().toLowerCase())
    ) ?? null
  );
}

/** Match a faction name from the text to a known Faction. */
function matchFaction(factionName: string, factions: Faction[]): Faction | null {
  const lower = factionName.toLowerCase();
  return factions.find((f) => f.name.toLowerCase() === lower) ?? null;
}

/** Match a subfaction name from the text to a known Subfaction for a given faction. */
function matchSubfaction(
  subfactionName: string,
  factionName: string,
  subfactions: Subfaction[]
): Subfaction | null {
  const lower = subfactionName.toLowerCase();
  const factSubs = subfactions.filter(
    (s) => s.factionName.toLowerCase() === factionName.toLowerCase()
  );
  return factSubs.find((s) => s.subfactionName.toLowerCase() === lower) ?? null;
}

/** Find a lore option by name substring. */
function matchLore(loreName: string, options: FactionOption[]): FactionOption | null {
  const lower = loreName.toLowerCase();
  return (
    options.find((o) => o.name.toLowerCase() === lower) ??
    options.find((o) => o.name.toLowerCase().includes(lower) || lower.includes(o.name.toLowerCase())) ??
    null
  );
}

/**
 * Resolve available manifestation lore options for a faction.
 * Most factions reference manifestation lores indirectly via a hidden "Manifestation Lore"
 * selectionEntry that links to a "Manifestation Lores" group in Lores.cat. Falls back to
 * direct `manifestationLores` on the faction catalogue when present.
 */
function resolveManifestationLoreOptions(
  factionCat: Awaited<ReturnType<typeof fetchCatalogue>>,
  loresCat: Awaited<ReturnType<typeof fetchCatalogue>> | null
): FactionOption[] {
  if (factionCat.manifestationLores.length > 0) return factionCat.manifestationLores;
  if (factionCat.manifestationLoreGroupId && loresCat) {
    const group = loresCat.selectionEntryGroups.find(
      (g) => g.id === factionCat.manifestationLoreGroupId
    );
    return group?.options.filter((o) => !o.hidden) ?? [];
  }
  return [];
}

async function buildArmyFromParsed(parsed: ParsedList): Promise<{ army: ArmyList; warnings: string[] }> {
  const warnings: string[] = [];

  // --- Match faction ---
  const faction = matchFaction(parsed.factionName, KNOWN_FACTIONS);
  if (!faction) {
    warnings.push(`Could not find faction "${parsed.factionName}". Please set it manually.`);
  }

  // --- Match subfaction (preliminary — validated after catalogue loads) ---
  let subfaction: Subfaction | null = null;
  if (parsed.subfactionName && faction) {
    subfaction = matchSubfaction(parsed.subfactionName, faction.name, KNOWN_SUBFACTIONS);
  }

  // --- Match force ---
  const forceEntry = matchForce(parsed.forceName, KNOWN_FORCE_ENTRIES);
  if (!forceEntry) {
    warnings.push(`Could not match force "${parsed.forceName}". Using default.`);
  }

  // --- Load catalogues ---
  let allUnitOptions: UnitOption[] = [];
  let factionCat: Awaited<ReturnType<typeof fetchCatalogue>> | null = null;
  let loresCat: Awaited<ReturnType<typeof fetchCatalogue>> | null = null;

  if (faction) {
    try {
      factionCat = await fetchCatalogue(faction.filename);

      let libraryCat: Awaited<ReturnType<typeof fetchCatalogue>> | null = null;
      try {
        libraryCat = await fetchCatalogue(faction.filename.replace('.cat', '') + ' - Library.cat');
      } catch { /* optional */ }

      let subfactionCat: Awaited<ReturnType<typeof fetchCatalogue>> | null = null;
      if (subfaction?.filename) {
        try {
          subfactionCat = await fetchCatalogue(subfaction.filename);
        } catch { /* optional */ }
      }

      allUnitOptions = buildUnitOptions(factionCat, subfactionCat, libraryCat);

      // Load Lores.cat when needed (for manifestation lore or indirect lore resolution)
      if (
        factionCat.manifestationLoreGroupId !== null ||
        factionCat.manifestationLores.length > 0 ||
        parsed.manifestationLoreName
      ) {
        try {
          loresCat = await fetchCatalogue('Lores.cat');
        } catch { /* optional */ }
      }
    } catch (e) {
      warnings.push(`Failed to load catalogue for "${faction.name}": ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // --- Resolve subfaction vs formation ambiguity ---
  // In New Recruit exports the battle formation name appears directly after the faction name
  // (same position as the subfaction). If `subfactionName` didn't match a known subfaction,
  // try to match it as a battle formation instead.
  let battleFormationFromSubfactionLine: FactionOption | null = null;
  if (parsed.subfactionName && !subfaction && factionCat) {
    battleFormationFromSubfactionLine = matchLore(parsed.subfactionName, factionCat.battleFormations);
    if (!battleFormationFromSubfactionLine) {
      // Still not found — warn so the user can set it manually
      warnings.push(
        `Could not find subfaction or battle formation "${parsed.subfactionName}". Please set it manually.`
      );
    }
  } else if (parsed.subfactionName && !subfaction) {
    warnings.push(`Could not find subfaction "${parsed.subfactionName}". Please set it manually.`);
  }

  // --- Helper: apply parsed upgrades (wargear / enhancements / command models) to an ArmyUnit ---
  const applyUpgrades = (unit: ArmyUnit, opt: UnitOption, upgrades: string[]): ArmyUnit => {
    if (!upgrades || upgrades.length === 0) return unit;

    let selectedWargear: SelectedWargear[] = [...(unit.selectedWargear ?? [])];
    let selectedEnhancements: SelectedEnhancement[] = [...(unit.selectedEnhancements ?? [])];
    let selectedCommandModels: string[] = [...(unit.selectedCommandModels ?? [])];
    const addedEnhancementGroups = new Set(selectedEnhancements.map((e) => e.groupName));

    for (const raw of upgrades) {
      const upgradeName = normalizeUpgradeName(raw);
      if (!upgradeName || upgradeName.toLowerCase() === 'general') continue;

      // Try to match as a wargear option
      let matched = false;
      for (const group of opt.wargearGroups) {
        const wOpt = group.options.find((o) => o.name.toLowerCase() === upgradeName.toLowerCase());
        if (wOpt) {
          selectedWargear = selectedWargear
            .filter((w) => w.groupId !== group.id)
            .concat({ groupId: group.id, optionId: wOpt.id, optionName: wOpt.name, profiles: wOpt.profiles });
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // Try to match as a command model option
      const cmMatch = opt.commandModelOptions.find((m) => m.toLowerCase() === upgradeName.toLowerCase());
      if (cmMatch && !selectedCommandModels.includes(cmMatch)) {
        selectedCommandModels = [...selectedCommandModels, cmMatch];
        matched = true;
      }
      if (matched) continue;

      // Try to match as an enhancement option from the faction catalogue
      if (factionCat) {
        for (const ref of opt.enhancementGroupRefs) {
          if (addedEnhancementGroups.has(ref.name)) continue; // already selected one for this group
          const group = factionCat.selectionEntryGroups.find((g) => g.id === ref.targetId);
          if (!group) continue;
          const eOpt = group.options.find((o) => o.name.toLowerCase() === upgradeName.toLowerCase());
          if (eOpt) {
            const enhancement: SelectedEnhancement = {
              groupName: ref.name,
              optionId: eOpt.id,
              optionName: eOpt.name,
              profiles: eOpt.profiles,
            };
            selectedEnhancements = [...selectedEnhancements, enhancement];
            addedEnhancementGroups.add(ref.name);
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        // Upgrade not recognised — silently skip (could be General indicator, unknown option, etc.)
      }
    }

    return { ...unit, selectedWargear, selectedEnhancements, selectedCommandModels };
  };

  // --- Helper: resolve a parsed unit to an ArmyUnit ---
  const resolveUnit = (parsed: ParsedUnit): ArmyUnit | null => {
    const opt = findUnit(parsed.name, allUnitOptions);
    if (!opt) {
      warnings.push(`Unit not found: "${parsed.name}" (${parsed.points} pts). Skipped.`);
      return null;
    }
    const unit = makeArmyUnit(opt);
    return applyUpgrades(unit, opt, parsed.upgrades ?? []);
  };

  // --- Build regiments ---
  const regiments: ArmyRegiment[] = [];
  let generalUnitId: string | null = null;

  for (const pr of parsed.regiments) {
    if (pr.units.length === 0) continue;

    const regiment: ArmyRegiment = {
      id: generateId(),
      leader: null,
      units: [],
      isRegimentOfRenown: false,
    };

    // First unit is the leader candidate
    const [leaderParsed, ...membersParsed] = pr.units;
    const leaderOpt = findUnit(leaderParsed.name, allUnitOptions);

    if (leaderOpt) {
      let leaderUnit = makeArmyUnit(leaderOpt);
      leaderUnit = applyUpgrades(leaderUnit, leaderOpt, leaderParsed.upgrades ?? []);
      if (leaderOpt.isRegimentalLeader) {
        regiment.leader = leaderUnit;
        // Mark the general (first unit in the General's Regiment)
        if (pr.isGeneralsRegiment && generalUnitId === null) {
          generalUnitId = leaderUnit.id;
        }
      } else {
        // Not actually a leader – treat as regular unit
        regiment.units.push(leaderUnit);
        warnings.push(`"${leaderParsed.name}" is not a regimental leader. Added as regiment unit.`);
      }
    } else {
      warnings.push(`Unit not found: "${leaderParsed.name}" (${leaderParsed.points} pts). Skipped.`);
    }

    for (const mp of membersParsed) {
      const unit = resolveUnit(mp);
      if (unit) regiment.units.push(unit);
    }

    regiments.push(regiment);
  }

  // --- Build auxiliary units ---
  const auxiliaryUnits: ArmyUnit[] = [];
  for (const ap of parsed.auxiliaryUnits) {
    const unit = resolveUnit(ap);
    if (unit) auxiliaryUnits.push(unit);
  }

  // --- Resolve manifestation lore options (direct from faction or from Lores.cat) ---
  const manifestationLoreOptions = factionCat
    ? resolveManifestationLoreOptions(factionCat, loresCat)
    : [];

  // --- Match lores (best-effort) ---
  let battleTraitProfiles: Profile[] = [];
  let battleFormation: FactionOption | null = battleFormationFromSubfactionLine;
  let spellLore: FactionOption | null = null;
  let prayerLore: FactionOption | null = null;
  let manifestationLore: FactionOption | null = null;

  if (factionCat) {
    battleTraitProfiles = factionCat.battleTraitProfiles;

    // Explicit "Battle Formation - X" lines from the text body
    if (parsed.battleFormationName) {
      const match = matchLore(parsed.battleFormationName, factionCat.battleFormations);
      if (match) {
        battleFormation = match;
      } else {
        warnings.push(`Battle formation "${parsed.battleFormationName}" not found. Please set manually.`);
      }
    }

    // Second inline line (when both subfaction and formation appear in the text)
    if (parsed.inlineFormationName && !battleFormation) {
      const match = matchLore(parsed.inlineFormationName, factionCat.battleFormations);
      if (match) {
        battleFormation = match;
      } else {
        warnings.push(`Battle formation "${parsed.inlineFormationName}" not found. Please set manually.`);
      }
    }

    if (parsed.spellLoreName) {
      spellLore = matchLore(parsed.spellLoreName, factionCat.spellLores);
      if (!spellLore) {
        warnings.push(`Spell lore "${parsed.spellLoreName}" not found. Please set manually.`);
      }
    }
    if (parsed.prayerLoreName) {
      prayerLore = matchLore(parsed.prayerLoreName, factionCat.prayerLores);
      if (!prayerLore) {
        warnings.push(`Prayer lore "${parsed.prayerLoreName}" not found. Please set manually.`);
      }
    }
    if (parsed.manifestationLoreName) {
      manifestationLore = matchLore(parsed.manifestationLoreName, manifestationLoreOptions);
      if (!manifestationLore) {
        warnings.push(`Manifestation lore "${parsed.manifestationLoreName}" not found. Please set manually.`);
      }
    }
  }

  const army: ArmyList = {
    id: generateId(),
    name: parsed.armyName,
    faction: faction ?? null,
    subfaction,
    forceEntry: forceEntry ?? null,
    pointsLimit: parsed.pointsLimit,
    regiments,
    auxiliaryUnits,
    factionTerrainUnit: (() => {
      if (!parsed.factionTerrainName) return null;
      const terrainOptions = allUnitOptions.filter((u) =>
        u.categoryLinks.some((cl) => cl.targetId === FACTION_TERRAIN_CAT_ID)
      );
      const opt = findUnit(parsed.factionTerrainName, terrainOptions);
      if (!opt) {
        warnings.push(`Faction terrain "${parsed.factionTerrainName}" not found. Please set it manually.`);
        return null;
      }
      return makeArmyUnit(opt);
    })(),
    generalUnitId,
    battleTraitProfiles,
    battleFormation,
    spellLore,
    prayerLore,
    manifestationLore,
  };

  return { army, warnings };
}

// ---- Component ----

export function ImportModal({ onImport, onClose }: ImportModalProps) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedList | null>(null);
  const [builtArmy, setBuiltArmy] = useState<ArmyList | null>(null);

  const handleParse = useCallback(() => {
    const parsed = parseNewRecruitList(text);
    if (!parsed) {
      setErrorMsg(
        'Could not parse the list. Make sure it is in the New Recruit export format.\n\n' +
          'Expected format:\n  Army Name (1940 points) - ✦ General\'s Handbook 2025-26\n  Faction Name\n  Subfaction Name\n  ...'
      );
      setPreview(null);
      return;
    }
    setErrorMsg(null);
    setPreview(parsed);
  }, [text]);

  const handleImport = useCallback(async () => {
    const parsed = preview ?? parseNewRecruitList(text);
    if (!parsed) {
      setErrorMsg('Could not parse the list. Please check the format and try again.');
      return;
    }

    setStatus('loading');
    setWarnings([]);
    setErrorMsg(null);

    try {
      const { army, warnings: w } = await buildArmyFromParsed(parsed);
      setBuiltArmy(army);
      setWarnings(w);
      setStatus('done');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Import failed');
      setStatus('error');
    }
  }, [preview, text]);

  const handleConfirm = () => {
    if (builtArmy) onImport(builtArmy);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Import Army List"
      >
        <div className="modal-header">
          <h2 className="modal-title">Import Army List</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {status !== 'done' && (
            <>
              <p className="modal-desc">
                Paste an army list exported from New Recruit or a compatible tool below.
              </p>
              <textarea
                className="import-textarea"
                placeholder={`Testing (1940 points) - ✦ General's Handbook 2025-26\nOgor Mawtribes\nHeralds of the Everwinter\n...\nGeneral's Regiment\nFrostlord on Stonehorn (330)\n...`}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setPreview(null);
                  setErrorMsg(null);
                  setStatus('idle');
                }}
                rows={14}
                disabled={status === 'loading'}
              />

              {errorMsg && (
                <div className="import-error">
                  <strong>⚠ Could not parse list</strong>
                  <pre>{errorMsg}</pre>
                </div>
              )}

              {preview && (
                <div className="import-preview">
                  <h3>Preview</h3>
                  <table className="preview-table">
                    <tbody>
                      <tr><td>Army name</td><td><strong>{preview.armyName}</strong></td></tr>
                      <tr><td>Points</td><td><strong>{preview.pointsLimit}</strong></td></tr>
                      <tr><td>Force</td><td><strong>{preview.forceName}</strong></td></tr>
                      <tr><td>Faction</td><td><strong>{preview.factionName}</strong></td></tr>
                      {preview.subfactionName && (
                        <tr><td>Subfaction / Formation</td><td><strong>{preview.subfactionName}</strong></td></tr>
                      )}
                      {preview.inlineFormationName && (
                        <tr><td>Formation</td><td><strong>{preview.inlineFormationName}</strong></td></tr>
                      )}
                      <tr>
                        <td>Regiments</td>
                        <td>
                          {preview.regiments.map((r, ri) => (
                            <div key={ri}>
                              <em>{r.isGeneralsRegiment ? "General's Regiment" : `Regiment ${ri + 1}`}</em>
                              {r.units.map((u, ui) => (
                                <div key={ui} className="preview-unit">
                                  {ui === 0 ? '👑 ' : '  '}{u.name} ({u.points} pts)
                                </div>
                              ))}
                            </div>
                          ))}
                          {preview.auxiliaryUnits.length > 0 && (
                            <div>
                              <em>Auxiliaries</em>
                              {preview.auxiliaryUnits.map((u, ui) => (
                                <div key={ui} className="preview-unit">{u.name} ({u.points} pts)</div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                      {preview.factionTerrainName && (
                        <tr><td>Faction Terrain</td><td><strong>{preview.factionTerrainName}</strong></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {status === 'loading' && (
            <div className="import-loading">
              <div className="spinner" />
              <p>Loading faction data and matching units…</p>
            </div>
          )}

          {status === 'done' && builtArmy && (
            <div className="import-success">
              <div className="success-icon">✓</div>
              <h3>Ready to import</h3>
              <p>
                <strong>{builtArmy.name}</strong> — {builtArmy.faction?.name ?? 'Unknown faction'},{' '}
                {builtArmy.regiments.length} regiment(s)
              </p>
              {warnings.length > 0 && (
                <div className="import-warnings">
                  <strong>⚠ Some items could not be matched automatically:</strong>
                  <ul>
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                  <p className="warning-note">You can adjust these manually in the Army Builder after importing.</p>
                </div>
              )}
            </div>
          )}

          {status === 'error' && errorMsg && (
            <div className="import-error">
              <strong>⚠ Import failed</strong>
              <p>{errorMsg}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>

          {status === 'idle' && (
            <>
              {!preview && (
                <button
                  className="btn"
                  onClick={handleParse}
                  disabled={!text.trim()}
                >
                  Preview
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={!text.trim()}
              >
                Import
              </button>
            </>
          )}

          {status === 'done' && (
            <button className="btn btn-primary" onClick={handleConfirm}>
              Add to My Armies
            </button>
          )}

          {status === 'error' && (
            <button className="btn btn-primary" onClick={() => setStatus('idle')}>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

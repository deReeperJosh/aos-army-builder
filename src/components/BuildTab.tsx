import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  ArmyList,
  ArmyUnit,
  ArmyRegiment,
  Catalogue,
  SelectionEntry,
  FactionOption,
  Profile,
  RenownRegiment,
} from '../types/battlescribe';
import { fetchCatalogue, fetchRenownAllowances } from '../services/dataFetcher';
import {
  GHB_2025_FORCE_ID,
  getValidRegimentUnits,
  type UnitOption,
} from '../services/regimentService';
import { ProfileViewer } from './ProfileViewer';
import './BuildTab.css';

let nextId = 1;
function generateId() {
  return `unit-${Date.now()}-${nextId++}`;
}

// GHB force IDs that support lore selection
const GHB_FORCE_IDS = new Set([
  'f079-501a-2738-6845', // GHB 2025-26
  'f079-501a-2738-6844', // GHB 2024-25
]);

// BattleScribe category ID for FACTION TERRAIN units
const FACTION_TERRAIN_CAT_ID = 'cdd6-ffa1-9b32-4cb8';

type EditMode = 'leader' | 'units' | 'auxiliary' | 'terrain' | 'renown' | null;

interface BuildTabProps {
  army: ArmyList;
  onUpdateArmy: (updates: Partial<ArmyList>) => void;
}

export function BuildTab({ army, onUpdateArmy }: BuildTabProps) {
  const [allUnits, setAllUnits] = useState<UnitOption[]>([]);
  const [factionCat, setFactionCat] = useState<Catalogue | null>(null);
  const [loresCat, setLoresCat] = useState<Catalogue | null>(null);
  const [renownCat, setRenownCat] = useState<Catalogue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editRegimentId, setEditRegimentId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [showArmyOptions, setShowArmyOptions] = useState(false);

  const loadedRef = useRef<string | null>(null);

  const isGHB = army.forceEntry?.id === GHB_2025_FORCE_ID;
  const supportsLores = army.forceEntry ? GHB_FORCE_IDS.has(army.forceEntry.id) : false;

  const loadUnits = useCallback(async () => {
    if (!army.faction) return;
    const key = army.faction.filename + (army.subfaction?.filename ?? '');
    if (loadedRef.current === key) return;

    setLoading(true);
    setError(null);

    try {
      const factionCatLoaded = await fetchCatalogue(army.faction.filename);
      setFactionCat(factionCatLoaded);

      // Store battle traits in army when catalogue loads
      if (factionCatLoaded.battleTraitProfiles.length > 0) {
        onUpdateArmy({ battleTraitProfiles: factionCatLoaded.battleTraitProfiles });
      }

      let libraryCat: Catalogue | null = null;
      try {
        const libraryFilename = army.faction.filename.replace('.cat', '') + ' - Library.cat';
        libraryCat = await fetchCatalogue(libraryFilename);
      } catch { /* Library may not exist */ }

      let subfactionCat: Catalogue | null = null;
      if (army.subfaction?.filename) {
        try {
          subfactionCat = await fetchCatalogue(army.subfaction.filename);
        } catch { /* ignore */ }
      }

      const entryMap = new Map<string, SelectionEntry>();
      if (libraryCat) {
        for (const entry of libraryCat.selectionEntries) {
          entryMap.set(entry.id, entry);
        }
      }

      const allLinks = [
        ...factionCatLoaded.entryLinks,
        ...(subfactionCat?.entryLinks ?? []),
      ];

      const infraPatterns = [
        'Battle Traits', 'Battle Wound', 'Warlord', 'Renown',
        'Configuration', 'Army List', 'Allegiance',
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
          const profiles = entry?.profiles ?? [];
          const pts = link.costs.find((c) => c.name === 'pts')?.value ?? 0;
          // Merge categoryLinks: prefer those on entry link, fall back to entry
          const categoryLinks =
            link.categoryLinks.length > 0
              ? link.categoryLinks
              : (entry?.categoryLinks ?? []);

          return {
            linkId: link.id,
            targetId: link.targetId,
            name: link.name,
            points: pts,
            entry,
            profiles,
            categoryLinks,
            isRegimentalLeader: link.isRegimentalLeader,
            enabledAffectIds: link.enabledAffectIds,
          };
        });

      // Deduplicate by name+points
      const seen = new Set<string>();
      const unique: UnitOption[] = [];
      for (const u of options) {
        const k = u.name + '|' + u.points;
        if (!seen.has(k)) {
          seen.add(k);
          unique.push(u);
        }
      }
      unique.sort((a, b) => a.name.localeCompare(b.name));

      setAllUnits(unique);

      // Load Lores.cat if this faction has lore options
      if (
        factionCatLoaded.spellLores.length > 0 ||
        factionCatLoaded.prayerLores.length > 0 ||
        factionCatLoaded.manifestationLores.length > 0
      ) {
        try {
          const lores = await fetchCatalogue('Lores.cat');
          setLoresCat(lores);
        } catch { /* Lores.cat may not be available */ }
      }

      // Load Regiments of Renown catalogue (with faction allowances from the GST)
      try {
        const allowances = await fetchRenownAllowances();
        const renown = await fetchCatalogue('Regiments of Renown.cat', allowances);
        setRenownCat(renown);
      } catch { /* May not be available */ }

      loadedRef.current = key;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load units');
    } finally {
      setLoading(false);
    }
  }, [army.faction, army.subfaction, onUpdateArmy]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  // ---- Separate terrain units from regular units ----
  const factionTerrainUnits = allUnits.filter((u) =>
    u.categoryLinks.some((cl) => cl.targetId === FACTION_TERRAIN_CAT_ID)
  );
  const nonTerrainUnits = allUnits.filter((u) =>
    !u.categoryLinks.some((cl) => cl.targetId === FACTION_TERRAIN_CAT_ID)
  );

  // ---- Regiment of Renown options: filtered to factions that can use each regiment ----
  // Use the loaded catalogue's XML id (e.g. '6353-cb84-ac7f-9a15') not the KNOWN_FACTIONS slug
  const factionCatalogueId = factionCat?.id ?? '';
  const availableRenownRegiments: RenownRegiment[] = (renownCat?.renownRegiments ?? []).filter(
    (r) =>
      // If allowedCatalogueIds is empty (no restriction extracted), show to all; otherwise filter
      r.allowedCatalogueIds.length === 0 ||
      r.allowedCatalogueIds.includes(factionCatalogueId)
  );

  // ---- Lore profile lookup ----
  const getLoreProfiles = (option: FactionOption): Profile[] => {
    if (option.profiles.length > 0) return option.profiles;
    if (!option.targetGroupId || !loresCat) return [];
    const group = loresCat.selectionEntryGroups.find((g) => g.id === option.targetGroupId);
    if (!group) return [];
    return group.options.flatMap((o) => o.profiles);
  };

  // ---- Faction option handlers ----
  const handleSelectFormation = (formationId: string) => {
    if (!factionCat) return;
    if (!formationId) { onUpdateArmy({ battleFormation: null }); return; }
    const formation = factionCat.battleFormations.find((f) => f.id === formationId);
    onUpdateArmy({ battleFormation: formation ?? null });
  };

  const handleSelectSpellLore = (loreId: string) => {
    if (!factionCat) return;
    if (!loreId) { onUpdateArmy({ spellLore: null }); return; }
    const option = factionCat.spellLores.find((l) => l.id === loreId);
    if (!option) return;
    onUpdateArmy({ spellLore: { ...option, profiles: getLoreProfiles(option) } });
  };

  const handleSelectPrayerLore = (loreId: string) => {
    if (!factionCat) return;
    if (!loreId) { onUpdateArmy({ prayerLore: null }); return; }
    const option = factionCat.prayerLores.find((l) => l.id === loreId);
    if (!option) return;
    onUpdateArmy({ prayerLore: { ...option, profiles: getLoreProfiles(option) } });
  };

  const handleSelectManifestationLore = (loreId: string) => {
    if (!factionCat) return;
    if (!loreId) { onUpdateArmy({ manifestationLore: null }); return; }
    const option = factionCat.manifestationLores.find((l) => l.id === loreId);
    if (!option) return;
    onUpdateArmy({ manifestationLore: { ...option, profiles: getLoreProfiles(option) } });
  };

  const handleSelectGeneral = (unitId: string) => {
    onUpdateArmy({ generalUnitId: unitId || null });
  };

  // ---- All regiment leaders (for General selector) ----
  const allLeaders: ArmyUnit[] = army.regiments
    .filter((r) => r.leader !== null)
    .map((r) => r.leader!);

  // ---- Army mutation helpers ----

  const addRegiment = () => {
    const newRegiment: ArmyRegiment = {
      id: generateId(),
      leader: null,
      units: [],
      isRegimentOfRenown: false,
    };
    onUpdateArmy({ regiments: [...army.regiments, newRegiment] });
  };

  const addRenownRegiment = (renown: RenownRegiment) => {
    const newRegiment: ArmyRegiment = {
      id: generateId(),
      leader: null,
      units: [],
      isRegimentOfRenown: true,
      renownName: renown.name.replace('Regiment of Renown: ', ''),
    };
    onUpdateArmy({ regiments: [...army.regiments, newRegiment] });
    setEditMode(null);
    setSearch('');
  };

  const removeRegiment = (regimentId: string) => {
    onUpdateArmy({ regiments: army.regiments.filter((r) => r.id !== regimentId) });
    if (editRegimentId === regimentId) {
      setEditMode(null);
      setEditRegimentId(null);
    }
  };

  const makeArmyUnit = (unit: UnitOption): ArmyUnit => ({
    id: generateId(),
    entryLinkId: unit.linkId,
    targetId: unit.targetId,
    name: unit.name,
    pointsCost: unit.points,
    profiles: unit.profiles,
    categoryLinks: unit.categoryLinks,
    isRegimentalLeader: unit.isRegimentalLeader,
  });

  const setRegimentLeader = (regimentId: string, unit: UnitOption) => {
    const armyUnit = makeArmyUnit(unit);
    onUpdateArmy({
      regiments: army.regiments.map((r) =>
        r.id === regimentId ? { ...r, leader: armyUnit } : r
      ),
    });
    setEditMode(null);
    setEditRegimentId(null);
  };

  const removeRegimentLeader = (regimentId: string) => {
    const regiment = army.regiments.find((r) => r.id === regimentId);
    // Clear general if the removed leader was the general
    if (regiment?.leader && regiment.leader.id === army.generalUnitId) {
      onUpdateArmy({ generalUnitId: null });
    }
    onUpdateArmy({
      regiments: army.regiments.map((r) =>
        r.id === regimentId ? { ...r, leader: null } : r
      ),
    });
  };

  const addUnitToRegiment = (regimentId: string, unit: UnitOption) => {
    const armyUnit = makeArmyUnit(unit);
    onUpdateArmy({
      regiments: army.regiments.map((r) =>
        r.id === regimentId ? { ...r, units: [...r.units, armyUnit] } : r
      ),
    });
  };

  const removeUnitFromRegiment = (regimentId: string, unitId: string) => {
    onUpdateArmy({
      regiments: army.regiments.map((r) =>
        r.id === regimentId
          ? { ...r, units: r.units.filter((u) => u.id !== unitId) }
          : r
      ),
    });
  };

  const addAuxiliaryUnit = (unit: UnitOption) => {
    const armyUnit = makeArmyUnit(unit);
    onUpdateArmy({ auxiliaryUnits: [...army.auxiliaryUnits, armyUnit] });
  };

  const removeAuxiliaryUnit = (unitId: string) => {
    onUpdateArmy({
      auxiliaryUnits: army.auxiliaryUnits.filter((u) => u.id !== unitId),
    });
  };

  const setFactionTerrain = (unit: UnitOption | null) => {
    if (!unit) { onUpdateArmy({ factionTerrainUnit: null }); return; }
    onUpdateArmy({ factionTerrainUnit: makeArmyUnit(unit) });
    setEditMode(null);
  };

  // ---- Picker helpers ----

  const startPickLeader = (regimentId: string) => {
    setEditMode('leader');
    setEditRegimentId(regimentId);
    setSearch('');
    setExpandedUnit(null);
  };

  const startPickUnits = (regimentId: string) => {
    setEditMode('units');
    setEditRegimentId(regimentId);
    setSearch('');
    setExpandedUnit(null);
  };

  const startPickAuxiliary = () => {
    setEditMode('auxiliary');
    setEditRegimentId(null);
    setSearch('');
    setExpandedUnit(null);
  };

  const startPickTerrain = () => {
    setEditMode('terrain');
    setEditRegimentId(null);
    setSearch('');
    setExpandedUnit(null);
  };

  const startPickRenown = () => {
    setEditMode('renown');
    setEditRegimentId(null);
    setSearch('');
  };

  const cancelPick = () => {
    setEditMode(null);
    setEditRegimentId(null);
  };

  // ---- Compute picker units ----

  const pickerUnits: UnitOption[] = (() => {
    if (editMode === 'leader') {
      return nonTerrainUnits.filter((u) => u.isRegimentalLeader);
    }
    if (editMode === 'units') {
      const regiment = army.regiments.find((r) => r.id === editRegimentId);
      if (!regiment?.leader) return nonTerrainUnits.filter((u) => !u.isRegimentalLeader);
      const leaderOption = nonTerrainUnits.find((u) => u.linkId === regiment.leader!.entryLinkId);
      if (!leaderOption) return nonTerrainUnits.filter((u) => !u.isRegimentalLeader);
      return getValidRegimentUnits(leaderOption, nonTerrainUnits);
    }
    if (editMode === 'auxiliary') {
      return nonTerrainUnits.filter((u) => !u.isRegimentalLeader);
    }
    if (editMode === 'terrain') {
      return factionTerrainUnits;
    }
    return [];
  })();

  const filteredPicker = search
    ? pickerUnits.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    : pickerUnits;

  const filteredRenown = search
    ? availableRenownRegiments.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : availableRenownRegiments;

  const handlePickUnit = (unit: UnitOption) => {
    if (editMode === 'leader' && editRegimentId) {
      setRegimentLeader(editRegimentId, unit);
    } else if (editMode === 'units' && editRegimentId) {
      addUnitToRegiment(editRegimentId, unit);
    } else if (editMode === 'auxiliary') {
      addAuxiliaryUnit(unit);
    } else if (editMode === 'terrain') {
      setFactionTerrain(unit);
    }
  };

  // ---- Total points ----
  const totalPoints =
    army.regiments.reduce((sum, r) => {
      return (
        sum +
        (r.leader?.pointsCost ?? 0) +
        r.units.reduce((s, u) => s + u.pointsCost, 0)
      );
    }, 0) +
    army.auxiliaryUnits.reduce((sum, u) => sum + u.pointsCost, 0) +
    (army.factionTerrainUnit?.pointsCost ?? 0);

  const pointsOver = totalPoints > army.pointsLimit && army.pointsLimit > 0;

  return (
    <div className="build-tab">
      {/* Left: Army Structure */}
      <div className="build-left">
        <div className="build-left-header">
          <div className={`build-points ${pointsOver ? 'over' : ''}`}>
            <span className="build-points-used">{totalPoints}</span>
            {army.pointsLimit > 0 && (
              <span className="build-points-limit"> / {army.pointsLimit} pts</span>
            )}
            {pointsOver && <span className="build-over-badge">OVER</span>}
          </div>
        </div>

        {/* Army Options Panel (Battle Formation, Lores, General, Terrain) */}
        {factionCat && (
          <div className="army-options-panel">
            <button
              className="army-options-toggle"
              onClick={() => setShowArmyOptions(!showArmyOptions)}
            >
              <span>⚔ Army Options</span>
              <span>{showArmyOptions ? '▲' : '▼'}</span>
            </button>
            {showArmyOptions && (
              <div className="army-options-body">
                {/* General */}
                <div className="army-option-row">
                  <label className="army-option-label">⭐ General</label>
                  {allLeaders.length === 0 ? (
                    <span className="army-option-hint">Add a regiment leader first</span>
                  ) : (
                    <select
                      className="form-select form-select-sm"
                      value={army.generalUnitId ?? ''}
                      onChange={(e) => handleSelectGeneral(e.target.value)}
                    >
                      <option value="">— No General —</option>
                      {allLeaders.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Battle Formation */}
                {factionCat.battleFormations.length > 0 && (
                  <div className="army-option-row">
                    <label className="army-option-label">🏛️ Battle Formation</label>
                    <select
                      className="form-select form-select-sm"
                      value={army.battleFormation?.id ?? ''}
                      onChange={(e) => handleSelectFormation(e.target.value)}
                    >
                      <option value="">— None —</option>
                      {factionCat.battleFormations.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Spell Lore */}
                {factionCat.spellLores.length > 0 && supportsLores && (
                  <div className="army-option-row">
                    <label className="army-option-label">✨ Spell Lore</label>
                    <select
                      className="form-select form-select-sm"
                      value={army.spellLore?.id ?? ''}
                      onChange={(e) => handleSelectSpellLore(e.target.value)}
                    >
                      <option value="">— None —</option>
                      {factionCat.spellLores.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Prayer Lore */}
                {factionCat.prayerLores.length > 0 && supportsLores && (
                  <div className="army-option-row">
                    <label className="army-option-label">🙏 Prayer Lore</label>
                    <select
                      className="form-select form-select-sm"
                      value={army.prayerLore?.id ?? ''}
                      onChange={(e) => handleSelectPrayerLore(e.target.value)}
                    >
                      <option value="">— None —</option>
                      {factionCat.prayerLores.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Manifestation Lore */}
                {factionCat.manifestationLores.length > 0 && supportsLores && (
                  <div className="army-option-row">
                    <label className="army-option-label">🌀 Manifestation</label>
                    <select
                      className="form-select form-select-sm"
                      value={army.manifestationLore?.id ?? ''}
                      onChange={(e) => handleSelectManifestationLore(e.target.value)}
                    >
                      <option value="">— None —</option>
                      {factionCat.manifestationLores.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Faction Terrain */}
                {factionTerrainUnits.length > 0 && (
                  <div className="army-option-row">
                    <label className="army-option-label">🏔️ Faction Terrain</label>
                    {army.factionTerrainUnit ? (
                      <div className="terrain-selected">
                        <span className="terrain-name">{army.factionTerrainUnit.name}</span>
                        {army.factionTerrainUnit.pointsCost > 0 && (
                          <span className="terrain-pts">{army.factionTerrainUnit.pointsCost} pts</span>
                        )}
                        <button
                          className="btn btn-xs btn-danger"
                          onClick={() => onUpdateArmy({ factionTerrainUnit: null })}
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        className={`btn btn-sm btn-ghost ${editMode === 'terrain' ? 'active-pick' : ''}`}
                        onClick={() => editMode === 'terrain' ? cancelPick() : startPickTerrain()}
                      >
                        {editMode === 'terrain' ? '← Cancel' : '+ Select Terrain'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="build-structure">
          {loading && (
            <div className="build-loading">
              <div className="spinner" /> Loading units…
            </div>
          )}
          {error && <div className="build-error">⚠️ {error}</div>}

          {isGHB ? (
            <GHBStructure
              army={army}
              editMode={editMode}
              editRegimentId={editRegimentId}
              onAddRegiment={addRegiment}
              onStartPickRenown={startPickRenown}
              onRemoveRegiment={removeRegiment}
              onRemoveLeader={removeRegimentLeader}
              onRemoveUnit={removeUnitFromRegiment}
              onRemoveAux={removeAuxiliaryUnit}
              onStartPickLeader={startPickLeader}
              onStartPickUnits={startPickUnits}
              onStartPickAux={startPickAuxiliary}
              onCancelPick={cancelPick}
            />
          ) : (
            <FlatStructure
              army={army}
              editMode={editMode}
              onRemoveAux={removeAuxiliaryUnit}
              onStartPickAux={startPickAuxiliary}
              onCancelPick={cancelPick}
            />
          )}
        </div>
      </div>

      {/* Right: Unit Picker */}
      <div className="build-right">
        {editMode === null ? (
          <div className="build-picker-idle">
            <div className="build-picker-idle-icon">⚔</div>
            <p>Select an action on the left to add units to your army.</p>
          </div>
        ) : editMode === 'renown' ? (
          <div className="build-picker">
            <div className="build-picker-header">
              <span className="build-picker-title">Pick a Regiment of Renown</span>
              <input
                type="search"
                className="search-input"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-sm" onClick={cancelPick}>Cancel</button>
            </div>
            <div className="build-picker-list">
              {filteredRenown.length === 0 ? (
                <div className="build-picker-empty">No Regiments of Renown available.</div>
              ) : (
                filteredRenown.map((renown) => (
                  <div key={renown.id} className="build-picker-item">
                    <div className="build-picker-item-header">
                      <span className="unit-name">
                        {renown.name.replace('Regiment of Renown: ', '')}
                      </span>
                      <div className="unit-actions">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => addRenownRegiment(renown)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    {renown.profiles.length > 0 && (
                      <div className="build-picker-item-profiles">
                        <ProfileViewer profiles={renown.profiles} compact />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="build-picker">
            <div className="build-picker-header">
              <span className="build-picker-title">
                {editMode === 'leader' && 'Pick a Leader'}
                {editMode === 'units' && 'Pick a Unit'}
                {editMode === 'auxiliary' && 'Pick an Auxiliary Unit'}
                {editMode === 'terrain' && 'Pick Faction Terrain'}
              </span>
              <input
                type="search"
                className="search-input"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-sm" onClick={cancelPick}>
                Cancel
              </button>
            </div>

            <div className="build-picker-list">
              {filteredPicker.length === 0 ? (
                <div className="build-picker-empty">
                  {pickerUnits.length === 0
                    ? 'No units available for this selection.'
                    : 'No units match your search.'}
                </div>
              ) : (
                filteredPicker.map((unit) => (
                  <div key={unit.linkId} className="build-picker-item">
                    <div
                      className="build-picker-item-header"
                      onClick={() =>
                        setExpandedUnit(expandedUnit === unit.linkId ? null : unit.linkId)
                      }
                    >
                      <span className="unit-name">{unit.name}</span>
                      <div className="unit-actions">
                        {unit.points > 0 && (
                          <span className="unit-points">{unit.points} pts</span>
                        )}
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePickUnit(unit);
                          }}
                        >
                          + Add
                        </button>
                        {unit.profiles.length > 0 && (
                          <button
                            className={`btn btn-sm ${expandedUnit === unit.linkId ? 'btn-active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedUnit(
                                expandedUnit === unit.linkId ? null : unit.linkId
                              );
                            }}
                          >
                            {expandedUnit === unit.linkId ? '▲' : '▼'}
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedUnit === unit.linkId && unit.profiles.length > 0 && (
                      <div className="build-picker-item-profiles">
                        <ProfileViewer profiles={unit.profiles} compact />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- GHB Regiment Structure ----

interface GHBStructureProps {
  army: ArmyList;
  editMode: EditMode;
  editRegimentId: string | null;
  onAddRegiment: () => void;
  onStartPickRenown: () => void;
  onRemoveRegiment: (id: string) => void;
  onRemoveLeader: (regimentId: string) => void;
  onRemoveUnit: (regimentId: string, unitId: string) => void;
  onRemoveAux: (unitId: string) => void;
  onStartPickLeader: (regimentId: string) => void;
  onStartPickUnits: (regimentId: string) => void;
  onStartPickAux: () => void;
  onCancelPick: () => void;
}

function GHBStructure({
  army,
  editMode,
  editRegimentId,
  onAddRegiment,
  onStartPickRenown,
  onRemoveRegiment,
  onRemoveLeader,
  onRemoveUnit,
  onRemoveAux,
  onStartPickLeader,
  onStartPickUnits,
  onStartPickAux,
  onCancelPick,
}: GHBStructureProps) {
  return (
    <div className="ghb-structure">
      {army.regiments.map((regiment, idx) => (
        <div
          key={regiment.id}
          className={`regiment-block ${editRegimentId === regiment.id ? 'regiment-active' : ''} ${regiment.isRegimentOfRenown ? 'regiment-renown' : ''}`}
        >
          <div className="regiment-header">
            <div className="regiment-title-group">
              {regiment.isRegimentOfRenown && (
                <span className="renown-badge">★ Renown</span>
              )}
              <span className="regiment-title">
                {regiment.isRegimentOfRenown && regiment.renownName
                  ? regiment.renownName
                  : `Regiment ${idx + 1}`}
              </span>
            </div>
            <button
              className="btn btn-xs btn-danger"
              onClick={() => onRemoveRegiment(regiment.id)}
              title="Remove regiment"
            >
              ✕
            </button>
          </div>

          {/* Leader */}
          <div className="regiment-section">
            <span className="regiment-section-label">Leader</span>
            {regiment.leader ? (
              <div className="regiment-unit-row">
                <span className="regiment-unit-name leader-name">
                  ⭐ {regiment.leader.name}
                </span>
                {regiment.leader.pointsCost > 0 && (
                  <span className="regiment-unit-pts">{regiment.leader.pointsCost} pts</span>
                )}
                <button
                  className="btn btn-xs btn-danger"
                  onClick={() => onRemoveLeader(regiment.id)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                className={`btn btn-sm btn-ghost ${
                  editMode === 'leader' && editRegimentId === regiment.id ? 'active-pick' : ''
                }`}
                onClick={() => {
                  if (editMode === 'leader' && editRegimentId === regiment.id) {
                    onCancelPick();
                  } else {
                    onStartPickLeader(regiment.id);
                  }
                }}
              >
                {editMode === 'leader' && editRegimentId === regiment.id
                  ? '← Cancel'
                  : '+ Add Leader'}
              </button>
            )}
          </div>

          {/* Regiment Units */}
          <div className="regiment-section">
            <span className="regiment-section-label">Units</span>
            {regiment.units.map((unit) => (
              <div key={unit.id} className="regiment-unit-row">
                <span className="regiment-unit-name">{unit.name}</span>
                {unit.pointsCost > 0 && (
                  <span className="regiment-unit-pts">{unit.pointsCost} pts</span>
                )}
                <button
                  className="btn btn-xs btn-danger"
                  onClick={() => onRemoveUnit(regiment.id, unit.id)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className={`btn btn-sm btn-ghost ${
                editMode === 'units' && editRegimentId === regiment.id ? 'active-pick' : ''
              }`}
              onClick={() => {
                if (editMode === 'units' && editRegimentId === regiment.id) {
                  onCancelPick();
                } else {
                  onStartPickUnits(regiment.id);
                }
              }}
            >
              {editMode === 'units' && editRegimentId === regiment.id
                ? '← Cancel'
                : '+ Add Unit'}
            </button>
          </div>
        </div>
      ))}

      <div className="regiment-add-buttons">
        <button className="btn btn-sm btn-secondary" onClick={onAddRegiment}>
          + Add Regiment
        </button>
        <button
          className={`btn btn-sm btn-secondary ${editMode === 'renown' ? 'active-pick' : ''}`}
          onClick={() => editMode === 'renown' ? onCancelPick() : onStartPickRenown()}
        >
          {editMode === 'renown' ? '← Cancel' : '+ Regiment of Renown'}
        </button>
      </div>

      {/* Auxiliary Units */}
      <div className="aux-block">
        <div className="regiment-header">
          <span className="regiment-title">Auxiliary Units</span>
        </div>
        {army.auxiliaryUnits.map((unit) => (
          <div key={unit.id} className="regiment-unit-row">
            <span className="regiment-unit-name">{unit.name}</span>
            {unit.pointsCost > 0 && (
              <span className="regiment-unit-pts">{unit.pointsCost} pts</span>
            )}
            <button
              className="btn btn-xs btn-danger"
              onClick={() => onRemoveAux(unit.id)}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className={`btn btn-sm btn-ghost ${
            editMode === 'auxiliary' ? 'active-pick' : ''
          }`}
          onClick={() => {
            if (editMode === 'auxiliary') {
              onCancelPick();
            } else {
              onStartPickAux();
            }
          }}
        >
          {editMode === 'auxiliary' ? '← Cancel' : '+ Add Auxiliary'}
        </button>
      </div>
    </div>
  );
}

// ---- Flat Structure (non-GHB forces) ----

interface FlatStructureProps {
  army: ArmyList;
  editMode: EditMode;
  onRemoveAux: (unitId: string) => void;
  onStartPickAux: () => void;
  onCancelPick: () => void;
}

function FlatStructure({
  army,
  editMode,
  onRemoveAux,
  onStartPickAux,
  onCancelPick,
}: FlatStructureProps) {
  const allUnits = [
    ...army.regiments.flatMap((r) => [
      ...(r.leader ? [r.leader] : []),
      ...r.units,
    ]),
    ...army.auxiliaryUnits,
  ];

  return (
    <div className="flat-structure">
      <div className="regiment-header">
        <span className="regiment-title">Units</span>
      </div>
      {allUnits.map((unit) => (
        <div key={unit.id} className="regiment-unit-row">
          <span className="regiment-unit-name">{unit.name}</span>
          {unit.pointsCost > 0 && (
            <span className="regiment-unit-pts">{unit.pointsCost} pts</span>
          )}
          <button
            className="btn btn-xs btn-danger"
            onClick={() => onRemoveAux(unit.id)}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        className={`btn btn-sm btn-ghost ${editMode === 'auxiliary' ? 'active-pick' : ''}`}
        onClick={() => {
          if (editMode === 'auxiliary') {
            onCancelPick();
          } else {
            onStartPickAux();
          }
        }}
      >
        {editMode === 'auxiliary' ? '← Cancel' : '+ Add Unit'}
      </button>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ArmyList, ArmyUnit, ArmyRegiment, Catalogue, SelectionEntry } from '../types/battlescribe';
import { fetchCatalogue } from '../services/dataFetcher';
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

type EditMode = 'leader' | 'units' | 'auxiliary' | null;

interface BuildTabProps {
  army: ArmyList;
  onUpdateArmy: (updates: Partial<ArmyList>) => void;
}

export function BuildTab({ army, onUpdateArmy }: BuildTabProps) {
  const [allUnits, setAllUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editRegimentId, setEditRegimentId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  const loadedRef = useRef<string | null>(null);

  const isGHB = army.forceEntry?.id === GHB_2025_FORCE_ID;

  const loadUnits = useCallback(async () => {
    if (!army.faction) return;
    const key = army.faction.filename + (army.subfaction?.filename ?? '');
    if (loadedRef.current === key) return;

    setLoading(true);
    setError(null);

    try {
      const factionCat = await fetchCatalogue(army.faction.filename);

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
        ...factionCat.entryLinks,
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
      loadedRef.current = key;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load units');
    } finally {
      setLoading(false);
    }
  }, [army.faction, army.subfaction]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

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

  const cancelPick = () => {
    setEditMode(null);
    setEditRegimentId(null);
  };

  // ---- Compute picker units ----

  const pickerUnits: UnitOption[] = (() => {
    if (editMode === 'leader') {
      return allUnits.filter((u) => u.isRegimentalLeader);
    }
    if (editMode === 'units') {
      const regiment = army.regiments.find((r) => r.id === editRegimentId);
      if (!regiment?.leader) return allUnits.filter((u) => !u.isRegimentalLeader);
      const leaderOption = allUnits.find((u) => u.linkId === regiment.leader!.entryLinkId);
      if (!leaderOption) return allUnits.filter((u) => !u.isRegimentalLeader);
      return getValidRegimentUnits(leaderOption, allUnits);
    }
    if (editMode === 'auxiliary') {
      return allUnits.filter((u) => !u.isRegimentalLeader);
    }
    return [];
  })();

  const filteredPicker = search
    ? pickerUnits.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    : pickerUnits;

  const handlePickUnit = (unit: UnitOption) => {
    if (editMode === 'leader' && editRegimentId) {
      setRegimentLeader(editRegimentId, unit);
    } else if (editMode === 'units' && editRegimentId) {
      addUnitToRegiment(editRegimentId, unit);
    } else if (editMode === 'auxiliary') {
      addAuxiliaryUnit(unit);
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
    }, 0) + army.auxiliaryUnits.reduce((sum, u) => sum + u.pointsCost, 0);

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
        ) : (
          <div className="build-picker">
            <div className="build-picker-header">
              <span className="build-picker-title">
                {editMode === 'leader' && 'Pick a Leader'}
                {editMode === 'units' && 'Pick a Unit'}
                {editMode === 'auxiliary' && 'Pick an Auxiliary Unit'}
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
          className={`regiment-block ${editRegimentId === regiment.id ? 'regiment-active' : ''}`}
        >
          <div className="regiment-header">
            <span className="regiment-title">Regiment {idx + 1}</span>
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

      <button className="btn btn-sm btn-secondary" onClick={onAddRegiment}>
        + Add Regiment
      </button>

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

import { useState, useEffect, useCallback } from 'react';
import type {
  ArmyList,
  Subfaction,
  ArmyUnit,
  GameSystem,
  Profile,
  SelectionEntry,
  EntryLink,
} from '../types/battlescribe';
import { KNOWN_FACTIONS, KNOWN_SUBFACTIONS, KNOWN_FORCE_ENTRIES, fetchGameSystem } from '../services/dataFetcher';
import { UnitBrowser } from './UnitBrowser';
import { ArmyRoster } from './ArmyRoster';
import './ArmyBuilder.css';

let nextId = 1;
function generateId() {
  return `army-${Date.now()}-${nextId++}`;
}

function createEmptyArmy(name: string): ArmyList {
  return {
    id: generateId(),
    name,
    faction: null,
    subfaction: null,
    forceEntry: null,
    pointsLimit: 2000,
    units: [],
  };
}

type View = 'home' | 'builder';

export function ArmyBuilder() {
  const [armyLists, setArmyLists] = useState<ArmyList[]>([]);
  const [activeArmyId, setActiveArmyId] = useState<string | null>(null);
  const [view, setView] = useState<View>('home');
  const [gameSystem, setGameSystem] = useState<GameSystem | null>(null);
  const [gameSystemLoading, setGameSystemLoading] = useState(false);
  const [gameSystemError, setGameSystemError] = useState<string | null>(null);

  // Load game system on mount
  useEffect(() => {
    setGameSystemLoading(true);
    fetchGameSystem()
      .then((gs) => setGameSystem(gs))
      .catch((e) => setGameSystemError(e.message))
      .finally(() => setGameSystemLoading(false));
  }, []);

  const activeArmy = armyLists.find((a) => a.id === activeArmyId) ?? null;

  const updateArmy = useCallback((id: string, updates: Partial<ArmyList>) => {
    setArmyLists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const createArmy = () => {
    const army = createEmptyArmy(`New Army ${armyLists.length + 1}`);
    setArmyLists((prev) => [...prev, army]);
    setActiveArmyId(army.id);
    setView('builder');
  };

  const openArmy = (id: string) => {
    setActiveArmyId(id);
    setView('builder');
  };

  const deleteArmy = (id: string) => {
    setArmyLists((prev) => prev.filter((a) => a.id !== id));
    if (activeArmyId === id) {
      setActiveArmyId(null);
      setView('home');
    }
  };

  const addUnit = useCallback(
    (
      _entryLink: EntryLink | null,
      _entry: SelectionEntry | null,
      name: string,
      points: number,
      profiles: Profile[]
    ) => {
      if (!activeArmyId) return;
      const unit: ArmyUnit = {
        id: generateId(),
        entryLinkId: _entryLink?.id ?? '',
        targetId: _entry?.id ?? '',
        name,
        pointsCost: points,
        profiles,
        categoryLinks: _entry?.categoryLinks ?? [],
      };
      updateArmy(activeArmyId, {
        units: [...(activeArmy?.units ?? []), unit],
      });
    },
    [activeArmyId, activeArmy, updateArmy]
  );

  const removeUnit = useCallback(
    (unitId: string) => {
      if (!activeArmyId || !activeArmy) return;
      updateArmy(activeArmyId, {
        units: activeArmy.units.filter((u) => u.id !== unitId),
      });
    },
    [activeArmyId, activeArmy, updateArmy]
  );

  const totalPoints = activeArmy?.units.reduce((sum, u) => sum + u.pointsCost, 0) ?? 0;

  const subfactionsForFaction = activeArmy?.faction
    ? KNOWN_SUBFACTIONS.filter((sf) => sf.factionName === activeArmy.faction!.name)
    : [];

  return (
    <div className="army-builder">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <span className="app-logo">⚔</span>
            <h1 className="app-title">AoS Army Builder</h1>
            <span className="app-subtitle">Age of Sigmar 4.0</span>
          </div>
          <nav className="app-nav">
            <button
              className={`nav-btn ${view === 'home' ? 'active' : ''}`}
              onClick={() => setView('home')}
            >
              My Armies
            </button>
            {activeArmy && (
              <button
                className={`nav-btn ${view === 'builder' ? 'active' : ''}`}
                onClick={() => setView('builder')}
              >
                {activeArmy.name}
              </button>
            )}
            <button className="nav-btn btn-primary" onClick={createArmy}>
              + New Army
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === 'home' && (
          <HomeView
            armyLists={armyLists}
            onCreateArmy={createArmy}
            onOpenArmy={openArmy}
            onDeleteArmy={deleteArmy}
          />
        )}

        {view === 'builder' && activeArmy && (
          <BuilderView
            army={activeArmy}
            gameSystem={gameSystem}
            gameSystemLoading={gameSystemLoading}
            gameSystemError={gameSystemError}
            totalPoints={totalPoints}
            subfactions={subfactionsForFaction}
            onUpdateArmy={(updates) => updateArmy(activeArmy.id, updates)}
            onAddUnit={addUnit}
            onRemoveUnit={removeUnit}
          />
        )}
      </main>
    </div>
  );
}

// ---- Home View ----

interface HomeViewProps {
  armyLists: ArmyList[];
  onCreateArmy: () => void;
  onOpenArmy: (id: string) => void;
  onDeleteArmy: (id: string) => void;
}

function HomeView({ armyLists, onCreateArmy, onOpenArmy, onDeleteArmy }: HomeViewProps) {
  return (
    <div className="home-view">
      <div className="home-hero">
        <h2>Welcome to the Age of Sigmar Army Builder</h2>
        <p>Create and manage your Age of Sigmar 4.0 army lists.</p>
        <button className="btn btn-primary btn-lg" onClick={onCreateArmy}>
          + Create New Army
        </button>
      </div>

      {armyLists.length > 0 && (
        <div className="home-armies">
          <h3>My Armies</h3>
          <div className="army-cards">
            {armyLists.map((army) => (
              <div key={army.id} className="army-card" onClick={() => onOpenArmy(army.id)}>
                <div className="army-card-header">
                  <span className="army-card-name">{army.name}</span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${army.name}"?`)) {
                        onDeleteArmy(army.id);
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="army-card-meta">
                  {army.faction ? (
                    <span>{army.faction.name}</span>
                  ) : (
                    <span className="text-muted">No faction selected</span>
                  )}
                  {army.subfaction && <span> – {army.subfaction.subfactionName}</span>}
                </div>
                <div className="army-card-footer">
                  <span className="army-card-points">
                    {army.units.reduce((s, u) => s + u.pointsCost, 0)} / {army.pointsLimit} pts
                  </span>
                  <span className="army-card-units">{army.units.length} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Builder View ----

interface BuilderViewProps {
  army: ArmyList;
  gameSystem: GameSystem | null;
  gameSystemLoading: boolean;
  gameSystemError: string | null;
  totalPoints: number;
  subfactions: Subfaction[];
  onUpdateArmy: (updates: Partial<ArmyList>) => void;
  onAddUnit: (
    entryLink: EntryLink | null,
    entry: SelectionEntry | null,
    name: string,
    points: number,
    profiles: Profile[]
  ) => void;
  onRemoveUnit: (unitId: string) => void;
}

function BuilderView({
  army,
  gameSystem,
  gameSystemLoading,
  gameSystemError,
  totalPoints,
  subfactions,
  onUpdateArmy,
  onAddUnit,
  onRemoveUnit,
}: BuilderViewProps) {
  const [activeTab, setActiveTab] = useState<'setup' | 'browse' | 'roster'>('setup');

  const isSetupComplete = !!army.faction && !!army.forceEntry;

  return (
    <div className="builder-view">
      <div className="builder-tabs">
        <button
          className={`tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => setActiveTab('setup')}
        >
          1. Setup
          {!isSetupComplete && <span className="tab-badge">!</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''} ${!isSetupComplete ? 'disabled' : ''}`}
          onClick={() => isSetupComplete && setActiveTab('browse')}
          disabled={!isSetupComplete}
          title={!isSetupComplete ? 'Complete setup first' : undefined}
        >
          2. Add Units
        </button>
        <button
          className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          3. Army Roster
          <span className="tab-counter">{army.units.length}</span>
        </button>
      </div>

      <div className="builder-content">
        {activeTab === 'setup' && (
          <SetupTab
            army={army}
            gameSystem={gameSystem}
            gameSystemLoading={gameSystemLoading}
            gameSystemError={gameSystemError}
            subfactions={subfactions}
            onUpdateArmy={onUpdateArmy}
            onProceed={() => setActiveTab('browse')}
          />
        )}

        {activeTab === 'browse' && army.faction && (
          <UnitBrowser
            factionFilename={army.faction.filename}
            subfactionFilename={army.subfaction?.filename}
            onAddUnit={(link, entry, name, pts, profiles) => {
              onAddUnit(link, entry, name, pts, profiles);
            }}
          />
        )}

        {activeTab === 'roster' && (
          <ArmyRoster
            army={army}
            totalPoints={totalPoints}
            onRemoveUnit={onRemoveUnit}
            onUpdateName={(name) => onUpdateArmy({ name })}
            onUpdatePoints={(pointsLimit) => onUpdateArmy({ pointsLimit })}
          />
        )}
      </div>
    </div>
  );
}

// ---- Setup Tab ----

interface SetupTabProps {
  army: ArmyList;
  gameSystem: GameSystem | null;
  gameSystemLoading: boolean;
  gameSystemError: string | null;
  subfactions: Subfaction[];
  onUpdateArmy: (updates: Partial<ArmyList>) => void;
  onProceed: () => void;
}

function SetupTab({
  army,
  gameSystem,
  gameSystemLoading,
  gameSystemError,
  subfactions,
  onUpdateArmy,
  onProceed,
}: SetupTabProps) {
  const visibleForces =
    (gameSystem?.forceEntries ?? KNOWN_FORCE_ENTRIES).filter((fe) => !fe.hidden);

  const handleFactionChange = (factionId: string) => {
    const faction = KNOWN_FACTIONS.find((f) => f.id === factionId) ?? null;
    onUpdateArmy({ faction, subfaction: null });
  };

  const handleSubfactionChange = (value: string) => {
    if (!value) {
      onUpdateArmy({ subfaction: null });
      return;
    }
    const sf = subfactions.find((s) => s.id === value) ?? null;
    onUpdateArmy({ subfaction: sf });
  };

  const handleForceChange = (forceId: string) => {
    const force = visibleForces.find((f) => f.id === forceId) ?? null;
    onUpdateArmy({ forceEntry: force });
  };

  const isComplete = !!army.faction && !!army.forceEntry;

  return (
    <div className="setup-tab">
      <div className="setup-section">
        <h3 className="setup-section-title">Army Name</h3>
        <input
          type="text"
          className="form-input"
          value={army.name}
          onChange={(e) => onUpdateArmy({ name: e.target.value })}
          placeholder="My Army"
        />
      </div>

      <div className="setup-section">
        <h3 className="setup-section-title">
          Faction <span className="required">*</span>
        </h3>
        <select
          className="form-select"
          value={army.faction?.id ?? ''}
          onChange={(e) => handleFactionChange(e.target.value)}
        >
          <option value="">— Select a Faction —</option>
          {KNOWN_FACTIONS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {army.faction && subfactions.length > 0 && (
        <div className="setup-section">
          <h3 className="setup-section-title">
            Subfaction <span className="optional">(optional)</span>
          </h3>
          <select
            className="form-select"
            value={army.subfaction?.id ?? ''}
            onChange={(e) => handleSubfactionChange(e.target.value)}
          >
            <option value="">— No Subfaction —</option>
            {subfactions.map((sf) => (
              <option key={sf.id} value={sf.id}>
                {sf.subfactionName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="setup-section">
        <h3 className="setup-section-title">
          Force <span className="required">*</span>
        </h3>
        {gameSystemLoading && (
          <div className="loading-inline">
            <div className="spinner spinner-sm" /> Loading forces...
          </div>
        )}
        {gameSystemError && !gameSystemLoading && (
          <div className="error-inline">⚠️ Using offline force data (network unavailable)</div>
        )}
        {!gameSystemLoading && (
          <select
            className="form-select"
            value={army.forceEntry?.id ?? ''}
            onChange={(e) => handleForceChange(e.target.value)}
          >
            <option value="">— Select a Force —</option>
            {visibleForces.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
        {army.forceEntry && (
          <p className="form-hint">
            {army.forceEntry.childForcesLabel && (
              <>Force type: {army.forceEntry.childForcesLabel}</>
            )}
          </p>
        )}
      </div>

      <div className="setup-section">
        <h3 className="setup-section-title">Points Limit</h3>
        <div className="points-row">
          <input
            type="number"
            className="form-input form-input-sm"
            value={army.pointsLimit}
            min={0}
            step={250}
            onChange={(e) => onUpdateArmy({ pointsLimit: parseInt(e.target.value, 10) || 0 })}
          />
          <span className="form-hint">pts</span>
        </div>
        <div className="points-presets">
          {[1000, 1500, 2000, 2500, 3000].map((pts) => (
            <button
              key={pts}
              className={`preset-btn ${army.pointsLimit === pts ? 'active' : ''}`}
              onClick={() => onUpdateArmy({ pointsLimit: pts })}
            >
              {pts}
            </button>
          ))}
        </div>
      </div>

      <div className="setup-actions">
        <button
          className="btn btn-primary btn-lg"
          onClick={onProceed}
          disabled={!isComplete}
          title={!isComplete ? 'Select a faction and force to continue' : undefined}
        >
          Add Units →
        </button>
        {!isComplete && (
          <p className="setup-hint">Please select a Faction and Force to continue.</p>
        )}
      </div>
    </div>
  );
}

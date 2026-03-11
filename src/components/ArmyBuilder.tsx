import { useState, useEffect, useCallback } from 'react';
import type {
  ArmyList,
  Subfaction,
  GameSystem,
} from '../types/battlescribe';
import { KNOWN_FACTIONS, KNOWN_SUBFACTIONS, KNOWN_FORCE_ENTRIES, fetchGameSystem } from '../services/dataFetcher';
import { BuildTab } from './BuildTab';
import { ArmySummary } from './ArmySummary';
import { AbilitiesSummary } from './AbilitiesSummary';
import { ImportModal } from './ImportModal';
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
    regiments: [],
    auxiliaryUnits: [],
    factionTerrainUnit: null,
    generalUnitId: null,
    battleTraitProfiles: [],
    battleFormation: null,
    spellLore: null,
    prayerLore: null,
    manifestationLore: null,
  };
}

function getArmyTotalPoints(army: ArmyList): number {
  const regimentPts = army.regiments.reduce(
    (sum, r) =>
      sum + (r.leader?.pointsCost ?? 0) + r.units.reduce((s, u) => s + u.pointsCost, 0),
    0
  );
  return regimentPts + army.auxiliaryUnits.reduce((sum, u) => sum + u.pointsCost, 0);
}

function getArmyUnitCount(army: ArmyList): number {
  return (
    army.regiments.reduce((sum, r) => sum + (r.leader ? 1 : 0) + r.units.length, 0) +
    army.auxiliaryUnits.length
  );
}

type View = 'home' | 'builder';

export function ArmyBuilder() {
  const [armyLists, setArmyLists] = useState<ArmyList[]>([]);
  const [activeArmyId, setActiveArmyId] = useState<string | null>(null);
  const [view, setView] = useState<View>('home');
  const [gameSystem, setGameSystem] = useState<GameSystem | null>(null);
  const [gameSystemLoading, setGameSystemLoading] = useState(true);
  const [gameSystemError, setGameSystemError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Load game system on mount
  useEffect(() => {
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

  // Stable per-active-army update callback so BuildTab's useCallback doesn't thrash.
  const handleUpdateActiveArmy = useCallback(
    (updates: Partial<ArmyList>) => {
      if (activeArmyId) updateArmy(activeArmyId, updates);
    },
    [updateArmy, activeArmyId]
  );

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

  const importArmy = useCallback((army: ArmyList) => {
    setArmyLists((prev) => [...prev, army]);
    setActiveArmyId(army.id);
    setShowImportModal(false);
    setView('builder');
  }, []);

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
            <button className="nav-btn" onClick={() => setShowImportModal(true)}>
              ↓ Import
            </button>
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
            onImportArmy={() => setShowImportModal(true)}
          />
        )}

        {view === 'builder' && activeArmy && (
          <BuilderView
            army={activeArmy}
            gameSystem={gameSystem}
            gameSystemLoading={gameSystemLoading}
            gameSystemError={gameSystemError}
            subfactions={subfactionsForFaction}
            onUpdateArmy={handleUpdateActiveArmy}
          />
        )}
      </main>

      {showImportModal && (
        <ImportModal
          onImport={importArmy}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

// ---- Home View ----

interface HomeViewProps {
  armyLists: ArmyList[];
  onCreateArmy: () => void;
  onOpenArmy: (id: string) => void;
  onDeleteArmy: (id: string) => void;
  onImportArmy: () => void;
}

function HomeView({ armyLists, onCreateArmy, onOpenArmy, onDeleteArmy, onImportArmy }: HomeViewProps) {
  return (
    <div className="home-view">
      <div className="home-hero">
        <h2>Welcome to the Age of Sigmar Army Builder</h2>
        <p>Create and manage your Age of Sigmar 4.0 army lists.</p>
        <div className="home-hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onCreateArmy}>
            + Create New Army
          </button>
          <button className="btn btn-lg" onClick={onImportArmy}>
            ↓ Import from Text
          </button>
        </div>
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
                    {getArmyTotalPoints(army)} / {army.pointsLimit} pts
                  </span>
                  <span className="army-card-units">{getArmyUnitCount(army)} units</span>
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
  subfactions: Subfaction[];
  onUpdateArmy: (updates: Partial<ArmyList>) => void;
}

function BuilderView({
  army,
  gameSystem,
  gameSystemLoading,
  gameSystemError,
  subfactions,
  onUpdateArmy,
}: BuilderViewProps) {
  const [activeTab, setActiveTab] = useState<'setup' | 'build' | 'summary' | 'abilities'>('setup');

  const isSetupComplete = !!army.faction && !!army.forceEntry;

  const unitCount =
    army.regiments.reduce((sum, r) => sum + (r.leader ? 1 : 0) + r.units.length, 0) +
    army.auxiliaryUnits.length;

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
          className={`tab-btn ${activeTab === 'build' ? 'active' : ''} ${!isSetupComplete ? 'disabled' : ''}`}
          onClick={() => isSetupComplete && setActiveTab('build')}
          disabled={!isSetupComplete}
          title={!isSetupComplete ? 'Complete setup first' : undefined}
        >
          2. Build Army
          {unitCount > 0 && <span className="tab-counter">{unitCount}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          3. Army Summary
        </button>
        <button
          className={`tab-btn ${activeTab === 'abilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('abilities')}
        >
          4. Abilities Summary
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
            onProceed={() => setActiveTab('build')}
          />
        )}

        {activeTab === 'build' && army.faction && (
          <BuildTab army={army} onUpdateArmy={onUpdateArmy} />
        )}

        {activeTab === 'summary' && (
          <ArmySummary army={army} />
        )}

        {activeTab === 'abilities' && (
          <AbilitiesSummary army={army} />
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
          Build Army →
        </button>
        {!isComplete && (
          <p className="setup-hint">Please select a Faction and Force to continue.</p>
        )}
      </div>
    </div>
  );
}

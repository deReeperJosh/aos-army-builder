import { useState, useEffect, useCallback, useRef } from 'react';
import type { ArmyList, Catalogue, FactionOption, Profile, ArmyUnit } from '../types/battlescribe';
import { fetchCatalogue } from '../services/dataFetcher';
import { ProfileViewer } from './ProfileViewer';
import './FactionRulesTab.css';

interface FactionRulesTabProps {
  army: ArmyList;
  onUpdateArmy: (updates: Partial<ArmyList>) => void;
}

// GHB force IDs that support lore selection
const GHB_FORCE_IDS = new Set([
  'f079-501a-2738-6845', // GHB 2025-26
  'f079-501a-2738-6844', // GHB 2024-25
]);

export function FactionRulesTab({ army, onUpdateArmy }: FactionRulesTabProps) {
  const [factionCat, setFactionCat] = useState<Catalogue | null>(null);
  const [loresCat, setLoresCat] = useState<Catalogue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);

  const loadedRef = useRef<string | null>(null);

  const supportsLores = army.forceEntry ? GHB_FORCE_IDS.has(army.forceEntry.id) : false;

  const loadCatalogues = useCallback(async () => {
    if (!army.faction) return;
    const key = army.faction.filename + (army.subfaction?.filename ?? '');
    if (loadedRef.current === key) return;

    setLoading(true);
    setError(null);

    try {
      const cat = await fetchCatalogue(army.faction.filename);
      setFactionCat(cat);

      // Store battle traits in army when faction catalogue is loaded
      if (cat.battleTraitProfiles.length > 0) {
        onUpdateArmy({ battleTraitProfiles: cat.battleTraitProfiles });
      }

      // Load Lores.cat if lores are available
      if (
        cat.spellLores.length > 0 ||
        cat.prayerLores.length > 0 ||
        cat.manifestationLores.length > 0
      ) {
        try {
          const lores = await fetchCatalogue('Lores.cat');
          setLoresCat(lores);
        } catch {
          // Lores.cat may not be available; ignore
        }
      }

      loadedRef.current = key;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load faction data');
    } finally {
      setLoading(false);
    }
  }, [army.faction, army.subfaction, onUpdateArmy]);

  useEffect(() => {
    loadCatalogues();
  }, [loadCatalogues]);

  // Get profiles for a lore option by looking up the targetGroupId in loresCat
  const getLoreProfiles = (option: FactionOption): Profile[] => {
    if (option.profiles.length > 0) return option.profiles;
    if (!option.targetGroupId || !loresCat) return [];

    // Look through all selectionEntryGroups in loresCat for the matching group
    const group = loresCat.selectionEntryGroups.find((g) => g.id === option.targetGroupId);
    if (!group) return [];

    // Collect all profiles from all options in the group
    return group.options.flatMap((o) => o.profiles);
  };

  const handleSelectFormation = (formationId: string) => {
    if (!factionCat) return;
    if (!formationId) {
      onUpdateArmy({ battleFormation: null });
      return;
    }
    const formation = factionCat.battleFormations.find((f) => f.id === formationId);
    onUpdateArmy({ battleFormation: formation ?? null });
  };

  const handleSelectSpellLore = (loreId: string) => {
    if (!factionCat) return;
    if (!loreId) {
      onUpdateArmy({ spellLore: null });
      return;
    }
    const option = factionCat.spellLores.find((l) => l.id === loreId);
    if (!option) return;
    const profiles = getLoreProfiles(option);
    onUpdateArmy({ spellLore: { ...option, profiles } });
  };

  const handleSelectPrayerLore = (loreId: string) => {
    if (!factionCat) return;
    if (!loreId) {
      onUpdateArmy({ prayerLore: null });
      return;
    }
    const option = factionCat.prayerLores.find((l) => l.id === loreId);
    if (!option) return;
    const profiles = getLoreProfiles(option);
    onUpdateArmy({ prayerLore: { ...option, profiles } });
  };

  const handleSelectManifestationLore = (loreId: string) => {
    if (!factionCat) return;
    if (!loreId) {
      onUpdateArmy({ manifestationLore: null });
      return;
    }
    const option = factionCat.manifestationLores.find((l) => l.id === loreId);
    if (!option) return;
    const profiles = getLoreProfiles(option);
    onUpdateArmy({ manifestationLore: { ...option, profiles } });
  };

  const handleSelectGeneral = (unitId: string) => {
    onUpdateArmy({ generalUnitId: unitId || null });
  };

  // Collect all regimental leaders for General selection
  const allLeaders: ArmyUnit[] = army.regiments
    .filter((r) => r.leader !== null)
    .map((r) => r.leader!);

  if (loading) {
    return (
      <div className="faction-rules-tab">
        <div className="faction-rules-loading">
          <div className="spinner" />
          <p>Loading faction rules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faction-rules-tab">
        <div className="faction-rules-error">⚠️ {error}</div>
      </div>
    );
  }

  if (!army.faction) {
    return (
      <div className="faction-rules-tab">
        <p className="faction-rules-hint">Select a faction in the Setup tab first.</p>
      </div>
    );
  }

  return (
    <div className="faction-rules-tab">
      {/* Battle Traits */}
      <section className="faction-rules-section">
        <h3 className="faction-rules-section-title">
          <span className="faction-rules-icon">⚔️</span>
          Battle Traits
        </h3>
        {army.battleTraitProfiles.length === 0 ? (
          <p className="faction-rules-empty">No battle traits found for this faction.</p>
        ) : (
          <div className="faction-traits-list">
            {army.battleTraitProfiles.map((profile) => (
              <div key={profile.id} className="faction-trait-card">
                <button
                  className="faction-trait-header"
                  onClick={() =>
                    setExpandedTrait(expandedTrait === profile.id ? null : profile.id)
                  }
                >
                  <span className="faction-trait-name">{profile.name}</span>
                  <span className="faction-trait-type">{profile.typeName}</span>
                  <span className="faction-trait-toggle">
                    {expandedTrait === profile.id ? '▲' : '▼'}
                  </span>
                </button>
                {expandedTrait === profile.id && (
                  <div className="faction-trait-body">
                    <ProfileViewer profiles={[profile]} compact />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Battle Formation */}
      {factionCat && factionCat.battleFormations.length > 0 && (
        <section className="faction-rules-section">
          <h3 className="faction-rules-section-title">
            <span className="faction-rules-icon">🏛️</span>
            Battle Formation
          </h3>
          <select
            className="form-select"
            value={army.battleFormation?.id ?? ''}
            onChange={(e) => handleSelectFormation(e.target.value)}
          >
            <option value="">— No Battle Formation —</option>
            {factionCat.battleFormations.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {army.battleFormation && army.battleFormation.profiles.length > 0 && (
            <div className="faction-formation-preview">
              <ProfileViewer profiles={army.battleFormation.profiles} compact />
            </div>
          )}
        </section>
      )}

      {/* Spell Lore */}
      {factionCat && factionCat.spellLores.length > 0 && supportsLores && (
        <section className="faction-rules-section">
          <h3 className="faction-rules-section-title">
            <span className="faction-rules-icon">✨</span>
            Spell Lore
          </h3>
          <select
            className="form-select"
            value={army.spellLore?.id ?? ''}
            onChange={(e) => handleSelectSpellLore(e.target.value)}
          >
            <option value="">— No Spell Lore —</option>
            {factionCat.spellLores.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {army.spellLore && army.spellLore.profiles.length > 0 && (
            <div className="faction-lore-preview">
              <p className="faction-lore-label">Spells from {army.spellLore.name}:</p>
              <ProfileViewer profiles={army.spellLore.profiles} compact />
            </div>
          )}
        </section>
      )}

      {/* Prayer Lore */}
      {factionCat && factionCat.prayerLores.length > 0 && supportsLores && (
        <section className="faction-rules-section">
          <h3 className="faction-rules-section-title">
            <span className="faction-rules-icon">🙏</span>
            Prayer Lore
          </h3>
          <select
            className="form-select"
            value={army.prayerLore?.id ?? ''}
            onChange={(e) => handleSelectPrayerLore(e.target.value)}
          >
            <option value="">— No Prayer Lore —</option>
            {factionCat.prayerLores.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {army.prayerLore && army.prayerLore.profiles.length > 0 && (
            <div className="faction-lore-preview">
              <p className="faction-lore-label">Prayers from {army.prayerLore.name}:</p>
              <ProfileViewer profiles={army.prayerLore.profiles} compact />
            </div>
          )}
        </section>
      )}

      {/* Manifestation Lore */}
      {factionCat && factionCat.manifestationLores.length > 0 && supportsLores && (
        <section className="faction-rules-section">
          <h3 className="faction-rules-section-title">
            <span className="faction-rules-icon">🌀</span>
            Manifestation Lore
          </h3>
          <select
            className="form-select"
            value={army.manifestationLore?.id ?? ''}
            onChange={(e) => handleSelectManifestationLore(e.target.value)}
          >
            <option value="">— No Manifestation Lore —</option>
            {factionCat.manifestationLores.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {army.manifestationLore && army.manifestationLore.profiles.length > 0 && (
            <div className="faction-lore-preview">
              <p className="faction-lore-label">
                Manifestations from {army.manifestationLore.name}:
              </p>
              <ProfileViewer profiles={army.manifestationLore.profiles} compact />
            </div>
          )}
          {army.manifestationLore && army.manifestationLore.profiles.length === 0 && (
            <p className="faction-rules-hint">
              Selected: <strong>{army.manifestationLore.name}</strong>
            </p>
          )}
        </section>
      )}

      {/* General Selection */}
      <section className="faction-rules-section">
        <h3 className="faction-rules-section-title">
          <span className="faction-rules-icon">⭐</span>
          General
        </h3>
        {allLeaders.length === 0 ? (
          <p className="faction-rules-hint">
            Add regimental leaders in the Build Army tab to select a General.
          </p>
        ) : (
          <select
            className="form-select"
            value={army.generalUnitId ?? ''}
            onChange={(e) => handleSelectGeneral(e.target.value)}
          >
            <option value="">— No General Selected —</option>
            {allLeaders.map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.name}
              </option>
            ))}
          </select>
        )}
      </section>
    </div>
  );
}

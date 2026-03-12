import { useState } from 'react';
import type { SpearheadArmy, SpearheadAbility, SpearheadUnit, SpearheadWeapon } from '../types/spearhead';
import { SPEARHEAD_ARMIES } from '../data/spearheadArmies';
import './SpearheadView.css';

// ---- Timing helpers ----

const TIMING_SECTIONS = [
  'Deployment Phase',
  'Start of Battle Round',
  'Start of Turn',
  'Your Hero Phase',
  'Your Movement Phase',
  'Your Shooting Phase',
  'Your Charge Phase',
  'Your Combat Phase',
  'End of Turn',
  'End of Any Turn',
  'Start of Enemy Turn',
  'Enemy Hero Phase',
  'Enemy Movement Phase',
  'Enemy Shooting Phase',
  'Enemy Charge Phase',
  'Enemy Combat Phase',
  'End of Enemy Turn',
  'End of Battle Round',
];

function matchTimingToSections(timing: string): string[] {
  const t = timing.toLowerCase();
  const sections: string[] = [];

  if (t.includes('any combat phase')) {
    sections.push('Your Combat Phase', 'Enemy Combat Phase');
  } else {
    if (t.includes('your combat phase')) sections.push('Your Combat Phase');
    if (t.includes('enemy combat phase')) sections.push('Enemy Combat Phase');
  }
  if (t.includes('any hero phase')) {
    sections.push('Your Hero Phase', 'Enemy Hero Phase');
  } else {
    if (t.includes('your hero phase')) sections.push('Your Hero Phase');
    if (t.includes('enemy hero phase')) sections.push('Enemy Hero Phase');
  }
  if (t.includes('any charge phase')) {
    sections.push('Your Charge Phase', 'Enemy Charge Phase');
  } else {
    if (t.includes('your charge phase')) sections.push('Your Charge Phase');
    if (t.includes('enemy charge phase')) sections.push('Enemy Charge Phase');
  }
  if (t.includes('any movement phase')) {
    sections.push('Your Movement Phase', 'Enemy Movement Phase');
  } else {
    if (t.includes('your movement phase')) sections.push('Your Movement Phase');
    if (t.includes('enemy movement phase')) sections.push('Enemy Movement Phase');
  }
  if (t.includes('any shooting phase')) {
    sections.push('Your Shooting Phase', 'Enemy Shooting Phase');
  } else {
    if (t.includes('your shooting phase')) sections.push('Your Shooting Phase');
    if (t.includes('enemy shooting phase')) sections.push('Enemy Shooting Phase');
  }
  if (t.includes('end of any turn')) {
    sections.push('End of Any Turn');
  } else if (t.includes('end of turn')) {
    sections.push('End of Turn');
  }
  if (sections.length > 0) return sections;
  for (const section of TIMING_SECTIONS) {
    if (t.includes(section.toLowerCase())) {
      sections.push(section);
      break;
    }
  }
  return sections;
}

// ---- Sub-components ----

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="sh-stat-box">
      <span className="sh-stat-val">{value}</span>
      <span className="sh-stat-key">{label}</span>
    </div>
  );
}

function WeaponTable({ weapons, title }: { weapons: SpearheadWeapon[]; title: string }) {
  if (weapons.length === 0) return null;
  const hasRange = weapons.some((w) => w.range);
  return (
    <div className="sh-weapon-table">
      <div className="sh-weapon-table-title">{title}</div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            {hasRange && <th>Range</th>}
            <th>Attacks</th>
            <th>Hit</th>
            <th>Wound</th>
            <th>Rend</th>
            <th>Damage</th>
            <th>Ability</th>
          </tr>
        </thead>
        <tbody>
          {weapons.map((w) => (
            <tr key={w.name}>
              <td>{w.name}</td>
              {hasRange && <td>{w.range ?? '-'}</td>}
              <td>{w.attacks}</td>
              <td>{w.hit}</td>
              <td>{w.wound}</td>
              <td>{w.rend}</td>
              <td>{w.damage}</td>
              <td>{w.ability ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AbilityBlock({ ability }: { ability: SpearheadAbility }) {
  return (
    <div className="sh-ability-block">
      <div className="sh-ability-header">
        <span className="sh-ability-name">{ability.name}</span>
        <span className="sh-ability-timing">{ability.timing}</span>
      </div>
      {ability.declare && (
        <p className="sh-ability-text">
          <strong>Declare:</strong> {ability.declare}
        </p>
      )}
      <p className="sh-ability-text" style={{ whiteSpace: 'pre-line' }}>
        <strong>Effect:</strong> {ability.effect}
      </p>
      {ability.keywords && ability.keywords.length > 0 && (
        <div className="sh-ability-keywords">
          {ability.keywords.map((kw) => (
            <span key={kw} className="sh-keyword-badge">{kw}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function UnitCard({ unit }: { unit: SpearheadUnit }) {
  return (
    <div className={`sh-unit-card ${unit.isGeneral ? 'sh-unit-card-general' : ''}`}>
      <div className="sh-unit-card-header">
        <div className="sh-unit-card-title">
          {unit.isGeneral && <span className="sh-general-star">⭐ GENERAL</span>}
          <span className="sh-unit-name">{unit.name}</span>
          <span className="sh-unit-count">{unit.count}</span>
        </div>
        <div className="sh-unit-keywords">
          {unit.keywords.map((kw) => (
            <span key={kw} className="sh-keyword-badge">{kw}</span>
          ))}
        </div>
      </div>

      <div className="sh-stat-block">
        <StatBox label="Move" value={unit.move} />
        <StatBox label="Health" value={unit.health} />
        <StatBox label="Save" value={unit.save} />
        {unit.ward && <StatBox label="Ward" value={unit.ward} />}
        <StatBox label="Control" value={unit.control} />
      </div>

      {unit.rangedWeapons.length > 0 && (
        <WeaponTable weapons={unit.rangedWeapons} title="Ranged Weapons" />
      )}
      {unit.meleeWeapons.length > 0 && (
        <WeaponTable weapons={unit.meleeWeapons} title="Melee Weapons" />
      )}

      {unit.abilities.length > 0 && (
        <div className="sh-unit-abilities">
          {unit.abilities.map((a) => (
            <AbilityBlock key={a.name} ability={a} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Army Summary Tab ----

function ArmySummaryTab({ army }: { army: SpearheadArmy }) {
  return (
    <div className="sh-tab-content">
      <div className="sh-units-grid">
        {army.units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}

// ---- Abilities Summary Tab ----

interface AbilityEntry {
  sourceName: string;
  ability: SpearheadAbility;
}

function AbilityCard({ entry }: { entry: AbilityEntry }) {
  return (
    <div className="sh-ability-card">
      <div className="sh-ability-card-header">
        <span className="sh-ability-name">{entry.ability.name}</span>
        <span className="sh-ability-source">{entry.sourceName}</span>
      </div>
      {entry.ability.declare && (
        <p className="sh-ability-text">
          <strong>Declare:</strong> {entry.ability.declare}
        </p>
      )}
      <p className="sh-ability-text" style={{ whiteSpace: 'pre-line' }}>
        <strong>Effect:</strong> {entry.ability.effect}
      </p>
      {entry.ability.keywords && entry.ability.keywords.length > 0 && (
        <div className="sh-ability-keywords">
          {entry.ability.keywords.map((kw) => (
            <span key={kw} className="sh-keyword-badge">{kw}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function AbilitiesSummaryTab({
  army,
  selectedRegimentalAbilityIndex,
  selectedEnhancementIndex,
}: {
  army: SpearheadArmy;
  selectedRegimentalAbilityIndex: number;
  selectedEnhancementIndex: number;
}) {
  // Collect all abilities
  const passiveAbilities: AbilityEntry[] = [];
  const sectionMap = new Map<string, AbilityEntry[]>();
  for (const section of TIMING_SECTIONS) sectionMap.set(section, []);
  const uncategorised: AbilityEntry[] = [];

  const classify = (ability: SpearheadAbility, sourceName: string) => {
    const entry: AbilityEntry = { sourceName, ability };
    if (ability.timing.toLowerCase() === 'passive') {
      passiveAbilities.push(entry);
      return;
    }
    const sections = matchTimingToSections(ability.timing);
    if (sections.length === 0) {
      uncategorised.push(entry);
    } else {
      for (const sec of sections) sectionMap.get(sec)?.push(entry);
    }
  };

  // Battle traits
  for (const bt of army.battleTraits) classify(bt, `${army.name} (Battle Trait)`);

  // Selected regiment ability
  const regAbility = army.regimentalAbilities[selectedRegimentalAbilityIndex];
  if (regAbility) classify(regAbility, `${army.name} (Regiment Ability)`);

  // Selected enhancement
  const enhancement = army.enhancements[selectedEnhancementIndex];
  if (enhancement) classify(enhancement, `${army.name} (Enhancement)`);

  // Unit abilities
  for (const unit of army.units) {
    const label = unit.isGeneral ? `${unit.name} ⭐` : unit.name;
    for (const a of unit.abilities) classify(a, label);
  }

  return (
    <div className="sh-tab-content">
      {passiveAbilities.length > 0 && (
        <section className="sh-ability-section">
          <h3 className="sh-ability-section-title passive-title">Passive Abilities</h3>
          <div className="sh-ability-cards">
            {passiveAbilities.map((e, i) => (
              <AbilityCard key={i} entry={e} />
            ))}
          </div>
        </section>
      )}

      {TIMING_SECTIONS.map((section) => {
        const entries = sectionMap.get(section) ?? [];
        if (entries.length === 0) return null;
        return (
          <section key={section} className="sh-ability-section">
            <h3 className="sh-ability-section-title">{section}</h3>
            <div className="sh-ability-cards">
              {entries.map((e, i) => (
                <AbilityCard key={i} entry={e} />
              ))}
            </div>
          </section>
        );
      })}

      {uncategorised.length > 0 && (
        <section className="sh-ability-section">
          <h3 className="sh-ability-section-title">Other Abilities</h3>
          <div className="sh-ability-cards">
            {uncategorised.map((e, i) => (
              <AbilityCard key={i} entry={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ---- Main SpearheadView ----

type SpearheadTab = 'setup' | 'summary' | 'abilities';

export function SpearheadView() {
  const [selectedArmyId, setSelectedArmyId] = useState<string>('');
  const [selectedRegimentalAbilityIndex, setSelectedRegimentalAbilityIndex] = useState(0);
  const [selectedEnhancementIndex, setSelectedEnhancementIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<SpearheadTab>('setup');

  const army: SpearheadArmy | null =
    SPEARHEAD_ARMIES.find((a) => a.id === selectedArmyId) || null;

  const handleArmyChange = (id: string) => {
    setSelectedArmyId(id);
    setSelectedRegimentalAbilityIndex(0);
    setSelectedEnhancementIndex(0);
    if (id) setActiveTab('setup');
  };

  return (
    <div className="spearhead-view">
      <div className="sh-header">
        <h2 className="sh-title">⚔ Spearhead Armies</h2>
        <p className="sh-subtitle">
          Spearhead armies are pre-determined forces. Select your army, pick one regiment ability
          and one enhancement, then view your army summary and abilities.
        </p>
      </div>

      {/* Army selector */}
      <div className="sh-selector-row">
        <label className="sh-label" htmlFor="sh-army-select">
          Select Spearhead Army
        </label>
        <select
          id="sh-army-select"
          className="form-select sh-army-select"
          value={selectedArmyId}
          onChange={(e) => handleArmyChange(e.target.value)}
        >
          <option value="">— Choose a Spearhead Army —</option>
          {SPEARHEAD_ARMIES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {!army && (
        <div className="sh-empty">
          <p>Select a Spearhead army above to get started.</p>
        </div>
      )}

      {army && (
        <>
          {/* Tabs */}
          <div className="sh-tabs">
            <button
              className={`sh-tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
              onClick={() => setActiveTab('setup')}
            >
              1. Setup
            </button>
            <button
              className={`sh-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              2. Army Summary
            </button>
            <button
              className={`sh-tab-btn ${activeTab === 'abilities' ? 'active' : ''}`}
              onClick={() => setActiveTab('abilities')}
            >
              3. Abilities Summary
            </button>
          </div>

          {/* Setup tab */}
          {activeTab === 'setup' && (
            <div className="sh-setup-content">
              {/* Battle Traits */}
              <section className="sh-setup-section">
                <h3 className="sh-section-title">Battle Traits</h3>
                <div className="sh-trait-list">
                  {army.battleTraits.map((bt) => (
                    <AbilityBlock key={bt.name} ability={bt} />
                  ))}
                </div>
              </section>

              {/* Regiment Abilities */}
              <section className="sh-setup-section">
                <h3 className="sh-section-title">
                  Regiment Abilities
                  <span className="sh-pick-label">Pick 1</span>
                </h3>
                <div className="sh-choice-grid">
                  {army.regimentalAbilities.map((ra, i) => (
                    <button
                      key={ra.name}
                      className={`sh-choice-card ${selectedRegimentalAbilityIndex === i ? 'selected' : ''}`}
                      onClick={() => setSelectedRegimentalAbilityIndex(i)}
                    >
                      <AbilityBlock ability={ra} />
                    </button>
                  ))}
                </div>
              </section>

              {/* Enhancements */}
              <section className="sh-setup-section">
                <h3 className="sh-section-title">
                  Enhancements
                  <span className="sh-pick-label">Pick 1</span>
                </h3>
                <div className="sh-choice-grid">
                  {army.enhancements.map((enh, i) => (
                    <button
                      key={enh.name}
                      className={`sh-choice-card ${selectedEnhancementIndex === i ? 'selected' : ''}`}
                      onClick={() => setSelectedEnhancementIndex(i)}
                    >
                      <AbilityBlock ability={enh} />
                    </button>
                  ))}
                </div>
              </section>

              {/* Proceed button */}
              <div className="sh-setup-actions">
                <div className="sh-selections-summary">
                  <span className="sh-selection-badge">
                    ⚔ {army.regimentalAbilities[selectedRegimentalAbilityIndex]?.name}
                  </span>
                  <span className="sh-selection-badge sh-enhancement-badge">
                    ✦ {army.enhancements[selectedEnhancementIndex]?.name}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setActiveTab('summary')}
                >
                  View Army Summary →
                </button>
              </div>
            </div>
          )}

          {/* Army Summary tab */}
          {activeTab === 'summary' && (
            <div className="sh-summary-banner">
              <div className="sh-summary-header">
                <div>
                  <span className="sh-summary-name">{army.name}</span>
                  <span className="sh-summary-label"> Spearhead</span>
                </div>
                <div className="sh-summary-badges">
                  <span className="sh-selection-badge">
                    ⚔ {army.regimentalAbilities[selectedRegimentalAbilityIndex]?.name}
                  </span>
                  <span className="sh-selection-badge sh-enhancement-badge">
                    ✦ {army.enhancements[selectedEnhancementIndex]?.name}
                  </span>
                </div>
              </div>
              <ArmySummaryTab army={army} />
            </div>
          )}

          {/* Abilities Summary tab */}
          {activeTab === 'abilities' && (
            <div className="sh-summary-banner">
              <div className="sh-summary-header">
                <div>
                  <span className="sh-summary-name">{army.name}</span>
                  <span className="sh-summary-label"> Spearhead</span>
                </div>
                <div className="sh-summary-badges">
                  <span className="sh-selection-badge">
                    ⚔ {army.regimentalAbilities[selectedRegimentalAbilityIndex]?.name}
                  </span>
                  <span className="sh-selection-badge sh-enhancement-badge">
                    ✦ {army.enhancements[selectedEnhancementIndex]?.name}
                  </span>
                </div>
              </div>
              <AbilitiesSummaryTab
                army={army}
                selectedRegimentalAbilityIndex={selectedRegimentalAbilityIndex}
                selectedEnhancementIndex={selectedEnhancementIndex}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

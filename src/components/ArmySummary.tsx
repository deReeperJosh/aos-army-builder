import type { ArmyList, ArmyUnit, Profile } from '../types/battlescribe';
import { ProfileViewer } from './ProfileViewer';
import './ArmySummary.css';

interface ArmySummaryProps {
  army: ArmyList;
}

interface UnitCardInfo {
  unit: ArmyUnit;
  regimentLabel: string;
  isLeader: boolean;
  isGeneral: boolean;
}

export function ArmySummary({ army }: ArmySummaryProps) {
  const cards: UnitCardInfo[] = [];

  army.regiments.forEach((regiment, idx) => {
    const label = regiment.isRegimentOfRenown && regiment.renownName
      ? regiment.renownName
      : `Regiment ${idx + 1}`;

    if (regiment.leader) {
      cards.push({
        unit: regiment.leader,
        regimentLabel: label,
        isLeader: true,
        isGeneral: regiment.leader.id === army.generalUnitId,
      });
    }
    regiment.units.forEach((u) => {
      cards.push({
        unit: u,
        regimentLabel: label,
        isLeader: false,
        isGeneral: u.id === army.generalUnitId,
      });
    });
  });

  army.auxiliaryUnits.forEach((u) => {
    cards.push({
      unit: u,
      regimentLabel: 'Auxiliary',
      isLeader: false,
      isGeneral: u.id === army.generalUnitId,
    });
  });

  if (army.factionTerrainUnit) {
    cards.push({
      unit: army.factionTerrainUnit,
      regimentLabel: 'Faction Terrain',
      isLeader: false,
      isGeneral: false,
    });
  }

  const totalPoints =
    army.regiments.reduce(
      (sum, r) =>
        sum + (r.leader?.pointsCost ?? 0) + r.units.reduce((s, u) => s + u.pointsCost, 0),
      0
    ) +
    army.auxiliaryUnits.reduce((s, u) => s + u.pointsCost, 0) +
    (army.factionTerrainUnit?.pointsCost ?? 0);

  return (
    <div className="army-summary">
      <div className="army-summary-inner">
        <div className="army-summary-header">
        <div className="army-summary-title">
          <span className="army-summary-name">{army.name}</span>
          {army.faction && (
            <span className="army-summary-faction">{army.faction.name}</span>
          )}
          {army.subfaction && (
            <span className="army-summary-subfaction">– {army.subfaction.subfactionName}</span>
          )}
        </div>
        <div className="army-summary-points">
          <span className={totalPoints > army.pointsLimit && army.pointsLimit > 0 ? 'over' : ''}>
            {totalPoints}
          </span>
          {army.pointsLimit > 0 && <span className="limit"> / {army.pointsLimit} pts</span>}
        </div>
      </div>

      {/* Faction rules summary */}
      {(army.battleFormation || army.spellLore || army.prayerLore || army.manifestationLore) && (
        <div className="army-summary-rules">
          {army.battleFormation && (
            <span className="rules-badge">🏛️ {army.battleFormation.name}</span>
          )}
          {army.spellLore && (
            <span className="rules-badge">✨ {army.spellLore.name}</span>
          )}
          {army.prayerLore && (
            <span className="rules-badge">🙏 {army.prayerLore.name}</span>
          )}
          {army.manifestationLore && (
            <span className="rules-badge">🌀 {army.manifestationLore.name}</span>
          )}
        </div>
      )}

      {cards.length === 0 ? (
          <div className="army-summary-empty">
            <p>No units added yet. Add units in the Build Army tab.</p>
          </div>
        ) : (
          <div className="army-summary-cards">
            {cards.map((card) => (
              <UnitCard key={card.unit.id} {...card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UnitCard({ unit, regimentLabel, isLeader, isGeneral }: UnitCardInfo) {
  const unitProfile = unit.profiles.find((p) => p.typeName === 'Unit');
  const abilityProfiles = unit.profiles.filter(
    (p) => p.typeName !== 'Unit' && p.typeName !== 'Model'
  );
  const weaponProfiles = unit.profiles.filter(
    (p) =>
      p.typeName === 'Melee Weapon' ||
      p.typeName === 'Ranged Weapon' ||
      p.typeName === 'Weapon' ||
      p.typeName.includes('Weapon')
  );
  const otherProfiles = abilityProfiles.filter(
    (p) =>
      p.typeName !== 'Melee Weapon' &&
      p.typeName !== 'Ranged Weapon' &&
      !p.typeName.includes('Weapon')
  );

  return (
    <div className={`unit-card ${isLeader ? 'unit-card-leader' : ''}`}>
      <div className="unit-card-header">
        <div className="unit-card-title">
          {isGeneral && <span className="unit-card-general">⭐</span>}
          <span className="unit-card-name">{unit.name}</span>
          {isLeader && <span className="unit-card-role">Leader</span>}
        </div>
        <div className="unit-card-meta">
          <span className="unit-card-regiment">{regimentLabel}</span>
          {unit.pointsCost > 0 && (
            <span className="unit-card-pts">{unit.pointsCost} pts</span>
          )}
        </div>
      </div>

      {unitProfile && <UnitStatBlock profile={unitProfile} />}

      {weaponProfiles.length > 0 && (
        <div className="unit-card-section">
          <ProfileViewer profiles={weaponProfiles} compact />
        </div>
      )}

      {otherProfiles.length > 0 && (
        <div className="unit-card-section">
          <ProfileViewer profiles={otherProfiles} compact />
        </div>
      )}
    </div>
  );
}

function UnitStatBlock({ profile }: { profile: Profile }) {
  const stats = [
    { key: 'Move', abbr: 'Move' },
    { key: 'Health', abbr: 'Health' },
    { key: 'Save', abbr: 'Save' },
    { key: 'Control', abbr: 'Control' },
  ];

  return (
    <div className="unit-stat-block">
      {stats.map(({ key, abbr }) => {
        const char = profile.characteristics.find((c) => c.name === key);
        if (!char || !char.value || char.value === '-') return null;
        return (
          <div key={key} className="stat-box">
            <span className="stat-val">{char.value}</span>
            <span className="stat-key">{abbr}</span>
          </div>
        );
      })}
    </div>
  );
}

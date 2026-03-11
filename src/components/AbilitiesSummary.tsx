import type { ArmyList, Profile } from '../types/battlescribe';
import './AbilitiesSummary.css';

interface AbilitiesSummaryProps {
  army: ArmyList;
}

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

  if (sections.length > 0) return sections;

  // Fallback: try substring match against section names
  for (const section of TIMING_SECTIONS) {
    if (t.includes(section.toLowerCase())) {
      sections.push(section);
      break;
    }
  }

  return sections;
}

interface AbilityEntry {
  unitName: string;
  profile: Profile;
}

export function AbilitiesSummary({ army }: AbilitiesSummaryProps) {
  // Collect all units
  const allUnits = [
    ...army.regiments.flatMap((r) => [
      ...(r.leader ? [r.leader] : []),
      ...r.units,
    ]),
    ...army.auxiliaryUnits,
  ];

  if (allUnits.length === 0) {
    return (
      <div className="abilities-summary abilities-empty">
        <p>Add units to your army to see their abilities here.</p>
      </div>
    );
  }

  // Separate passive vs activated abilities
  const passiveAbilities: AbilityEntry[] = [];
  const activatedAbilities: AbilityEntry[] = [];

  for (const unit of allUnits) {
    for (const profile of unit.profiles) {
      const typeName = profile.typeName ?? '';
      if (typeName === 'Ability (Passive)') {
        passiveAbilities.push({ unitName: unit.name, profile });
      } else if (typeName === 'Ability (Activated)') {
        activatedAbilities.push({ unitName: unit.name, profile });
      }
    }
  }

  // Build timing section map
  const sectionMap = new Map<string, AbilityEntry[]>();
  for (const section of TIMING_SECTIONS) {
    sectionMap.set(section, []);
  }
  const uncategorised: AbilityEntry[] = [];

  for (const entry of activatedAbilities) {
    const timingChar = entry.profile.characteristics.find(
      (c) => c.name === 'Timing'
    );
    const timing = timingChar?.value ?? '';

    if (!timing) {
      uncategorised.push(entry);
      continue;
    }

    const sections = matchTimingToSections(timing);
    if (sections.length === 0) {
      uncategorised.push(entry);
    } else {
      for (const sec of sections) {
        sectionMap.get(sec)?.push(entry);
      }
    }
  }

  return (
    <div className="abilities-summary">
      {/* Passive Abilities */}
      {passiveAbilities.length > 0 && (
        <section className="ability-section">
          <h3 className="ability-section-title passive-title">Passive Abilities</h3>
          <div className="ability-cards">
            {passiveAbilities.map((entry, i) => (
              <AbilityCard key={i} entry={entry} showTiming={false} />
            ))}
          </div>
        </section>
      )}

      {/* Timing Sections */}
      {TIMING_SECTIONS.map((section) => {
        const entries = sectionMap.get(section) ?? [];
        if (entries.length === 0) return null;
        return (
          <section key={section} className="ability-section">
            <h3 className="ability-section-title">{section}</h3>
            <div className="ability-cards">
              {entries.map((entry, i) => (
                <AbilityCard key={i} entry={entry} showTiming />
              ))}
            </div>
          </section>
        );
      })}

      {/* Uncategorised */}
      {uncategorised.length > 0 && (
        <section className="ability-section">
          <h3 className="ability-section-title">Other Abilities</h3>
          <div className="ability-cards">
            {uncategorised.map((entry, i) => (
              <AbilityCard key={i} entry={entry} showTiming />
            ))}
          </div>
        </section>
      )}

      {passiveAbilities.length === 0 &&
        activatedAbilities.length === 0 && (
          <div className="abilities-none">
            <p>No ability profiles found for the units in this army.</p>
          </div>
        )}
    </div>
  );
}

function AbilityCard({
  entry,
  showTiming,
}: {
  entry: AbilityEntry;
  showTiming: boolean;
}) {
  const { unitName, profile } = entry;
  const charMap = new Map(profile.characteristics.map((c) => [c.name, c.value]));
  const timing = charMap.get('Timing');
  const effect = charMap.get('Effect') ?? charMap.get('Description') ?? '';
  const declare = charMap.get('Declare');
  const cost = charMap.get('Cost') ?? charMap.get('Casting Value');
  const keywords = charMap.get('Keywords');

  return (
    <div className="ability-card">
      <div className="ability-card-header">
        <span className="ability-name">{profile.name}</span>
        <span className="ability-unit">{unitName}</span>
      </div>
      {showTiming && timing && (
        <div className="ability-timing">{timing}</div>
      )}
      {cost && <div className="ability-meta">Cost: {cost}</div>}
      {declare && <div className="ability-declare"><strong>Declare:</strong> {declare}</div>}
      {effect && <div className="ability-effect">{effect}</div>}
      {keywords && (
        <div className="ability-keywords">
          {keywords.split(',').map((kw) => (
            <span key={kw.trim()} className="ability-keyword">{kw.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );
}

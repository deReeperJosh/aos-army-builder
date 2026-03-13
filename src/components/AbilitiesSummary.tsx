import type { ArmyList, Profile } from '../types/battlescribe';
import { parseKeywords } from './ProfileViewer';
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

  const hasUnits = allUnits.length > 0;
  const hasBattleTraits = army.battleTraitProfiles.length > 0;
  const hasFormation = !!army.battleFormation;
  const hasLores =
    (army.spellLore?.profiles?.length ?? 0) > 0 ||
    (army.prayerLore?.profiles?.length ?? 0) > 0 ||
    (army.manifestationLore?.profiles?.length ?? 0) > 0;

  if (!hasUnits && !hasBattleTraits && !hasFormation && !hasLores) {
    return (
      <div className="abilities-summary abilities-empty">
        <p>Add units to your army and configure Faction Rules to see abilities here.</p>
      </div>
    );
  }

  // Collect faction ability profiles (battle traits + formation + lores)
  const factionPassive: AbilityEntry[] = [];
  const factionActivated: AbilityEntry[] = [];

  const classifyFactionProfile = (profile: Profile, sourceName: string) => {
    if (profile.hidden) return;
    if (profile.typeName === 'Ability (Passive)') {
      factionPassive.push({ unitName: sourceName, profile });
    } else if (
      profile.typeName === 'Ability (Activated)' ||
      profile.typeName === 'Ability (Command)' ||
      profile.typeName === 'Ability (Spell)' ||
      profile.typeName === 'Ability (Prayer)'
    ) {
      factionActivated.push({ unitName: sourceName, profile });
    }
  };

  // Battle Traits
  const factionName = army.faction?.name ?? 'Faction';
  for (const profile of army.battleTraitProfiles) {
    classifyFactionProfile(profile, `${factionName} (Battle Trait)`);
  }

  // Battle Formation
  if (army.battleFormation) {
    for (const profile of army.battleFormation.profiles) {
      classifyFactionProfile(profile, `${army.battleFormation.name} (Formation)`);
    }
  }

  // Spell Lore
  if (army.spellLore?.profiles?.length) {
    for (const profile of army.spellLore.profiles) {
      classifyFactionProfile(profile, `${army.spellLore.name} (Spell)`);
    }
  }

  // Prayer Lore
  if (army.prayerLore?.profiles?.length) {
    for (const profile of army.prayerLore.profiles) {
      classifyFactionProfile(profile, `${army.prayerLore.name} (Prayer)`);
    }
  }

  // Manifestation Lore
  if (army.manifestationLore?.profiles?.length) {
    for (const profile of army.manifestationLore.profiles) {
      classifyFactionProfile(profile, `${army.manifestationLore.name} (Manifestation)`);
    }
  }

  // Separate unit passive vs activated abilities
  const passiveAbilities: AbilityEntry[] = [];
  const activatedAbilities: AbilityEntry[] = [];

  const classifyAbilityProfile = (profile: Profile, unitLabel: string) => {
    if (profile.hidden) return;
    const typeName = profile.typeName ?? '';
    if (typeName === 'Ability (Passive)') {
      passiveAbilities.push({ unitName: unitLabel, profile });
    } else if (
      typeName === 'Ability (Activated)' ||
      typeName === 'Ability (Command)' ||
      typeName === 'Ability (Spell)' ||
      typeName === 'Ability (Prayer)'
    ) {
      activatedAbilities.push({ unitName: unitLabel, profile });
    }
  };

  for (const unit of allUnits) {
    const isGeneral = unit.id === army.generalUnitId;
    const unitLabel = isGeneral ? `${unit.name} ⭐` : unit.name;
    // Base unit profiles
    for (const profile of unit.profiles) {
      classifyAbilityProfile(profile, unitLabel);
    }
    // Wargear profiles (abilities from selected wargear options)
    for (const wargear of unit.selectedWargear ?? []) {
      for (const profile of wargear.profiles) {
        classifyAbilityProfile(profile, unitLabel);
      }
    }
    // Enhancement profiles (Heroic Traits, Artefacts of Power, Big Names, etc.)
    for (const enhancement of unit.selectedEnhancements ?? []) {
      const enhLabel = `${unitLabel} • ${enhancement.optionName}`;
      for (const profile of enhancement.profiles) {
        classifyAbilityProfile(profile, enhLabel);
      }
    }
  }

  // Build timing section map (faction + unit activated)
  const allActivated = [...factionActivated, ...activatedAbilities];
  const sectionMap = new Map<string, AbilityEntry[]>();
  for (const section of TIMING_SECTIONS) {
    sectionMap.set(section, []);
  }
  const uncategorised: AbilityEntry[] = [];

  for (const entry of allActivated) {
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

  const allPassive = [...factionPassive, ...passiveAbilities];

  return (
    <div className="abilities-summary">
      {/* Faction: Battle Traits + Formation + Lore passive abilities */}
      {factionPassive.length > 0 && (
        <section className="ability-section">
          <h3 className="ability-section-title passive-title faction-title">
            Faction Passive Abilities
          </h3>
          <div className="ability-cards">
            {factionPassive.map((entry, i) => (
              <AbilityCard key={i} entry={entry} showTiming={false} />
            ))}
          </div>
        </section>
      )}

      {/* Unit Passive Abilities */}
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

      {/* Timing Sections (faction + unit activated) */}
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

      {allPassive.length === 0 && allActivated.length === 0 && (
        <div className="abilities-none">
          <p>No ability profiles found for this army.</p>
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
  const cost = charMap.get('Cost') ?? charMap.get('Casting Value') ?? charMap.get('Chanting Value');
  const keywords = charMap.get('Keywords');

  // Detect "once per" restrictions in the timing text for prominent display
  const oncePerMatch = timing ? /once per (battle|turn|phase)/i.exec(timing) : null;
  const oncePer = oncePerMatch ? oncePerMatch[0] : null;

  return (
    <div className="ability-card">
      <div className="ability-card-header">
        <span className="ability-name">{profile.name}</span>
        <span className="ability-unit">{unitName}</span>
      </div>
      {oncePer && <div className="ability-once-per-badge">{oncePer.toUpperCase()}</div>}
      {showTiming && timing && (
        <div className="ability-timing">{parseKeywords(timing)}</div>
      )}
      {cost && <div className="ability-meta">Cost: {cost}</div>}
      {declare && <div className="ability-declare"><strong>Declare:</strong> {parseKeywords(declare)}</div>}
      {effect && <div className="ability-effect">{parseKeywords(effect)}</div>}
      {keywords && (
        <div className="ability-keywords">
          {keywords.split(',').map((kw) => (
            <span key={kw.trim()} className="ability-keyword">{parseKeywords(kw.trim())}</span>
          ))}
        </div>
      )}
    </div>
  );
}

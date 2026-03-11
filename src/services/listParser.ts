// Parser for army list text formats (e.g. New Recruit export format)

export interface ParsedUnit {
  name: string;
  points: number;
}

export interface ParsedRegiment {
  /** True if this is the "General's Regiment" */
  isGeneralsRegiment: boolean;
  units: ParsedUnit[];
}

export interface ParsedList {
  armyName: string;
  pointsLimit: number;
  /** The force/handbook name as written in the text (e.g. "✦ General's Handbook 2025-26") */
  forceName: string;
  factionName: string;
  /** Subfaction name if present (first non-metadata line after faction name) */
  subfactionName: string | null;
  /**
   * A second non-metadata line found directly after the subfaction/faction line.
   * In New Recruit exports this can be the battle formation name when both a
   * subfaction AND a formation are selected. When only one non-metadata line
   * appears, it is captured as `subfactionName` — the ImportModal resolves
   * whether it is actually a subfaction or a formation.
   */
  inlineFormationName: string | null;
  regiments: ParsedRegiment[];
  auxiliaryUnits: ParsedUnit[];
  /** Name of the faction terrain unit, if listed under a "Faction Terrain" section. */
  factionTerrainName: string | null;
  spellLoreName: string | null;
  prayerLoreName: string | null;
  manifestationLoreName: string | null;
  battleFormationName: string | null;
}

// Lines that carry metadata but not unit/regiment info
const METADATA_PATTERNS = [
  /^auxiliar(y|ies)\s*:/i,
  /^drops\s*:/i,
  /^battle\s+tactic\s+cards/i,
  /^scouting\s+force/i,
];

// End-of-list markers
const END_MARKERS = [
  /^created\s+with/i,
  /^data\s+version\s*:/i,
];

// Regiment section headers
const GENERALS_REGIMENT_PATTERN = /^general'?s?\s+regiment$/i;
const REGIMENT_PATTERN = /^regiment\s+\d+$/i;
const AUXILIARY_SECTION_PATTERN = /^auxiliar(y|ies)$/i;
const FACTION_TERRAIN_SECTION_PATTERN = /^faction\s+terrain$/i;

// Lore / formation selection lines
const SPELL_LORE_PATTERN = /^spell\s+lore\s*[-–]\s*(.+)$/i;
const PRAYER_LORE_PATTERN = /^prayer\s+lore\s*[-–]\s*(.+)$/i;
const MANIFESTATION_LORE_PATTERN = /^manifestation\s+lore\s*[-–]\s*(.+?)(?:\s*\(\d+\))?$/i;
const BATTLE_FORMATION_PATTERN = /^battle\s+formation\s*[-–]\s*(.+)$/i;

// A unit line: "Unit Name (points)" where points is digits
const UNIT_LINE_PATTERN = /^(.+?)\s*\((\d+)\)\s*$/;

function normaliseText(raw: string): string {
  return raw
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ') // non-breaking space
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

function isMetadataLine(line: string): boolean {
  return METADATA_PATTERNS.some((p) => p.test(line));
}

function isEndMarker(line: string): boolean {
  return END_MARKERS.some((p) => p.test(line));
}

function isRegimentHeader(line: string): boolean {
  return GENERALS_REGIMENT_PATTERN.test(line) || REGIMENT_PATTERN.test(line);
}

function isAuxiliaryHeader(line: string): boolean {
  return AUXILIARY_SECTION_PATTERN.test(line);
}

function isFactionTerrainHeader(line: string): boolean {
  return FACTION_TERRAIN_SECTION_PATTERN.test(line);
}

function parseLoreLine(line: string): { type: 'spell' | 'prayer' | 'manifestation' | 'formation'; name: string } | null {
  let m = line.match(SPELL_LORE_PATTERN);
  if (m) return { type: 'spell', name: m[1].trim() };
  m = line.match(PRAYER_LORE_PATTERN);
  if (m) return { type: 'prayer', name: m[1].trim() };
  m = line.match(MANIFESTATION_LORE_PATTERN);
  if (m) return { type: 'manifestation', name: m[1].trim() };
  m = line.match(BATTLE_FORMATION_PATTERN);
  if (m) return { type: 'formation', name: m[1].trim() };
  return null;
}

function parseUnitLine(line: string): ParsedUnit | null {
  const m = line.match(UNIT_LINE_PATTERN);
  if (!m) return null;
  const points = parseInt(m[2], 10);
  if (isNaN(points)) return null;
  return { name: m[1].trim(), points };
}

/**
 * Parse a New Recruit (or compatible) army list text into a structured form.
 * Returns null if the text does not appear to be a valid list.
 */
export function parseNewRecruitList(rawText: string): ParsedList | null {
  const text = normaliseText(rawText);
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  // Line 0: "ArmyName (N points) - ForceName"
  const headerMatch = lines[0].match(/^(.+?)\s*\((\d+)\s*points?\)\s*[-–]\s*(.+)$/i);
  if (!headerMatch) return null;

  const armyName = headerMatch[1].trim();
  const pointsLimit = parseInt(headerMatch[2], 10);
  const forceName = headerMatch[3].trim();

  let i = 1;

  // --- Faction name (first non-metadata, non-bullet line after header) ---
  while (i < lines.length && (isMetadataLine(lines[i]) || lines[i].startsWith('•'))) i++;
  if (i >= lines.length) return null;

  const factionName = lines[i++];

  // --- Optional subfaction (next non-metadata line that isn't a regiment header / unit / lore) ---
  while (i < lines.length && (isMetadataLine(lines[i]) || lines[i].startsWith('•'))) i++;

  /** True if a candidate line should NOT be treated as subfaction / formation text */
  function isNotPreSectionText(line: string): boolean {
    return (
      isRegimentHeader(line) ||
      isAuxiliaryHeader(line) ||
      isFactionTerrainHeader(line) ||
      parseUnitLine(line) !== null ||
      parseLoreLine(line) !== null ||
      isEndMarker(line)
    );
  }

  let subfactionName: string | null = null;
  let inlineFormationName: string | null = null;

  if (i < lines.length && !isNotPreSectionText(lines[i])) {
    subfactionName = lines[i++];

    // Look for a second non-metadata line — in New Recruit this is the battle formation
    // when both a subfaction and a formation are chosen.
    while (i < lines.length && (isMetadataLine(lines[i]) || lines[i].startsWith('•'))) i++;
    if (i < lines.length && !isNotPreSectionText(lines[i])) {
      inlineFormationName = lines[i++];
    }
  }

  // --- Parse the body ---
  const regiments: ParsedRegiment[] = [];
  const auxiliaryUnits: ParsedUnit[] = [];
  let factionTerrainName: string | null = null;
  let spellLoreName: string | null = null;
  let prayerLoreName: string | null = null;
  let manifestationLoreName: string | null = null;
  let battleFormationName: string | null = null;

  type Section = 'regiment' | 'auxiliary' | 'terrain' | null;
  let section: Section = null;
  let currentRegiment: ParsedRegiment | null = null;

  while (i < lines.length) {
    const line = lines[i++];

    if (isEndMarker(line)) break;

    // Skip bullet-point sub-options (equipment, abilities, etc.)
    if (line.startsWith('•')) continue;

    // Lore / formation selections
    const lore = parseLoreLine(line);
    if (lore) {
      switch (lore.type) {
        case 'spell': spellLoreName = lore.name; break;
        case 'prayer': prayerLoreName = lore.name; break;
        case 'manifestation': manifestationLoreName = lore.name; break;
        case 'formation': battleFormationName = lore.name; break;
      }
      continue;
    }

    if (isMetadataLine(line)) continue;

    // Regiment / auxiliary section headers
    if (isRegimentHeader(line)) {
      currentRegiment = {
        isGeneralsRegiment: GENERALS_REGIMENT_PATTERN.test(line),
        units: [],
      };
      regiments.push(currentRegiment);
      section = 'regiment';
      continue;
    }

    if (isAuxiliaryHeader(line)) {
      section = 'auxiliary';
      currentRegiment = null;
      continue;
    }

    if (isFactionTerrainHeader(line)) {
      section = 'terrain';
      currentRegiment = null;
      continue;
    }

    // Unit line
    const unit = parseUnitLine(line);
    if (unit) {
      if (section === 'regiment' && currentRegiment) {
        currentRegiment.units.push(unit);
      } else if (section === 'auxiliary') {
        auxiliaryUnits.push(unit);
      }
      // Ignore units that appear before any section header (shouldn't happen in valid lists)
    } else if (section === 'terrain' && factionTerrainName === null && line.length > 0) {
      // Faction terrain units often have no points cost — accept a plain name line
      factionTerrainName = line;
    }
  }

  return {
    armyName,
    pointsLimit,
    forceName,
    factionName,
    subfactionName,
    inlineFormationName,
    regiments,
    auxiliaryUnits,
    factionTerrainName,
    spellLoreName,
    prayerLoreName,
    manifestationLoreName,
    battleFormationName,
  };
}

import { parseGameSystem, parseCatalogue, parseRenownAllowances } from './xmlParser';
import type { GameSystem, Catalogue, Faction, Subfaction } from '../types/battlescribe';

const GITHUB_BASE_URL =
  'https://raw.githubusercontent.com/BSData/age-of-sigmar-4th/main/';

const LOCAL_BASE_URL = '/data/';

const GST_FILE = 'Age of Sigmar 4.0.gst';

// Cache for fetched content
const cache = new Map<string, string>();

async function fetchFile(filename: string): Promise<string> {
  if (cache.has(filename)) {
    return cache.get(filename)!;
  }

  // Try local data first (faster and works offline)
  const localUrl = LOCAL_BASE_URL + encodeURIComponent(filename);
  try {
    const localResponse = await fetch(localUrl);
    if (localResponse.ok) {
      const text = await localResponse.text();
      cache.set(filename, text);
      return text;
    }
  } catch {
    // Fall through to GitHub
  }

  // Fall back to GitHub raw content
  const githubUrl = GITHUB_BASE_URL + encodeURIComponent(filename);
  const response = await fetch(githubUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  cache.set(filename, text);
  return text;
}

export async function fetchGameSystem(): Promise<GameSystem> {
  const text = await fetchFile(GST_FILE);
  return parseGameSystem(text);
}

/**
 * Parse the GST to extract which faction catalogues are allowed for each Regiment of Renown
 * forceEntry. The result is a map from GST forceEntry ID -> allowed catalogue IDs.
 * Reuses the cached GST file content so there is no extra network request.
 */
export async function fetchRenownAllowances(): Promise<Record<string, string[]>> {
  const text = await fetchFile(GST_FILE);
  return parseRenownAllowances(text);
}

export async function fetchCatalogue(
  filename: string,
  renownAllowances: Record<string, string[]> = {}
): Promise<Catalogue> {
  const text = await fetchFile(filename);
  return parseCatalogue(text, renownAllowances);
}

// Get list of all factions from the repository
// Factions are .cat files with library="false" and no " - " in name (not subfactions)
export async function fetchFactionList(): Promise<{ factions: Faction[]; subfactions: Subfaction[] }> {
  // We use the GitHub API to list files in the repository
  const apiUrl =
    'https://api.github.com/repos/BSData/age-of-sigmar-4th/contents/';

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file list: ${response.status}`);
  }

  const files: Array<{ name: string; type: string }> = await response.json();
  const catFiles = files.filter((f) => f.type === 'file' && f.name.endsWith('.cat'));

  const factions: Faction[] = [];
  const subfactions: Subfaction[] = [];

  // Process files in parallel batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < catFiles.length; i += BATCH_SIZE) {
    const batch = catFiles.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const text = await fetchFile(file.name);
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'application/xml');
          const root = doc.documentElement;

          const library = root.getAttribute('library') === 'true';
          const id = root.getAttribute('id') ?? '';
          const name = root.getAttribute('name') ?? '';
          const gameSystemId = root.getAttribute('gameSystemId') ?? '';

          if (library) return; // Skip library files

          const baseName = file.name.replace('.cat', '');

          if (baseName.includes(' - ')) {
            // Subfaction file
            const dashIndex = baseName.indexOf(' - ');
            const factionName = baseName.substring(0, dashIndex);
            const subfactionName = baseName.substring(dashIndex + 3);

            subfactions.push({
              id,
              name,
              factionName,
              subfactionName,
              filename: file.name,
            });
          } else {
            // Main faction file
            factions.push({
              id,
              name,
              filename: file.name,
              gameSystemId,
            });
          }
        } catch {
          // Skip files that fail to parse
        }
      })
    );
  }

  // Sort alphabetically
  factions.sort((a, b) => a.name.localeCompare(b.name));
  subfactions.sort((a, b) => a.name.localeCompare(b.name));

  return { factions, subfactions };
}

// Fallback: hardcoded list of factions in case API fails
export const KNOWN_FACTIONS: Faction[] = [
  { id: 'beasts-of-chaos', name: 'Beasts of Chaos', filename: 'Beasts of Chaos.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'blades-of-khorne', name: 'Blades of Khorne', filename: 'Blades of Khorne.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'bonesplitterz', name: 'Bonesplitterz', filename: 'Bonesplitterz.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'cities-of-sigmar', name: 'Cities of Sigmar', filename: 'Cities of Sigmar.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'daughters-of-khaine', name: 'Daughters of Khaine', filename: 'Daughters of Khaine.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'disciples-of-tzeentch', name: 'Disciples of Tzeentch', filename: 'Disciples of Tzeentch.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'flesh-eater-courts', name: 'Flesh-eater Courts', filename: 'Flesh-eater Courts.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'fyreslayers', name: 'Fyreslayers', filename: 'Fyreslayers.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'gloomspite-gitz', name: 'Gloomspite Gitz', filename: 'Gloomspite Gitz.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'hedonites-of-slaanesh', name: 'Hedonites of Slaanesh', filename: 'Hedonites of Slaanesh.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'helsmiths-of-hashut', name: 'Helsmiths of Hashut', filename: 'Helsmiths of Hashut.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'idoneth-deepkin', name: 'Idoneth Deepkin', filename: 'Idoneth Deepkin.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'ironjawz', name: 'Ironjawz', filename: 'Ironjawz.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'kharadron-overlords', name: 'Kharadron Overlords', filename: 'Kharadron Overlords.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'kruleboyz', name: 'Kruleboyz', filename: 'Kruleboyz.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'lumineth-realm-lords', name: 'Lumineth Realm-lords', filename: 'Lumineth Realm-lords.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'maggotkin-of-nurgle', name: 'Maggotkin of Nurgle', filename: 'Maggotkin of Nurgle.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'nighthaunt', name: 'Nighthaunt', filename: 'Nighthaunt.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'ogor-mawtribes', name: 'Ogor Mawtribes', filename: 'Ogor Mawtribes.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'ossiarch-bonereapers', name: 'Ossiarch Bonereapers', filename: 'Ossiarch Bonereapers.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'seraphon', name: 'Seraphon', filename: 'Seraphon.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'skaven', name: 'Skaven', filename: 'Skaven.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'slaves-to-darkness', name: 'Slaves to Darkness', filename: 'Slaves to Darkness.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'sons-of-behemat', name: 'Sons of Behemat', filename: 'Sons of Behemat.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'soulblight-gravelords', name: 'Soulblight Gravelords', filename: 'Soulblight Gravelords.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'stormcast-eternals', name: 'Stormcast Eternals', filename: 'Stormcast Eternals.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
  { id: 'sylvaneth', name: 'Sylvaneth', filename: 'Sylvaneth.cat', gameSystemId: 'e51d-b1a3-75fc-dc3g' },
];

export const KNOWN_SUBFACTIONS: Subfaction[] = [
  { id: 'blades-khorne-gorechosen', name: 'Blades of Khorne - Gorechosen Champions', factionName: 'Blades of Khorne', subfactionName: 'Gorechosen Champions', filename: 'Blades of Khorne - Gorechosen Champions.cat' },
  { id: 'blades-khorne-baleful', name: 'Blades of Khorne - The Baleful Lords', factionName: 'Blades of Khorne', subfactionName: 'The Baleful Lords', filename: 'Blades of Khorne - The Baleful Lords.cat' },
  { id: 'daughters-croneseer', name: "Daughters of Khaine - The Croneseer's Pariahs", factionName: 'Daughters of Khaine', subfactionName: "The Croneseer's Pariahs", filename: "Daughters of Khaine - The Croneseer's Pariahs.cat" },
  { id: 'disciples-change-cult', name: 'Disciples of Tzeentch - Change-cult Uprising', factionName: 'Disciples of Tzeentch', subfactionName: 'Change-cult Uprising', filename: 'Disciples of Tzeentch - Change-cult Uprising.cat' },
  { id: 'disciples-pyrofane', name: 'Disciples of Tzeentch - Pyrofane Cult', factionName: 'Disciples of Tzeentch', subfactionName: 'Pyrofane Cult', filename: 'Disciples of Tzeentch - Pyrofane Cult.cat' },
  { id: 'disciples-oracles', name: 'Disciples of Tzeentch - The Oracles of Fate', factionName: 'Disciples of Tzeentch', subfactionName: 'The Oracles of Fate', filename: 'Disciples of Tzeentch - The Oracles of Fate.cat' },
  { id: 'flesh-eater-summercourt', name: 'Flesh-eater Courts - New Summercourt', factionName: 'Flesh-eater Courts', subfactionName: 'New Summercourt', filename: 'Flesh-eater Courts - New Summercourt.cat' },
  { id: 'flesh-eater-equinox', name: 'Flesh-eater Courts - The Equinox Feast', factionName: 'Flesh-eater Courts', subfactionName: 'The Equinox Feast', filename: 'Flesh-eater Courts - The Equinox Feast.cat' },
  { id: 'fyreslayers-lofnir', name: 'Fyreslayers - Lofnir Drothkeepers', factionName: 'Fyreslayers', subfactionName: 'Lofnir Drothkeepers', filename: 'Fyreslayers - Lofnir Drothkeepers.cat' },
  { id: 'gloomspite-kings-gitz', name: "Gloomspite Gitz - Da King's Gitz", factionName: 'Gloomspite Gitz', subfactionName: "Da King's Gitz", filename: "Gloomspite Gitz - Da King's Gitz.cat" },
  { id: 'gloomspite-droggz', name: "Gloomspite Gitz - Droggz's Gitmob", factionName: 'Gloomspite Gitz', subfactionName: "Droggz's Gitmob", filename: "Gloomspite Gitz - Droggz's Gitmob.cat" },
  { id: 'gloomspite-trugg', name: "Gloomspite Gitz - Trugg's Troggherd", factionName: 'Gloomspite Gitz', subfactionName: "Trugg's Troggherd", filename: "Gloomspite Gitz - Trugg's Troggherd.cat" },
  { id: 'helsmiths-taar', name: "Helsmiths of Hashut - Taar's Grand Forgehost", factionName: 'Helsmiths of Hashut', subfactionName: "Taar's Grand Forgehost", filename: "Helsmiths of Hashut - Taar's Grand Forgehost.cat" },
  { id: 'helsmiths-ziggurat', name: 'Helsmiths of Hashut - Ziggurat Stampede', factionName: 'Helsmiths of Hashut', subfactionName: 'Ziggurat Stampede', filename: 'Helsmiths of Hashut - Ziggurat Stampede.cat' },
  { id: 'idoneth-first-phalanx', name: 'Idoneth Deepkin - The First Phalanx of Ionrach', factionName: 'Idoneth Deepkin', subfactionName: 'The First Phalanx of Ionrach', filename: 'Idoneth Deepkin - The First Phalanx of Ionrach.cat' },
  { id: 'idoneth-wardens', name: 'Idoneth Deepkin - Wardens of the Chorrileum', factionName: 'Idoneth Deepkin', subfactionName: 'Wardens of the Chorrileum', filename: 'Idoneth Deepkin - Wardens of the Chorrileum.cat' },
  { id: 'ironjawz-krazogg', name: "Ironjawz - Krazogg's Grunta Stampede", factionName: 'Ironjawz', subfactionName: "Krazogg's Grunta Stampede", filename: "Ironjawz - Krazogg's Grunta Stampede.cat" },
  { id: 'ironjawz-zoggrok', name: "Ironjawz - Zoggrok's Ironmongerz", factionName: 'Ironjawz', subfactionName: "Zoggrok's Ironmongerz", filename: "Ironjawz - Zoggrok's Ironmongerz.cat" },
  { id: 'kharadron-grundstok', name: 'Kharadron Overlords - Grundstok Expeditionary Force', factionName: 'Kharadron Overlords', subfactionName: 'Grundstok Expeditionary Force', filename: 'Kharadron Overlords - Grundstok Expeditionary Force.cat' },
  { id: 'kharadron-pioneer', name: 'Kharadron Overlords - Pioneer Outpost', factionName: 'Kharadron Overlords', subfactionName: 'Pioneer Outpost', filename: 'Kharadron Overlords - Pioneer Outpost.cat' },
  { id: 'kharadron-magnate', name: "Kharadron Overlords - The Magnate's Crew", factionName: 'Kharadron Overlords', subfactionName: "The Magnate's Crew", filename: "Kharadron Overlords - The Magnate's Crew.cat" },
  { id: 'kruleboyz-murkvast', name: 'Kruleboyz - Murkvast Menagerie', factionName: 'Kruleboyz', subfactionName: 'Murkvast Menagerie', filename: 'Kruleboyz - Murkvast Menagerie.cat' },
  { id: 'lumineth-aelementiri', name: 'Lumineth Realm-lords - Aelementiri Conclave', factionName: 'Lumineth Realm-lords', subfactionName: 'Aelementiri Conclave', filename: 'Lumineth Realm-lords - Aelementiri Conclave.cat' },
  { id: 'lumineth-vanari', name: 'Lumineth Realm-lords - Vanari Paragons', factionName: 'Lumineth Realm-lords', subfactionName: 'Vanari Paragons', filename: 'Lumineth Realm-lords - Vanari Paragons.cat' },
  { id: 'maggotkin-cycle', name: 'Maggotkin of Nurgle - Cycle of Corruption', factionName: 'Maggotkin of Nurgle', subfactionName: 'Cycle of Corruption', filename: 'Maggotkin of Nurgle - Cycle of Corruption.cat' },
  { id: 'maggotkin-gardeners', name: 'Maggotkin of Nurgle - The Gardeners of Nurgle', factionName: 'Maggotkin of Nurgle', subfactionName: 'The Gardeners of Nurgle', filename: 'Maggotkin of Nurgle - The Gardeners of Nurgle.cat' },
  { id: 'nighthaunt-clattering', name: 'Nighthaunt - The Clattering Procession', factionName: 'Nighthaunt', subfactionName: 'The Clattering Procession', filename: 'Nighthaunt - The Clattering Procession.cat' },
  { id: 'nighthaunt-eternal', name: 'Nighthaunt - The Eternal Nightmare', factionName: 'Nighthaunt', subfactionName: 'The Eternal Nightmare', filename: 'Nighthaunt - The Eternal Nightmare.cat' },
  { id: 'ogor-roving-maw', name: 'Ogor Mawtribes - The Roving Maw', factionName: 'Ogor Mawtribes', subfactionName: 'The Roving Maw', filename: 'Ogor Mawtribes - The Roving Maw.cat' },
  { id: 'ossiarch-lance-ossia', name: 'Ossiarch Bonereapers - The Lance of Ossia', factionName: 'Ossiarch Bonereapers', subfactionName: 'The Lance of Ossia', filename: 'Ossiarch Bonereapers - The Lance of Ossia.cat' },
  { id: 'ossiarch-null-myriad', name: 'Ossiarch Bonereapers - The Null Myriad', factionName: 'Ossiarch Bonereapers', subfactionName: 'The Null Myriad', filename: 'Ossiarch Bonereapers - The Null Myriad.cat' },
  { id: 'skaven-thanquol', name: "Skaven - Thanquol's Mutated Menagerie", factionName: 'Skaven', subfactionName: "Thanquol's Mutated Menagerie", filename: "Skaven - Thanquol's Mutated Menagerie.cat" },
  { id: 'skaven-great-grand', name: 'Skaven - The Great-grand Gnawhorde', factionName: 'Skaven', subfactionName: 'The Great-grand Gnawhorde', filename: 'Skaven - The Great-grand Gnawhorde.cat' },
  { id: 'slaves-legion-first-prince', name: 'Slaves to Darkness - Legion of the First Prince', factionName: 'Slaves to Darkness', subfactionName: 'Legion of the First Prince', filename: 'Slaves to Darkness - Legion of the First Prince.cat' },
  { id: 'slaves-swords-chaos', name: 'Slaves to Darkness - The Swords of Chaos', factionName: 'Slaves to Darkness', subfactionName: 'The Swords of Chaos', filename: 'Slaves to Darkness - The Swords of Chaos.cat' },
  { id: 'slaves-tribes-snow', name: 'Slaves to Darkness - Tribes of the Snow Peaks', factionName: 'Slaves to Darkness', subfactionName: 'Tribes of the Snow Peaks', filename: 'Slaves to Darkness - Tribes of the Snow Peaks.cat' },
  { id: 'sons-brodd-stomp', name: "Sons of Behemat - King Brodd's Stomp", factionName: 'Sons of Behemat', subfactionName: "King Brodd's Stomp", filename: "Sons of Behemat - King Brodd's Stomp.cat" },
  { id: 'soulblight-barrow-legion', name: 'Soulblight Gravelords - Barrow Legion', factionName: 'Soulblight Gravelords', subfactionName: 'Barrow Legion', filename: 'Soulblight Gravelords - Barrow Legion.cat' },
  { id: 'soulblight-knights-crimson', name: 'Soulblight Gravelords - Knights of the Crimson Keep', factionName: 'Soulblight Gravelords', subfactionName: 'Knights of the Crimson Keep', filename: 'Soulblight Gravelords - Knights of the Crimson Keep.cat' },
  { id: 'soulblight-scions-nulahmia', name: 'Soulblight Gravelords - Scions of Nulahmia', factionName: 'Soulblight Gravelords', subfactionName: 'Scions of Nulahmia', filename: 'Soulblight Gravelords - Scions of Nulahmia.cat' },
  { id: 'stormcast-astral-templars', name: 'Stormcast Eternals - Astral Templars', factionName: 'Stormcast Eternals', subfactionName: 'Astral Templars', filename: 'Stormcast Eternals - Astral Templars.cat' },
  { id: 'stormcast-draconith-skywing', name: 'Stormcast Eternals - Draconith Skywing', factionName: 'Stormcast Eternals', subfactionName: 'Draconith Skywing', filename: 'Stormcast Eternals - Draconith Skywing.cat' },
  { id: 'stormcast-heroes-first-forged', name: 'Stormcast Eternals - Heroes of the First-Forged', factionName: 'Stormcast Eternals', subfactionName: 'Heroes of the First-Forged', filename: 'Stormcast Eternals - Heroes of the First-Forged.cat' },
  { id: 'stormcast-ruination-brotherhood', name: 'Stormcast Eternals - Ruination Brotherhood', factionName: 'Stormcast Eternals', subfactionName: 'Ruination Brotherhood', filename: 'Stormcast Eternals - Ruination Brotherhood.cat' },
  { id: 'sylvaneth-evergreen-hunt', name: 'Sylvaneth - The Evergreen Hunt', factionName: 'Sylvaneth', subfactionName: 'The Evergreen Hunt', filename: 'Sylvaneth - The Evergreen Hunt.cat' },
];

// Hardcoded force entries from Age of Sigmar 4.0.gst as fallback
export const KNOWN_FORCE_ENTRIES: import('../types/battlescribe').ForceEntry[] = [
  {
    id: 'f079-501a-2738-6845',
    name: "✦ General's Handbook 2025-26",
    hidden: false,
    sortIndex: 1,
    childForcesLabel: 'Regiments and Auxiliary',
  },
  {
    id: '8e6f-2dd7-a7ed-489e',
    name: 'Path to Glory: Blighted Wilds',
    hidden: false,
    sortIndex: 2,
    childForcesLabel: 'Regiments and Auxiliary',
  },
  {
    id: 'f079-501a-2738-6844',
    name: "General's Handbook 2024-25",
    hidden: false,
    sortIndex: 3,
    childForcesLabel: 'Regiments and Auxiliary',
  },
  {
    id: '01b1-5112-ab45-1afc',
    name: 'Path to Glory: Ravaged Coast',
    hidden: false,
    sortIndex: 4,
    childForcesLabel: 'Regiments and Auxiliary',
  },
  {
    id: '1bed-ddb5-0c50-16d2',
    name: 'Path to Glory: Ascension',
    hidden: false,
    sortIndex: 5,
    childForcesLabel: 'Regiments and Auxiliary',
  },
  {
    id: '78a1-f6c2-71b8-270a',
    name: 'Path to Glory: Freeform [UNOFFICIAL, WIP]',
    hidden: false,
    sortIndex: 99,
    childForcesLabel: 'Regiments and Auxiliary',
  },
];

export { fetchFile };

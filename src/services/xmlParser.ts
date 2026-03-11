import type {
  GameSystem,
  Catalogue,
  ForceEntry,
  ProfileType,
  CostType,
  SelectionEntry,
  EntryLink,
  Profile,
  Characteristic,
  Cost,
  CategoryLink,
  CatalogueLink,
  FactionOption,
  FactionOptionGroup,
} from '../types/battlescribe';

const GST_NS = 'http://www.battlescribe.net/schema/gameSystemSchema';
const CAT_NS = 'http://www.battlescribe.net/schema/catalogueSchema';

function getElements(parent: Element, tagName: string, ns: string): Element[] {
  return Array.from(parent.getElementsByTagNameNS(ns, tagName));
}

function directChildren(parent: Element, tagName: string, ns: string): Element[] {
  return Array.from(parent.childNodes).filter(
    (n): n is Element =>
      n.nodeType === Node.ELEMENT_NODE &&
      (n as Element).localName === tagName &&
      ((n as Element).namespaceURI === ns || (n as Element).namespaceURI === null)
  ) as Element[];
}

export function parseGameSystem(xmlText: string): GameSystem {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const root = doc.documentElement;

  const ns = GST_NS;

  // Parse cost types
  const costTypes: CostType[] = getElements(root, 'costType', ns).map((el) => ({
    id: el.getAttribute('id') ?? '',
    name: el.getAttribute('name') ?? '',
    defaultCostLimit: parseFloat(el.getAttribute('defaultCostLimit') ?? '0'),
    hidden: el.getAttribute('hidden') === 'true',
  }));

  // Parse profile types
  const profileTypes: ProfileType[] = getElements(root, 'profileType', ns).map((el) => ({
    id: el.getAttribute('id') ?? '',
    name: el.getAttribute('name') ?? '',
    sortIndex: parseInt(el.getAttribute('sortIndex') ?? '0', 10),
    characteristicTypes: getElements(el, 'characteristicType', ns).map((ct) => ({
      id: ct.getAttribute('id') ?? '',
      name: ct.getAttribute('name') ?? '',
    })),
  }));

  // Parse force entries (only visible ones at top level)
  const forceEntriesEl = root.querySelector('forceEntries');
  const forceEntries: ForceEntry[] = [];

  if (forceEntriesEl) {
    // Get direct child forceEntry elements only
    for (const child of Array.from(forceEntriesEl.children)) {
      if (child.localName === 'forceEntry') {
        forceEntries.push({
          id: child.getAttribute('id') ?? '',
          name: decodeHtmlEntities(child.getAttribute('name') ?? ''),
          hidden: child.getAttribute('hidden') === 'true',
          sortIndex: parseInt(child.getAttribute('sortIndex') ?? '99', 10),
          childForcesLabel: child.getAttribute('childForcesLabel') ?? '',
        });
      }
    }
  }

  return {
    id: root.getAttribute('id') ?? '',
    name: root.getAttribute('name') ?? '',
    revision: parseInt(root.getAttribute('revision') ?? '0', 10),
    costTypes,
    profileTypes,
    forceEntries: forceEntries.filter((fe) => !fe.hidden).sort((a, b) => a.sortIndex - b.sortIndex),
  };
}

export function parseCatalogue(xmlText: string): Catalogue {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const root = doc.documentElement;

  const ns = CAT_NS;

  // Parse catalogue links
  const catalogueLinks: CatalogueLink[] = getElements(root, 'catalogueLink', ns).map((el) => ({
    id: el.getAttribute('id') ?? '',
    name: el.getAttribute('name') ?? '',
    targetId: el.getAttribute('targetId') ?? '',
    type: el.getAttribute('type') ?? '',
  }));

  // Parse all selection entries (both regular and shared)
  const selectionEntries = [
    ...parseSelectionEntries(root, ns),
    ...parseSharedSelectionEntries(root, ns),
  ];

  // Parse entry links (units referenced from this catalogue)
  const entryLinks = parseEntryLinks(root, ns);

  // Parse shared selection entry groups (Battle Formations, Lores, etc.)
  const selectionEntryGroups = parseSharedSelectionEntryGroups(root, ns);

  // Extract Battle Traits profiles (from the 'Battle Traits: X' shared entry)
  const battleTraitsEntry = selectionEntries.find((e) =>
    e.name.startsWith('Battle Traits:')
  );
  const battleTraitProfiles = battleTraitsEntry?.profiles ?? [];

  // Extract Battle Formations (from the 'Battle Formations: X' shared group)
  const formationGroup = selectionEntryGroups.find((g) =>
    g.name.startsWith('Battle Formations:')
  );
  const battleFormations = formationGroup?.options.filter((o) => !o.hidden) ?? [];

  // Extract Spell Lore options
  const spellLoreGroup = selectionEntryGroups.find((g) => g.name === 'Spell Lores');
  const spellLores = spellLoreGroup?.options.filter((o) => !o.hidden) ?? [];

  // Extract Prayer Lore options
  const prayerLoreGroup = selectionEntryGroups.find((g) => g.name === 'Prayer Lores');
  const prayerLores = prayerLoreGroup?.options.filter((o) => !o.hidden) ?? [];

  // Extract Manifestation Lore options
  const manifestationLoreGroup = selectionEntryGroups.find(
    (g) => g.name === 'Manifestation Lores'
  );
  const manifestationLores = manifestationLoreGroup?.options.filter((o) => !o.hidden) ?? [];

  return {
    id: root.getAttribute('id') ?? '',
    name: root.getAttribute('name') ?? '',
    library: root.getAttribute('library') === 'true',
    gameSystemId: root.getAttribute('gameSystemId') ?? '',
    revision: parseInt(root.getAttribute('revision') ?? '0', 10),
    catalogueLinks,
    selectionEntries,
    entryLinks,
    selectionEntryGroups,
    battleTraitProfiles,
    battleFormations,
    spellLores,
    prayerLores,
    manifestationLores,
  };
}

function parseSelectionEntries(parent: Element, ns: string): SelectionEntry[] {
  // Find top-level selectionEntries container
  const containers = directChildren(parent, 'selectionEntries', ns);
  const entries: SelectionEntry[] = [];

  for (const container of containers) {
    for (const el of directChildren(container, 'selectionEntry', ns)) {
      entries.push(parseSelectionEntry(el, ns));
    }
  }

  return entries;
}

function parseSharedSelectionEntries(parent: Element, ns: string): SelectionEntry[] {
  // Find sharedSelectionEntries container (used in library catalogues)
  const containers = directChildren(parent, 'sharedSelectionEntries', ns);
  const entries: SelectionEntry[] = [];

  for (const container of containers) {
    for (const el of directChildren(container, 'selectionEntry', ns)) {
      entries.push(parseSelectionEntry(el, ns));
    }
  }

  return entries;
}

function parseSelectionEntry(el: Element, ns: string): SelectionEntry {
  const profiles = parseProfiles(el, ns);
  const costs = parseCosts(el, ns);
  const categoryLinks = parseCategoryLinks(el, ns);

  // Parse sub selection entries
  const subEntries: SelectionEntry[] = [];
  const subContainers = directChildren(el, 'selectionEntries', ns);
  for (const container of subContainers) {
    for (const sub of directChildren(container, 'selectionEntry', ns)) {
      subEntries.push(parseSelectionEntry(sub, ns));
    }
  }

  return {
    id: el.getAttribute('id') ?? '',
    name: decodeHtmlEntities(el.getAttribute('name') ?? ''),
    type: el.getAttribute('type') ?? '',
    hidden: el.getAttribute('hidden') === 'true',
    profiles,
    costs,
    categoryLinks,
    subEntries,
  };
}

function parseSharedSelectionEntryGroups(parent: Element, ns: string): FactionOptionGroup[] {
  const groups: FactionOptionGroup[] = [];
  const containers = directChildren(parent, 'sharedSelectionEntryGroups', ns);

  for (const container of containers) {
    for (const grpEl of directChildren(container, 'selectionEntryGroup', ns)) {
      const groupName = decodeHtmlEntities(grpEl.getAttribute('name') ?? '');
      const groupId = grpEl.getAttribute('id') ?? '';
      const options: FactionOption[] = [];

      // Get direct selectionEntries within this group
      const seContainers = directChildren(grpEl, 'selectionEntries', ns);
      for (const seContainer of seContainers) {
        for (const entryEl of directChildren(seContainer, 'selectionEntry', ns)) {
          const profiles = parseProfiles(entryEl, ns);
          const hidden = entryEl.getAttribute('hidden') === 'true';

          // Check for an entryLink targetId (used by lore options referencing Lores.cat groups)
          let targetGroupId: string | undefined;
          const elContainers = directChildren(entryEl, 'entryLinks', ns);
          for (const elc of elContainers) {
            const firstLink = directChildren(elc, 'entryLink', ns)[0];
            if (firstLink) {
              targetGroupId = firstLink.getAttribute('targetId') ?? undefined;
            }
          }

          options.push({
            id: entryEl.getAttribute('id') ?? '',
            name: decodeHtmlEntities(entryEl.getAttribute('name') ?? ''),
            profiles,
            hidden,
            targetGroupId,
          });
        }
      }

      groups.push({ id: groupId, name: groupName, options });
    }
  }

  return groups;
}

function parseEntryLinks(parent: Element, ns: string): EntryLink[] {
  const containers = directChildren(parent, 'entryLinks', ns);
  const links: EntryLink[] = [];

  const REGIMENTAL_LEADER_ID = 'd1f3-921c-b403-1106';
  const REGIMENTAL_OPTION_ID = 'db3a-7199-c92e-f3cf';

  for (const container of containers) {
    for (const el of directChildren(container, 'entryLink', ns)) {
      const costs = parseCosts(el, ns);
      const categoryLinks = parseCategoryLinks(el, ns);

      // Check direct modifiers for isRegimentalLeader
      let isRegimentalLeader = false;
      const modContainers = directChildren(el, 'modifiers', ns);
      for (const mc of modContainers) {
        for (const mod of directChildren(mc, 'modifier', ns)) {
          if (
            mod.getAttribute('type') === 'set-primary' &&
            mod.getAttribute('value') === REGIMENTAL_LEADER_ID
          ) {
            isRegimentalLeader = true;
          }
        }
      }

      // Check modifierGroups for enabledAffectIds (units/categories enabled as regiment options)
      const enabledAffectIds: string[] = [];
      const mgContainers = directChildren(el, 'modifierGroups', ns);
      for (const mgc of mgContainers) {
        for (const mg of directChildren(mgc, 'modifierGroup', ns)) {
          const innerModContainers = directChildren(mg, 'modifiers', ns);
          for (const imc of innerModContainers) {
            for (const mod of directChildren(imc, 'modifier', ns)) {
              const value = mod.getAttribute('value') ?? '';
              const affects = mod.getAttribute('affects') ?? '';
              if (
                value === REGIMENTAL_OPTION_ID &&
                affects.startsWith('self.entries.recursive.')
              ) {
                const targetId = affects.split('.').pop() ?? '';
                if (targetId && !enabledAffectIds.includes(targetId)) {
                  enabledAffectIds.push(targetId);
                }
              }
            }
          }
        }
      }

      links.push({
        id: el.getAttribute('id') ?? '',
        name: decodeHtmlEntities(el.getAttribute('name') ?? ''),
        targetId: el.getAttribute('targetId') ?? '',
        type: el.getAttribute('type') ?? '',
        hidden: el.getAttribute('hidden') === 'true',
        costs,
        categoryLinks,
        isRegimentalLeader,
        enabledAffectIds,
      });
    }
  }

  return links;
}

function parseProfiles(parent: Element, ns: string): Profile[] {
  const profiles: Profile[] = [];
  // Only get profiles from direct 'profiles' container of this element
  const containers = directChildren(parent, 'profiles', ns);

  for (const container of containers) {
    for (const profile of directChildren(container, 'profile', ns)) {
      const characteristics: Characteristic[] = [];
      const charContainers = directChildren(profile, 'characteristics', ns);
      for (const charContainer of charContainers) {
        for (const charEl of directChildren(charContainer, 'characteristic', ns)) {
          characteristics.push({
            typeId: charEl.getAttribute('typeId') ?? '',
            name: charEl.getAttribute('name') ?? '',
            value: charEl.textContent?.trim() ?? '',
          });
        }
      }

      profiles.push({
        id: profile.getAttribute('id') ?? '',
        name: decodeHtmlEntities(profile.getAttribute('name') ?? ''),
        typeId: profile.getAttribute('typeId') ?? '',
        typeName: profile.getAttribute('typeName') ?? '',
        hidden: profile.getAttribute('hidden') === 'true',
        characteristics,
      });
    }
  }

  return profiles;
}

function parseCosts(parent: Element, ns: string): Cost[] {
  const costs: Cost[] = [];
  const containers = directChildren(parent, 'costs', ns);
  for (const container of containers) {
    for (const costEl of directChildren(container, 'cost', ns)) {
      const value = parseFloat(costEl.getAttribute('value') ?? '0');
      if (value > 0) {
        costs.push({
          name: costEl.getAttribute('name') ?? '',
          typeId: costEl.getAttribute('typeId') ?? '',
          value,
        });
      }
    }
  }
  return costs;
}

function parseCategoryLinks(parent: Element, ns: string): CategoryLink[] {
  const links: CategoryLink[] = [];
  const containers = directChildren(parent, 'categoryLinks', ns);
  for (const container of containers) {
    for (const linkEl of directChildren(container, 'categoryLink', ns)) {
      links.push({
        id: linkEl.getAttribute('id') ?? '',
        name: decodeHtmlEntities(linkEl.getAttribute('name') ?? ''),
        targetId: linkEl.getAttribute('targetId') ?? '',
        primary: linkEl.getAttribute('primary') === 'true',
      });
    }
  }
  return links;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

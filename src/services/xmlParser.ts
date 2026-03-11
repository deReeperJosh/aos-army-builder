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
  RenownRegiment,
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

/**
 * Parse the GST (game system) XML to build a map from Regiment of Renown forceEntry ID
 * to the set of faction catalogue IDs that are allowed to include it.
 *
 * Each Regiment of Renown forceEntry in the GST has `instanceOf` conditions with
 * `scope="parent"` that restrict which faction catalogues can include the regiment.
 */
export function parseRenownAllowances(gstXml: string): Record<string, string[]> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gstXml, 'application/xml');
  const root = doc.documentElement;
  const ns = GST_NS;

  const allowances: Record<string, string[]> = {};

  for (const fe of Array.from(root.getElementsByTagNameNS(ns, 'forceEntry'))) {
    const feId = fe.getAttribute('id') ?? '';
    if (!feId) continue;

    const catalogueIds: string[] = [];
    for (const cond of Array.from(fe.getElementsByTagNameNS(ns, 'condition'))) {
      if (
        cond.getAttribute('type') === 'instanceOf' &&
        cond.getAttribute('scope') === 'parent'
      ) {
        const childId = cond.getAttribute('childId');
        if (childId) catalogueIds.push(childId);
      }
    }

    if (catalogueIds.length > 0) {
      allowances[feId] = catalogueIds;
    }
  }

  return allowances;
}

export function parseCatalogue(
  xmlText: string,
  renownAllowances: Record<string, string[]> = {}
): Catalogue {
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

  // Extract Regiments of Renown (only present in the dedicated Regiments of Renown.cat).
  // For each entry, also extract the condition childId (a forceEntry ID from the GST) and use
  // the optional renownAllowances map to resolve it to the faction catalogue IDs that may use it.
  const renownForceEntryIdMap = new Map<string, string>(); // entry id -> GST forceEntry id
  for (const container of directChildren(root, 'sharedSelectionEntries', ns)) {
    for (const el of directChildren(container, 'selectionEntry', ns)) {
      const entryName = el.getAttribute('name') ?? '';
      if (!entryName.startsWith('Regiment of Renown:')) continue;
      const entryId = el.getAttribute('id') ?? '';
      for (const cond of Array.from(el.getElementsByTagNameNS(ns, 'condition'))) {
        if (cond.getAttribute('type') === 'instanceOf') {
          const childId = cond.getAttribute('childId');
          if (childId) {
            renownForceEntryIdMap.set(entryId, childId);
            break;
          }
        }
      }
    }
  }

  const renownRegiments: RenownRegiment[] = selectionEntries
    .filter((e) => e.name.startsWith('Regiment of Renown:'))
    .map((e) => {
      const forceEntryId = renownForceEntryIdMap.get(e.id);
      const allowedCatalogueIds = forceEntryId
        ? (renownAllowances[forceEntryId] ?? [])
        : [];
      return { id: e.id, name: e.name, profiles: e.profiles, allowedCatalogueIds };
    });

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
    renownRegiments,
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

      // Check modifierGroups for enabledAffectIds (units/categories enabled as regiment options).
      // We capture ALL entry IDs targeted by any category-add modifier in modifierGroups,
      // regardless of which category value is added. Some factions (e.g. Ogor Mawtribes) use
      // custom category IDs for specific heroes like Bloodpelt Hunter instead of the generic
      // REGIMENTAL_OPTION_ID, so filtering by value would miss them.
      const enabledAffectIds: string[] = [];
      // Categories conditionally added to this unit itself (no `affects` attribute) inside
      // a modifierGroup – these represent role-categories the unit acquires when placed in a
      // regiment that already has a leader (e.g. "Voice of the Everwinter" for Huskard units).
      const conditionalCategoryIds: string[] = [];
      const mgContainers = directChildren(el, 'modifierGroups', ns);
      for (const mgc of mgContainers) {
        for (const mg of directChildren(mgc, 'modifierGroup', ns)) {
          const innerModContainers = directChildren(mg, 'modifiers', ns);
          for (const imc of innerModContainers) {
            for (const mod of directChildren(imc, 'modifier', ns)) {
              const affects = mod.getAttribute('affects') ?? '';
              if (affects.startsWith('self.entries.recursive.')) {
                const targetId = affects.split('.').pop() ?? '';
                if (targetId && !enabledAffectIds.includes(targetId)) {
                  enabledAffectIds.push(targetId);
                }
              } else if (
                !affects &&
                mod.getAttribute('type') === 'add' &&
                mod.getAttribute('field') === 'category'
              ) {
                // No `affects` means "add to self" – this is a conditional role category
                const catId = mod.getAttribute('value') ?? '';
                if (catId && !conditionalCategoryIds.includes(catId)) {
                  conditionalCategoryIds.push(catId);
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
        conditionalCategoryIds,
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

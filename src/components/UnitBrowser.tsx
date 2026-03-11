import { useState, useCallback, useRef, useEffect } from 'react';
import type { Catalogue, EntryLink, SelectionEntry, Profile } from '../types/battlescribe';
import { fetchCatalogue } from '../services/dataFetcher';
import { ProfileViewer } from './ProfileViewer';
import './UnitBrowser.css';

interface UnitBrowserProps {
  factionFilename: string;
  subfactionFilename?: string;
  onAddUnit: (
    entryLink: EntryLink | null,
    entry: SelectionEntry,
    name: string,
    points: number,
    profiles: Profile[]
  ) => void;
}

interface UnitOption {
  linkId: string;
  targetId: string;
  name: string;
  points: number;
  hidden: boolean;
  entry: SelectionEntry | null;
  profiles: Profile[];
}

export function UnitBrowser({ factionFilename, subfactionFilename, onAddUnit }: UnitBrowserProps) {
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadedRef = useRef<string | null>(null);

  const loadUnits = useCallback(async () => {
    const key = factionFilename + (subfactionFilename ?? '');
    if (loadedRef.current === key) return;

    setLoading(true);
    setError(null);

    try {
      // Load faction catalogue
      const factionCat = await fetchCatalogue(factionFilename);

      // Load library catalogue
      const libraryFilename = deriveLibraryFilename(factionFilename);
      let libraryCat: Catalogue | null = null;
      try {
        libraryCat = await fetchCatalogue(libraryFilename);
      } catch {
        // Library may not exist for all factions
      }

      // Load subfaction catalogue if present
      let subfactionCat: Catalogue | null = null;
      if (subfactionFilename) {
        try {
          subfactionCat = await fetchCatalogue(subfactionFilename);
        } catch {
          // ignore
        }
      }

      // Build a map from targetId to SelectionEntry from library
      const entryMap = new Map<string, SelectionEntry>();
      if (libraryCat) {
        for (const entry of libraryCat.selectionEntries) {
          entryMap.set(entry.id, entry);
        }
      }

      // Get entry links from the faction catalogue (these are the available units)
      const allLinks = factionCat.entryLinks;

      // Also include entry links from subfaction catalogue
      const subfactionLinks = subfactionCat?.entryLinks ?? [];

      const combinedLinks = [...allLinks, ...subfactionLinks];

      const unitOptions: UnitOption[] = combinedLinks
        .filter((link) => link.type === 'selectionEntry' && !link.hidden)
        .map((link) => {
          const entry = entryMap.get(link.targetId) ?? null;
          const profiles = entry?.profiles ?? [];
          const pts = link.costs.find((c) => c.name === 'pts')?.value ?? 0;

          return {
            linkId: link.id,
            targetId: link.targetId,
            name: link.name,
            points: pts,
            hidden: link.hidden,
            entry,
            profiles,
          };
        })
        .filter((u) => u.name !== '' && !isInfrastructureEntry(u.name));

      // Remove duplicates by name+points
      const seen = new Set<string>();
      const uniqueUnits: UnitOption[] = [];
      for (const u of unitOptions) {
        const key = u.name + '|' + u.points;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueUnits.push(u);
        }
      }

      // Sort: by name
      uniqueUnits.sort((a, b) => a.name.localeCompare(b.name));

      setUnits(uniqueUnits);
      loadedRef.current = key;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load units');
    } finally {
      setLoading(false);
    }
  }, [factionFilename, subfactionFilename]);

  // Load on mount
  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const filteredUnits = search
    ? units.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    : units;

  if (loading) {
    return (
      <div className="unit-browser">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading units...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="unit-browser">
        <div className="error-state">
          <span>⚠️ {error}</span>
          <button className="btn btn-sm" onClick={loadUnits}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="unit-browser">
      <div className="unit-browser-header">
        <h3>Available Units ({units.length})</h3>
        <input
          type="search"
          placeholder="Search units..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="unit-list">
        {filteredUnits.length === 0 ? (
          <div className="empty-state">No units match your search.</div>
        ) : (
          filteredUnits.map((unit) => (
            <div key={unit.linkId} className="unit-item">
              <div
                className="unit-item-header"
                onClick={() =>
                  setExpandedUnit(expandedUnit === unit.linkId ? null : unit.linkId)
                }
              >
                <span className="unit-name">{unit.name}</span>
                <div className="unit-actions">
                  {unit.points > 0 && (
                    <span className="unit-points">{unit.points} pts</span>
                  )}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddUnit(null, unit.entry!, unit.name, unit.points, unit.profiles);
                    }}
                    title="Add to army"
                  >
                    + Add
                  </button>
                  {unit.profiles.length > 0 && (
                    <button
                      className={`btn btn-sm ${expandedUnit === unit.linkId ? 'btn-active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedUnit(expandedUnit === unit.linkId ? null : unit.linkId);
                      }}
                    >
                      {expandedUnit === unit.linkId ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              </div>

              {expandedUnit === unit.linkId && unit.profiles.length > 0 && (
                <div className="unit-profiles">
                  <ProfileViewer profiles={unit.profiles} compact />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function deriveLibraryFilename(factionFilename: string): string {
  const base = factionFilename.replace('.cat', '');
  return `${base} - Library.cat`;
}

function isInfrastructureEntry(name: string): boolean {
  // Filter out non-unit entries like "Battle Traits", "Renown", "Warlord", etc.
  const infraPatterns = [
    'Battle Traits',
    'Battle Wound',
    'Warlord',
    'Renown',
    'Configuration',
    'Army List',
    'Allegiance',
  ];
  return infraPatterns.some((p) => name.startsWith(p));
}

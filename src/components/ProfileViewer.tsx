import type { Profile } from '../types/battlescribe';
import './ProfileViewer.css';

interface ProfileViewerProps {
  profiles: Profile[];
  compact?: boolean;
}

const PROFILE_ORDER: Record<string, number> = {
  'Unit': 1,
  'Melee Weapon': 2,
  'Ranged Weapon': 3,
  'Ability (Passive)': 4,
  'Ability (Activated)': 5,
  'Ability (Command)': 6,
  'Ability (Spell)': 7,
  'Ability (Prayer)': 8,
};

export function ProfileViewer({ profiles, compact = false }: ProfileViewerProps) {
  if (profiles.length === 0) return null;

  // Filter out hidden profiles and group by type
  const visibleProfiles = profiles.filter((p) => !p.hidden);

  // Group profiles by type
  const grouped = visibleProfiles.reduce<Record<string, Profile[]>>((acc, profile) => {
    const key = profile.typeName || profile.typeId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(profile);
    return acc;
  }, {});

  // Sort groups by profile type order
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const orderA = PROFILE_ORDER[a] ?? 99;
    const orderB = PROFILE_ORDER[b] ?? 99;
    return orderA - orderB;
  });

  return (
    <div className={`profile-viewer ${compact ? 'compact' : ''}`}>
      {sortedTypes.map((typeName) => (
        <div key={typeName} className="profile-group">
          <ProfileGroup typeName={typeName} profiles={grouped[typeName]} />
        </div>
      ))}
    </div>
  );
}

function ProfileGroup({ typeName, profiles }: { typeName: string; profiles: Profile[] }) {
  if (profiles.length === 0) return null;

  // Get characteristic names from the first profile
  const charNames = profiles[0].characteristics.map((c) => c.name);

  if (charNames.length === 0) return null;

  return (
    <div className="profile-table-container">
      <div className="profile-type-label">{typeName}</div>
      <table className="profile-table">
        <thead>
          <tr>
            <th className="profile-name-col">Name</th>
            {charNames.map((name) => (
              <th key={name} className="profile-char-col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id}>
              <td className="profile-name-cell">{profile.name}</td>
              {profile.characteristics.map((char) => (
                <td key={char.typeId} className="profile-char-cell">
                  {char.value || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { ArmyList } from '../types/battlescribe';
import { ProfileViewer } from './ProfileViewer';
import './ArmyRoster.css';

interface ArmyRosterProps {
  army: ArmyList;
  totalPoints: number;
  onRemoveUnit: (unitId: string) => void;
  onUpdateName: (name: string) => void;
  onUpdatePoints: (points: number) => void;
}

export function ArmyRoster({
  army,
  totalPoints,
  onRemoveUnit,
  onUpdateName,
  onUpdatePoints,
}: ArmyRosterProps) {
  const pointsOver = totalPoints > army.pointsLimit && army.pointsLimit > 0;
  const pointsPercentage =
    army.pointsLimit > 0 ? Math.min((totalPoints / army.pointsLimit) * 100, 100) : 0;

  return (
    <div className="army-roster">
      <div className="roster-header">
        <input
          type="text"
          className="army-name-input"
          value={army.name}
          onChange={(e) => onUpdateName(e.target.value)}
          placeholder="Army Name"
        />
        <div className="points-control">
          <label className="points-label">Points Limit:</label>
          <input
            type="number"
            className="points-input"
            value={army.pointsLimit}
            min={0}
            step={100}
            onChange={(e) => onUpdatePoints(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <div className="roster-summary">
        <div className={`points-display ${pointsOver ? 'over-limit' : ''}`}>
          <span className="points-used">{totalPoints}</span>
          {army.pointsLimit > 0 && (
            <>
              <span className="points-separator"> / </span>
              <span className="points-limit">{army.pointsLimit} pts</span>
            </>
          )}
          {pointsOver && <span className="over-badge">OVER LIMIT</span>}
        </div>

        {army.pointsLimit > 0 && (
          <div className="points-bar-container">
            <div
              className={`points-bar ${pointsOver ? 'over' : ''}`}
              style={{ width: `${pointsPercentage}%` }}
            />
          </div>
        )}

        <div className="roster-meta">
          {army.faction && (
            <span className="meta-chip">{army.faction.name}</span>
          )}
          {army.subfaction && (
            <span className="meta-chip meta-chip-secondary">
              {army.subfaction.subfactionName}
            </span>
          )}
          {army.forceEntry && (
            <span className="meta-chip meta-chip-tertiary">{army.forceEntry.name}</span>
          )}
        </div>
      </div>

      <div className="unit-roster">
        {army.units.length === 0 ? (
          <div className="roster-empty">
            <p>No units added yet.</p>
            <p className="roster-empty-hint">Use the Unit Browser to add units to your army.</p>
          </div>
        ) : (
          <div className="roster-units">
            {army.units.map((unit) => (
              <div key={unit.id} className="roster-unit">
                <div className="roster-unit-header">
                  <span className="roster-unit-name">{unit.name}</span>
                  <div className="roster-unit-actions">
                    {unit.pointsCost > 0 && (
                      <span className="roster-unit-points">{unit.pointsCost} pts</span>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onRemoveUnit(unit.id)}
                      title="Remove unit"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {unit.profiles.length > 0 && (
                  <div className="roster-unit-profiles">
                    <ProfileViewer profiles={unit.profiles} compact />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

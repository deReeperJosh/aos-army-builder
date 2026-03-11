import { createContext, useContext } from 'react';
import type { ArmyList, Faction, Subfaction, ForceEntry, ArmyUnit } from '../types/battlescribe';

export interface ArmyStore {
  armyLists: ArmyList[];
  activeArmyListId: string | null;

  // Actions
  createArmyList: (name: string) => string;
  updateArmyList: (id: string, updates: Partial<ArmyList>) => void;
  deleteArmyList: (id: string) => void;
  setActiveArmyList: (id: string | null) => void;

  setFaction: (faction: Faction | null) => void;
  setSubfaction: (subfaction: Subfaction | null) => void;
  setForceEntry: (forceEntry: ForceEntry | null) => void;
  setPointsLimit: (points: number) => void;
  setArmyName: (name: string) => void;

  addUnit: (unit: ArmyUnit) => void;
  removeUnit: (unitId: string) => void;

  getActiveList: () => ArmyList | null;
  getTotalPoints: () => number;
}

export const ArmyStoreContext = createContext<ArmyStore | null>(null);

export function useArmyStore(): ArmyStore {
  const store = useContext(ArmyStoreContext);
  if (!store) throw new Error('ArmyStore not provided');
  return store;
}

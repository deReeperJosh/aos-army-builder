import type { SpearheadArmy } from '../types/spearhead';

/**
 * Pre-defined Spearhead army data.
 * Each entry corresponds to a Spearhead army card.
 * Data for Ossiarch Bonereapers is taken from the reference image.
 */
export const SPEARHEAD_ARMIES: SpearheadArmy[] = [
  {
    id: 'ossiarch-bonereapers',
    name: 'Ossiarch Bonereapers',
    battleTraits: [
      {
        name: 'Reserve Contingent',
        timing: 'Passive',
        effect:
          'One of your Mortek Guard units is not set up during the deployment phase. ' +
          'Instead, from the third battle round onwards, it can use the following ability:\n\n' +
          'CONTINGENT ARRIVAL (Your Movement Phase): Set up this unit anywhere on the battlefield ' +
          'wholly within 3\u201d of a battlefield edge and more than 6\u201d from all enemy units.',
        keywords: ['Core'],
      },
      {
        name: 'Ossiarch Commands',
        timing: 'Passive',
        effect:
          'OSSIARCH COMMANDS are abilities that can only be used by spending Ossiarch command points. ' +
          'At the start of the battle round, you receive 2 Ossiarch command points. ' +
          'Each OSSIARCH COMMANDS costs 1 Ossiarch command point to use. ' +
          'The same unit cannot use more than one OSSIARCH COMMANDS in the same phase. ' +
          'At the end of the battle round, all remaining Ossiarch command points are lost.',
      },
    ],
    regimentalAbilities: [
      {
        name: 'Impenetrable Ranks',
        timing: 'Once Per Battle, Any Combat Phase',
        declare: 'Pick a friendly unit to use this ability.',
        effect: 'Until the end of the phase, add 1 to ward rolls for that unit.',
        keywords: ['Ossiarch Command'],
      },
      {
        name: 'Re-Form Ranks',
        timing: 'Once Per Battle, Your Movement Phase',
        declare: 'Pick a friendly Mortek Guard unit in combat to use this ability.',
        effect:
          'That unit can use a RETREAT ability this phase without any mortal damage being inflicted on it.',
        keywords: ['Ossiarch Command'],
      },
    ],
    enhancements: [
      {
        name: 'Empower Nadirite Weapons',
        timing: 'Your Hero Phase',
        declare:
          'Pick a visible friendly Mortek Guard unit wholly within 12\u201d of your general, then make a casting roll of 2D6.',
        effect:
          'On a 5+, until the start of your next turn, add 1 to the Rend characteristic of that unit\u2019s melee weapons.',
      },
      {
        name: 'Unstoppable Commander',
        timing: 'Your Movement Phase',
        declare:
          'Pick a friendly Mortek Guard unit wholly within 12\u201d of your general, then roll a dice.',
        effect: 'On a 2+, add 3\u201d to that unit\u2019s Move characteristic this phase.',
      },
      {
        name: 'Murderous Drive',
        timing: 'Passive',
        effect: 'Your general\u2019s Soulreaper Scythe has Crit (2 Hits).',
      },
      {
        name: 'Marrowpact',
        timing: 'Passive',
        effect:
          'Each time your general uses a FIGHT ability, after all of their attacks have been resolved, ' +
          'Heal (X) your general where X is the number of damage points allocated by those attacks.',
      },
    ],
    units: [
      {
        id: 'mortisan-soulreaper',
        name: 'Mortisan Soulreaper',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Wizard', 'Infantry'],
        move: '5\u201d',
        health: '5',
        save: '4+',
        ward: '6+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Soulreaper Scythe',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '3+',
            rend: '2',
            damage: '2',
          },
        ],
        abilities: [
          {
            name: 'Drain Vitality',
            timing: 'Your Hero Phase',
            declare:
              'Pick a visible enemy unit within 18\u201d of this unit to be the target, then make a casting roll of 2D6.',
            effect:
              'On a 6+, subtract 1 from hit rolls for attacks made by the target unit until the start of your next turn.',
          },
          {
            name: 'Reknit Construct',
            timing: 'Your Movement Phase',
            declare:
              'Pick a friendly unit wholly within 12\u201d of this unit and that is not in combat to be the target.',
            effect:
              'Heal (D3) the target. If the target unit is not damaged, you can instead return a number of slain models to it that have a combined Health characteristic of D3 or less.',
            keywords: ['Ossiarch Command'],
          },
        ],
      },
      {
        id: 'mortek-guard',
        name: 'Mortek Guard',
        count: '10x | 10x',
        isGeneral: false,
        keywords: ['Infantry'],
        move: '4\u201d',
        health: '1',
        save: '4+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Nadirite Spear',
            type: 'Melee',
            attacks: '2',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: '1',
            ability: 'Anti-charge (+1 Rend)',
          },
        ],
        abilities: [
          {
            name: 'Nadirite Assault',
            timing: 'Any Combat Phase',
            effect: "Until the end of the phase, this unit's melee weapons have Crit (2 Hits).",
            keywords: ['Ossiarch Command'],
          },
        ],
      },
      {
        id: 'kavalos-deathriders',
        name: 'Kavalos Deathriders',
        count: '5x',
        isGeneral: false,
        keywords: ['Cavalry'],
        move: '10\u201d',
        health: '3',
        save: '4+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Nadirite Spear',
            type: 'Melee',
            attacks: '3',
            hit: '3+',
            wound: '4+',
            rend: '1',
            damage: '1',
            ability: 'Charge (+1 Damage)',
          },
          {
            name: "Kavalos Steed's Hooves and Teeth",
            type: 'Melee',
            attacks: '2',
            hit: '5+',
            wound: '3+',
            rend: '-',
            damage: '1',
            ability: 'Companion',
          },
        ],
        abilities: [
          {
            name: 'Deathrider Wedge',
            timing: 'Your Charge Phase',
            effect:
              '\u2022 Models in this unit can pass across enemy INFANTRY models as if this unit had FLY.\n' +
              '\u2022 After this unit has charged, you can pick an enemy unit that it passed across and roll a dice. On a 2+, inflict D3 mortal damage on that enemy unit.',
            keywords: ['Ossiarch Command'],
          },
        ],
      },
      {
        id: 'gothizzar-harvester',
        name: 'Gothizzar Harvester',
        count: '1x',
        isGeneral: false,
        keywords: ['Monster'],
        move: '6\u201d',
        health: '10',
        save: '4+',
        ward: '6+',
        control: '5',
        rangedWeapons: [
          {
            name: "Death's Head Maw",
            type: 'Ranged',
            range: '12\u201d',
            attacks: '4',
            hit: '4+',
            wound: '4+',
            rend: '1',
            damage: '1',
          },
        ],
        meleeWeapons: [
          {
            name: 'Soulcrusher Bludgeons',
            type: 'Melee',
            attacks: '6',
            hit: '4+',
            wound: '2+',
            rend: '2',
            damage: '2',
          },
          {
            name: 'Ossified Hooves and Tail',
            type: 'Melee',
            attacks: '4',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
        ],
        abilities: [
          {
            name: 'Bone Harvest',
            timing: 'Passive',
            effect:
              'Each time an enemy model in combat with this unit is slain, this unit gains 1 bone-tithe point. It can never have more than 6 bone-tithe points.',
          },
          {
            name: 'Repair Construct',
            timing: 'End of Any Turn',
            declare:
              'Pick a friendly Mortek Guard unit within 6\u201d of this unit to be the target. Then, roll a dice for each bonetithe point this unit has.',
            effect:
              'For each 4+, you can return 1 slain model to the target unit. Then, reset this unit\u2019s bone-tithe points to 0.',
            keywords: ['Ossiarch Command'],
          },
        ],
      },
    ],
  },
];

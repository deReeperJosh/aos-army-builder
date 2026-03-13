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
  // ---- Blades of Khorne (Mortal) ----
  {
    id: 'blades-of-khorne',
    name: 'Blades of Khorne',
    battleTraits: [
      {
        name: 'The Blood Tithe',
        timing: 'Passive',
        effect: 'Each time a unit is destroyed during the battle, you receive 1 blood tithe point.',
      },
      {
        name: 'Heads Must Roll',
        timing: 'Once Per Turn, Any Hero Phase',
        declare: 'Spend 3 blood tithe points and pick up to 3 friendly units.',
        effect: "Add 1 to the Rend characteristic of those units' melee weapons until the start of your next turn.",
      },
      {
        name: 'Murderlust',
        timing: 'Once Per Turn, Any Hero Phase',
        declare: 'Spend 1 blood tithe point and pick up to D3 friendly units.',
        effect: 'Each of those units can move D6\u201d (roll for each).',
      },
    ],
    regimentalAbilities: [
      {
        name: 'Favoured of Khorne',
        timing: 'Once Per Turn, Start of Your Turn',
        effect: 'Roll a dice. On a 2+, you receive 1 blood tithe point.',
      },
      {
        name: 'Blood-woken Runes',
        timing: 'Passive',
        effect: 'Friendly units have WARD (5+) if they have used a FIGHT ability in the same phase.',
      },
    ],
    enhancements: [
      {
        name: 'Resanguination',
        timing: 'Your Hero Phase',
        declare:
          'Pick a visible friendly unit wholly within 16\u201d of your general, then make a chanting roll of D6.',
        effect: 'On a 3+, Heal (D3) that unit.',
      },
      {
        name: 'The Crimson Plate',
        timing: 'Passive',
        effect: 'Your general has WARD (5+).',
      },
      {
        name: 'Headhunter',
        timing: 'Any Combat Phase',
        declare: 'Pick an enemy HERO in combat with your general.',
        effect:
          'Your general has STRIKE-FIRST this phase, but all attacks made by them this phase must target that enemy HERO.',
      },
      {
        name: 'Unholy Flames',
        timing: 'Your Hero Phase',
        declare:
          'Pick a visible friendly unit wholly within 16\u201d of your general, then make a chanting roll of D6.',
        effect:
          "On a 4+, add 1 to the Rend characteristic of that unit\u2019s melee weapons until the start of your next turn.",
      },
    ],
    units: [
      {
        id: 'slaughterpriest',
        name: 'Slaughterpriest',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Priest', 'Infantry'],
        move: '5\u201d',
        health: '6',
        save: '5+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Hackblade and Wrath-hammer',
            type: 'Melee',
            attacks: '4',
            hit: '3+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
        ],
        abilities: [
          {
            name: 'Blood Boil',
            timing: 'Your Hero Phase',
            declare:
              'Pick a visible enemy unit within 16\u201d of this unit to be the target, then make a chanting roll of D6.',
            effect: 'On a 4+, inflict D3 mortal damage on the target.',
          },
          {
            name: 'Blood Sacrifice',
            timing: 'Your Hero Phase',
            declare:
              "Pick a friendly unit within this unit\u2019s combat range to be the target. Roll a dice.",
            effect:
              'On a 2+, inflict D3 mortal damage on the target and you gain 1 blood tithe point.',
          },
        ],
      },
      {
        id: 'mighty-skullcrushers',
        name: 'Mighty Skullcrushers',
        count: '3x',
        isGeneral: false,
        keywords: ['Cavalry'],
        move: '8\u201d',
        health: '5',
        save: '2+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Bloodglaive',
            type: 'Melee',
            attacks: '3',
            hit: '3+',
            wound: '3+',
            rend: '1',
            damage: '1',
            ability: 'Charge (+1 Damage)',
          },
          {
            name: "Juggernaut\u2019s Brazen Hooves",
            type: 'Melee',
            attacks: '2',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: 'D3',
            ability: 'Companion',
          },
        ],
        abilities: [
          {
            name: 'Brass Stampede',
            timing: 'Your Charge Phase',
            declare:
              'If this unit charged this phase, pick an enemy unit within 1\u201d of it to be the target, then roll a dice.',
            effect: 'On a 2+, inflict 1 mortal damage on the target.',
          },
        ],
      },
      {
        id: 'blood-warriors',
        name: 'Blood Warriors',
        count: '5x | 5x',
        isGeneral: false,
        keywords: ['Infantry'],
        move: '5\u201d',
        health: '2',
        save: '3+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Goreaxe and Gorefist',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'No Respite',
            timing: 'Passive',
            effect:
              'Each time a model in this unit is slain, you can pick an enemy unit in combat with this unit and roll a dice. On a 4+, inflict 1 mortal damage on that enemy unit.',
          },
        ],
      },
      {
        id: 'bloodreavers',
        name: 'Bloodreavers',
        count: '10x',
        isGeneral: false,
        keywords: ['Infantry', 'Reinforcement'],
        move: '5\u201d',
        health: '1',
        save: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Reaver Blades',
            type: 'Melee',
            attacks: '2',
            hit: '4+',
            wound: '3+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Frenzied Devotion',
            timing: 'End of Any Turn',
            effect:
              'If this unit is within 8\u201d of your general, you can return D3 slain models to this unit.',
          },
        ],
      },
    ],
  },
  // ---- Karanak's Hunt (Khorne Daemons) ----
  {
    id: 'karanaks-hunt',
    name: "Karanak\u2019s Hunt",
    battleTraits: [
      {
        name: 'The Quarry',
        timing: 'Start of Battle Round',
        effect:
          'If no enemy units are the quarry, pick an enemy HERO to be the quarry (you can pick an enemy HERO in reserve).',
      },
      {
        name: 'Blood-Drenched',
        timing: 'Once Per Turn, End of Any Turn',
        declare:
          'Pick a friendly unit that slew any enemy models using a FIGHT ability this turn to be the target.',
        effect: "For the rest of the battle, the target\u2019s melee weapons have Crit (Mortal).",
      },
    ],
    regimentalAbilities: [
      {
        name: 'The Scent of Blood',
        timing: 'Passive',
        effect:
          'Add 1 to hit rolls for combat attacks that target an enemy unit that had any damage points allocated to it this phase.',
      },
      {
        name: 'Savagery Upon Savagery',
        timing: 'Once Per Battle, Any Combat Phase',
        declare:
          "Pick a friendly unit in combat with an enemy unit that has any melee weapons with a higher Attacks characteristic than any of the friendly unit\u2019s melee weapons.",
        effect:
          "For the rest of the turn, add 1 to the Attacks characteristic of the target\u2019s melee weapons. If the target is a HERO, add D3 to the Attacks characteristic of its melee weapons instead.",
      },
    ],
    enhancements: [
      {
        name: 'Sustained by Gore',
        timing: 'End of Any Turn',
        effect:
          "If any damage points were allocated to any enemy units by your general\u2019s combat attacks this turn, Heal (1) your general.",
      },
      {
        name: 'Evasive Hunter',
        timing: 'Passive',
        effect:
          'Subtract 1 from hit rolls and wound rolls for shooting attacks that target your general.',
      },
      {
        name: 'Killing Pounce',
        timing: 'Once Per Battle, Any Charge Phase',
        effect:
          "For the rest of the turn, when making charge rolls for your general, you can roll an additional dice, to a maximum of 3, but if you do, they must finish that charge in combat with the quarry.",
      },
      {
        name: 'Furious Bites',
        timing: 'End of Any Turn',
        effect: 'If your general is in combat with the quarry, inflict D3 mortal damage on the quarry.',
      },
    ],
    units: [
      {
        id: 'karanak',
        name: 'Karanak',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Beast'],
        move: '8\u201d',
        health: '7',
        save: '5+',
        ward: '6+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Savage Maws and Goreslick Claws',
            type: 'Melee',
            attacks: '6',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '2',
            ability: 'Anti-HERO (+1 Rend)',
          },
        ],
        abilities: [
          {
            name: 'Stalk the Prey',
            timing: 'Any Hero Phase',
            effect:
              'This unit can move D6\u201d. It cannot end that move in combat unless it was in combat at the start of that move and, if there is an enemy quarry on the battlefield, it must end that move closer to the quarry.',
          },
        ],
      },
      {
        id: 'flesh-hounds',
        name: 'Flesh Hounds',
        count: '5x | 5x',
        isGeneral: false,
        keywords: ['Beast', 'Reinforcements'],
        move: '8\u201d',
        health: '2',
        save: '6+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Blood-dark Claws',
            type: 'Melee',
            attacks: '4',
            hit: '4+',
            wound: '3+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Unflagging Hunters',
            timing: 'Passive',
            effect: 'Add 1 to charge rolls for this unit.',
          },
        ],
      },
      {
        id: 'claws-of-karanak',
        name: 'Claws of Karanak',
        count: '8x',
        isGeneral: false,
        keywords: ['Infantry', 'Reinforcements'],
        move: '6\u201d',
        health: '1',
        save: '5+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Weapons of the Hunt',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '3+',
            rend: '-',
            damage: '1',
            ability: 'Crit (2 Hits)',
          },
        ],
        abilities: [
          {
            name: 'Pack Hunters',
            timing: 'Passive',
            declare:
              'Pick an enemy unit in combat with both this unit and a friendly Flesh Hounds unit to be the target.',
            effect:
              "For the rest of the turn, this unit\u2019s combat attacks that target that enemy unit score critical hits on unmodified hit rolls of 5+.",
          },
        ],
      },
    ],
  },
  // ---- Cities of Sigmar (Freeguild Cavalier-Marshal) ----
  {
    id: 'cities-of-sigmar-freeguild',
    name: 'Cities of Sigmar (Freeguild)',
    battleTraits: [
      {
        name: "The Officar\u2019s Order",
        timing: 'Once Per Battle Round, Start of Battle Round',
        declare:
          'Pick a battle tactic card in your hand and place it face-down separately next to your other battle tactic cards. The information on it is still hidden from your opponent but make it clear which card is separate.',
        effect:
          "When you use the command on that card, it is not discarded but returns to your hand. Your opponent can check the information on it before it returns to your hand. The card goes back to being a normal battle tactic card, with the exception that you cannot use the command on it in the same phase it went back into your hand.\n\nIf you did not use the command on the card you separated, you can still score the battle tactic on it at the end of your turn as normal if you met its conditions. If you do so, discard it as normal. If you neither used the command nor scored the battle tactic on it, it automatically returns to your hand at the end of your turn.",
      },
    ],
    regimentalAbilities: [
      {
        name: 'For Sigmar, Charge!',
        timing: 'Once Per Battle, Your Charge Phase',
        declare: 'Use this ability before any CHARGE abilities are used this phase.',
        effect: 'Friendly CAVALRY units that charge this phase have STRIKE-FIRST this turn.',
      },
      {
        name: 'Ironweld Discipline',
        timing: 'Once Per Battle, Enemy Shooting Phase',
        declare: 'Pick your Ironweld Great Cannon to use this ability.',
        effect: "It can use the \u2018Shoot\u2019 ability as if it were your shooting phase.",
      },
    ],
    enhancements: [
      {
        name: 'Flask of Lethisian Darkwater',
        timing: 'Once Per Battle, Start of Any Turn',
        effect: 'Heal (D6) your general.',
      },
      {
        name: 'Heirloom Blade',
        timing: 'Passive',
        effect:
          "Add 1 to the Rend characteristic of your general\u2019s Master-forged Longsword.",
      },
      {
        name: 'Brazier of Holy Flame',
        timing: 'End of Any Turn',
        declare:
          "Pick a friendly Freeguild Steelhelms unit within your general\u2019s combat range.",
        effect: 'You can return up to D3 slain models to that unit.',
      },
      {
        name: 'Glimmering',
        timing: 'Passive',
        effect:
          'Each phase, you can re-roll 1 hit roll, or 1 wound roll, or 1 save roll made for your general.',
      },
    ],
    units: [
      {
        id: 'freeguild-cavalier-marshal',
        name: 'Freeguild Cavalier-Marshal',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Cavalry'],
        move: '10\u201d',
        health: '7',
        save: '3+',
        control: '2',
        rangedWeapons: [
          {
            name: 'Dragoon Pistol',
            type: 'Ranged',
            range: '10\u201d',
            attacks: '2',
            hit: '3+',
            wound: '4+',
            rend: '1',
            damage: '1',
            ability: 'Shoot in Combat',
          },
        ],
        meleeWeapons: [
          {
            name: 'Master-forged Longsword',
            type: 'Melee',
            attacks: '5',
            hit: '3+',
            wound: '4+',
            rend: '1',
            damage: '2',
          },
          {
            name: "Warhorse\u2019s Steel-shod Hooves",
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
            name: 'Decisive Commander',
            timing: 'Your Hero Phase',
            declare:
              'Pick a friendly Freeguild Steelhelms unit wholly within 12\u201d of this unit to be the target and roll a dice.',
            effect:
              'On a 2+, pick:\n\u2022 On Your Feet!: If the target unit is not in combat you can return D3 slain models to it.\n\u2022 Add 3 to the target unit\u2019s control score until the start of your next turn.',
          },
        ],
      },
      {
        id: 'freeguild-steelhelms',
        name: 'Freeguild Steelhelms',
        count: '5x | 5x',
        isGeneral: false,
        keywords: ['Infantry', 'Reinforcement'],
        move: '5\u201d',
        health: '1',
        save: '4+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Freeguild Weapon',
            type: 'Melee',
            attacks: '2',
            hit: '4+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Consecrate the Land',
            timing: 'Your Movement Phase',
            declare:
              'If this unit is contesting an objective you control that is not contested by any enemy models, roll a dice.',
            effect:
              'On a 3+, that objective is considered to be consecrated. Friendly units have WARD (6+) while they are contesting a consecrated objective. If your opponent gains control of a consecrated objective, it is no longer consecrated.',
          },
        ],
      },
      {
        id: 'freeguild-cavaliers',
        name: 'Freeguild Cavaliers',
        count: '5x',
        isGeneral: false,
        keywords: ['Cavalry', 'Reinforcement'],
        move: '10\u201d',
        health: '3',
        save: '3+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Cavalier Weapon',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '4+',
            rend: '1',
            damage: '1',
            ability: 'Charge (+1 Damage)',
          },
          {
            name: "Warhorse\u2019s Steel-shod Hooves",
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
            name: 'Devastating Charge',
            timing: 'Any Charge Phase',
            declare:
              'If this unit charged this phase, pick an enemy unit in combat with it to be the target and roll a dice.',
            effect: 'On a 2+, inflict D3 mortal damage on the target.',
          },
        ],
      },
      {
        id: 'ironweld-great-cannon',
        name: 'Ironweld Great Cannon',
        count: '1x',
        isGeneral: false,
        keywords: ['War Machine'],
        move: '3\u201d',
        health: '8',
        save: '4+',
        control: '2',
        rangedWeapons: [
          {
            name: 'Great Cannon: Cannonball',
            type: 'Ranged',
            range: '24\u201d',
            attacks: '2',
            hit: '4+',
            wound: '2+',
            rend: '2',
            damage: 'D3+2',
          },
          {
            name: 'Great Cannon: Grapeshot',
            type: 'Ranged',
            range: '12\u201d',
            attacks: '5',
            hit: '3+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
        ],
        meleeWeapons: [
          {
            name: "Crew\u2019s Tools and Sidearms",
            type: 'Melee',
            attacks: '2',
            hit: '4+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Shoot and Shell',
            timing: 'Passive',
            effect:
              "Each time this unit uses a SHOOT ability, choose either the Cannonball or Grapeshot weapon characteristics for all the attacks it makes with its Great Cannon. The Cannonball can only be chosen if this unit has not used a MOVE ability that turn.",
          },
        ],
      },
    ],
  },
  // ---- Cities of Sigmar (Wildercorps / Fusil-Major) ----
  {
    id: 'cities-of-sigmar-wildercorps',
    name: 'Cities of Sigmar (Wildercorps)',
    battleTraits: [
      {
        name: 'Fortify Position',
        timing: 'Passive',
        effect:
          'Subtract 1 from the Rend characteristic of weapons used for attacks that target friendly Castelite units if they did not use a MOVE ability in the same turn.',
      },
    ],
    regimentalAbilities: [
      {
        name: 'Well Provisioned',
        timing: 'Once Per Battle (Army), Your Shooting Phase',
        declare: 'Pick a friendly non-HERO unit to be the target.',
        effect:
          "Add 1 to wound rolls for that unit\u2019s shooting attacks for the rest of the phase.",
      },
      {
        name: 'Respected Leader',
        timing: 'Once Per Battle, Deployment Phase',
        effect: 'Friendly Wildercorps Hunters units gain the REINFORCEMENTS keyword.',
      },
    ],
    enhancements: [
      {
        name: 'Adept Tactician',
        timing: 'Once Per Battle, Your Movement Phase',
        declare:
          'Pick 2 friendly Freeguild Fusiliers units that have been destroyed and have not already been replaced.',
        effect:
          'Set up a single replacement Freeguild Fusiliers unit with 10 models more than 6\u201d from all enemy units. That unit cannot be placed adjacent and does not have a Blackpowder Squire token.',
      },
      {
        name: 'Shield Bash',
        timing: 'Once Per Turn, Your Movement Phase',
        declare:
          'Pick an enemy INFANTRY, WAR MACHINE or CAVALRY unit in combat with your general to be the target.',
        effect:
          "Roll a dice. On a 3+, the target must immediately use the \u2018Retreat\u2019 ability as if it were the enemy movement phase.",
      },
      {
        name: 'Brace!',
        timing: 'Passive',
        effect: 'Your general has WARD (6+).',
      },
      {
        name: 'Point-Blank Volley',
        timing: 'Once Per Turn, Enemy Combat Phase',
        declare: 'Pick an enemy unit in combat with your general to be the target.',
        effect: 'Roll a D3. On a 2+, inflict an amount of mortal damage on the target equal to the roll.',
      },
    ],
    units: [
      {
        id: 'fusil-major',
        name: 'Fusil-Major on Ogor War Hulk',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Infantry', 'Castelite'],
        move: '5\u201d',
        health: '8',
        save: '3+',
        control: '2',
        rangedWeapons: [
          {
            name: 'Long-Fusil',
            type: 'Ranged',
            range: '24\u201d',
            attacks: '3',
            hit: '3+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
        ],
        meleeWeapons: [
          {
            name: "Warhulk\u2019s Mace",
            type: 'Melee',
            attacks: '4',
            hit: '4+',
            wound: '2+',
            rend: '2',
            damage: '2',
          },
        ],
        abilities: [
          {
            name: 'Mark Targets',
            timing: 'Your Shooting Phase',
            declare:
              "Pick an enemy unit that was targeted by this unit\u2019s shooting attacks this turn to be the target.",
            effect:
              'Add 1 to hit rolls for shooting attacks made by friendly units that target that unit for the rest of the turn.',
          },
        ],
      },
      {
        id: 'alchemite-war-forger',
        name: 'Alchemite War Forger',
        count: '1x',
        isGeneral: false,
        keywords: ['Hero', 'Wizard', 'Infantry'],
        move: '5\u201d',
        health: '5',
        save: '5+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Tongstaff',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '4+',
            rend: '1',
            damage: 'D3',
          },
        ],
        abilities: [
          {
            name: 'Blazing Weapons',
            timing: 'Your Hero Phase',
            declare:
              'Pick a friendly unit wholly within 12\u201d of this unit to be the target, then make a casting roll of 2D6.',
            effect:
              "On a 6+, the target\u2019s melee weapons have Crit (Mortal) until the start of your next turn.",
          },
        ],
      },
      {
        id: 'freeguild-fusiliers',
        name: 'Freeguild Fusiliers',
        count: '5x | 5x',
        isGeneral: false,
        keywords: ['Infantry', 'Castelite', 'Reinforcements'],
        move: '5\u201d',
        health: '1',
        save: '4+',
        control: '1',
        rangedWeapons: [
          {
            name: 'Fusil-cannon',
            type: 'Ranged',
            range: '18\u201d',
            attacks: '2',
            hit: '4+',
            wound: '4+',
            rend: '1',
            damage: '1',
          },
        ],
        meleeWeapons: [
          {
            name: 'Bayonet',
            type: 'Melee',
            attacks: '1',
            hit: '4+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Blackpowder Squire',
            timing: 'Passive',
            effect:
              "While this unit has a Blackpowder Squire token, this unit\u2019s ranged weapons have Shoot in Combat.",
          },
          {
            name: "Can\u2019t Stop",
            timing: 'Once Per Turn (Army), Your Shooting Phase',
            declare: 'Pick another friendly Freeguild Fusiliers unit to be the target.',
            effect:
              "Remove this unit\u2019s Blackpowder Squire token from the battlefield, then give it to the target.",
          },
        ],
      },
      {
        id: 'wildercorps-hunters',
        name: 'Wildercorps Hunters',
        count: '11x',
        isGeneral: false,
        keywords: ['Infantry'],
        move: '5\u201d',
        health: '1',
        save: '5+',
        control: '1',
        rangedWeapons: [
          {
            name: 'Hunting Crossbow',
            type: 'Ranged',
            range: '15\u201d',
            attacks: '2',
            hit: '4+',
            wound: '4+',
            rend: '1',
            damage: '1',
          },
        ],
        meleeWeapons: [
          {
            name: 'Hunting Weapons',
            type: 'Melee',
            attacks: '2',
            hit: '4+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
          {
            name: "Trailhound\u2019s Ferocious Bite",
            type: 'Melee',
            attacks: '2',
            hit: '4+',
            wound: '3+',
            rend: '-',
            damage: '1',
            ability: 'Trailhound models only',
          },
        ],
        abilities: [
          {
            name: 'Expert Trackers',
            timing: 'Deployment Phase',
            effect:
              "This unit can use the \u2018Normal Move\u2019 ability as if it were your movement phase.",
          },
        ],
      },
    ],
  },
];

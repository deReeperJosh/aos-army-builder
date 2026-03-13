import type { SpearheadArmy } from '../types/spearhead';

/**
 * Pre-defined Spearhead army data.
 * Each entry corresponds to a Spearhead army card.
 * Data for Ossiarch Bonereapers is taken from the reference image.
 */
export const SPEARHEAD_ARMIES: SpearheadArmy[] = [
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
  // ---- Daughters of Khaine (Melusai Ironscale) ----
  {
    id: 'daughters-of-khaine',
    name: 'Daughters of Khaine',
    battleTraits: [
      {
        name: 'Blood Rites',
        timing: 'Start of Battle Round',
        effect:
          'All friendly units gain the Blood Rites passive ability that corresponds to the current battle round number (units keep all Blood Rites abilities gained in previous battle rounds):\n\u2022 Round 1 \u2013 Quickening Bloodlust: Add 1 to run rolls for this unit.\n\u2022 Round 2 \u2013 Headlong Fury: Add 1 to charge rolls for this unit.\n\u2022 Round 3 \u2013 Zealot\u2019s Rage: Add 1 to hit rolls for combat attacks made by this unit.\n\u2022 Round 4 \u2013 Slaughterer\u2019s Strength: Add 1 to wound rolls for combat attacks made by this unit.',
      },
    ],
    regimentalAbilities: [
      {
        name: 'Murderous Epiphany',
        timing: 'Once Per Battle, Your Hero Phase',
        effect:
          'All friendly units gain the Blood Rites passive ability they would have gained at the start of the next battle round (they keep this ability for the rest of the battle, but they do not gain it for a second time at the start of the next battle round).',
      },
      {
        name: 'Blessing of Khaine',
        timing: 'Any Combat Phase',
        declare: 'Pick a friendly unit wholly within 12\u201d of your general. You cannot pick your general.',
        effect: 'Add 1 to ward rolls for that unit this phase.',
      },
    ],
    enhancements: [
      {
        name: 'Bathed in Blood',
        timing: 'Passive',
        effect: 'Each time a model is slain by your general, Heal (1) your general.',
      },
      {
        name: 'Fuelled by Revenge',
        timing: 'Passive',
        effect:
          'Add 1 to the Rend characteristic of melee weapons used by friendly Blood Stalkers units while they are wholly within 12\u201d of your general.',
      },
      {
        name: 'Flask of Shademist',
        timing: 'Once Per Battle, Any Combat Phase',
        effect:
          'Until the end of the phase, subtract 1 from hit rolls for attacks that target friendly units while they are wholly within 12\u201d of your general.',
      },
      {
        name: 'Zealous Orator',
        timing: 'Your Hero Phase',
        declare:
          'Pick a friendly unit wholly within 9\u201d of your general that is not in combat. Roll a dice for each slain model from that unit.',
        effect: 'For each 5+, you can return 1 slain model to that unit.',
      },
    ],
    units: [
      {
        id: 'melusai-ironscale',
        name: 'Melusai Ironscale',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Infantry'],
        move: '8\u201d',
        health: '6',
        save: '5+',
        ward: '6+',
        control: '2',
        rangedWeapons: [
          {
            name: 'Keldrisaith',
            type: 'Ranged',
            range: '12\u201d',
            attacks: '2',
            hit: '3+',
            wound: '3+',
            rend: '1',
            damage: 'D3',
          },
        ],
        meleeWeapons: [
          {
            name: 'Keldrisaith',
            type: 'Melee',
            attacks: '6',
            hit: '3+',
            wound: '4+',
            rend: '1',
            damage: '2',
          },
        ],
        abilities: [
          {
            name: 'All-out Slaughter',
            timing: 'Your Hero Phase',
            declare:
              'Pick a friendly unit wholly within 12\u201d of this unit to be the target. You cannot pick this unit.',
            effect: 'Add 1 to the Attacks characteristic of the target\u2019s melee weapons for the rest of the turn.',
          },
          {
            name: 'Turned to Crystal',
            timing: 'End of Any Turn',
            declare:
              'Pick an enemy unit within 1\u201d of this unit to be the target and roll a dice.',
            effect: 'On a 2+, inflict 1 mortal damage on the target.',
          },
        ],
      },
      {
        id: 'blood-stalkers',
        name: 'Blood Stalkers',
        count: '5x',
        isGeneral: false,
        keywords: ['Infantry'],
        move: '8\u201d',
        health: '2',
        save: '6+',
        ward: '6+',
        control: '1',
        rangedWeapons: [
          {
            name: 'Heartseeker Bow',
            type: 'Ranged',
            range: '18\u201d',
            attacks: '3',
            hit: '3+',
            wound: '4+',
            rend: '1',
            damage: '1',
            ability: 'Crit (Auto-wound)',
          },
        ],
        meleeWeapons: [
          {
            name: 'Scianlar',
            type: 'Melee',
            attacks: '2',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Heartseekers',
            timing: 'Passive',
            effect:
              'Shooting attacks made by this unit score critical hits on unmodified hit rolls of 5+ if this unit did not use a MOVE ability in the same turn.',
          },
        ],
      },
      {
        id: 'doomfire-warlocks',
        name: 'Doomfire Warlocks',
        count: '5x',
        isGeneral: false,
        keywords: ['Cavalry', 'Reinforcement'],
        move: '14\u201d',
        health: '3',
        save: '5+',
        ward: '6+',
        control: '1',
        rangedWeapons: [
          {
            name: 'Doomfire Crossbow',
            type: 'Ranged',
            range: '10\u201d',
            attacks: '2',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
        ],
        meleeWeapons: [
          {
            name: 'Cursed Scimitar',
            type: 'Melee',
            attacks: '2',
            hit: '3+',
            wound: '4+',
            rend: '1',
            damage: '1',
          },
          {
            name: "Dark Steed\u2019s Vicious Bite",
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
            name: 'Doomfire',
            timing: 'Your Hero Phase',
            declare:
              'Pick a visible enemy unit within 12\u201d of this unit to be the target, then make a casting roll of 2D6.',
            effect: 'On a 6+, inflict D3 mortal damage on the target.',
          },
        ],
      },
      {
        id: 'witch-aelves',
        name: 'Witch Aelves',
        count: '5x | 5x',
        isGeneral: false,
        keywords: ['Infantry', 'Reinforcement'],
        move: '6\u201d',
        health: '1',
        save: '6+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Paired Scians\u00e1',
            type: 'Melee',
            attacks: '3',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: '1',
            ability: 'Crit (Auto-wound)',
          },
        ],
        abilities: [
          {
            name: 'Frenzied Fervour',
            timing: 'Passive',
            effect:
              'Add 1 to the Rend characteristic of this unit\u2019s melee weapons if it charged in the same turn.',
          },
        ],
      },
    ],
  },
  // ---- Disciples of Tzeentch (Magister on Disc of Tzeentch) ----
  {
    id: 'disciples-of-tzeentch-magister',
    name: 'Disciples of Tzeentch (Magister)',
    battleTraits: [
      {
        name: 'Masters of Destiny',
        timing: 'Once Per Battle, Start of First Battle Round',
        effect:
          'Roll 9 dice and put them to one side. These are your destiny dice. During the battle, instead of rolling the dice for 1 of the rolls from the list below, you can pick one of your destiny dice and use it as the roll. Once a destiny dice has been used, it is discarded.\n\nIf you want to replace a roll that uses more than one D6, you must use the same number of destiny dice (e.g., you would need to use 2 destiny dice in place of a 2D6 casting roll). Rolls that are replaced count as unmodified rolls and cannot be re-rolled or modified unless noted.\n\nThe following rolls can be replaced with destiny dice:\n\u2022 Casting rolls\n\u2022 Run rolls\n\u2022 Charge rolls\n\u2022 Hit rolls\n\u2022 Wound rolls\n\u2022 Save rolls \u2013 you must still modify the roll by the Rend characteristic of the attacking weapon.',
      },
    ],
    regimentalAbilities: [
      {
        name: 'Transient Forms',
        timing: 'Passive',
        effect:
          'Roll a dice each time a friendly Kairic Acolytes model is slain in the combat phase. On a 4+, you can return 1 slain model to a friendly Tzaangors unit within 9\u201d of the slain model.',
      },
      {
        name: 'Eternal Conflagration',
        timing: 'Passive',
        effect:
          'Add 1 to the Rend characteristic of ranged weapons used by friendly Flamers of Tzeentch units.',
      },
    ],
    enhancements: [
      {
        name: 'Shield of Fate',
        timing: 'Your Hero Phase',
        declare: 'Pick a visible friendly unit wholly within 18\u201d of your general, then make a casting roll of 2D6.',
        effect:
          'On a 4+, until the start of your next turn, that unit has WARD (6+). If that unit already has a ward save, add 1 to ward rolls for that unit until the start of your next turn instead.',
      },
      {
        name: 'Daemonheart',
        timing: 'Once Per Battle, Any Combat Phase',
        declare: 'Pick an enemy unit within 1\u201d of your general.',
        effect:
          'Inflict an amount of mortal damage on that unit equal to the number of the current battle round.',
      },
      {
        name: 'Glimpse the Future',
        timing: 'Your Hero Phase',
        declare: 'If you have fewer than 6 destiny dice, make a casting roll of 2D6.',
        effect: 'On a 7+, you can roll a dice and add it to your destiny dice.',
      },
      {
        name: 'Timeslip Pendant',
        timing: 'Once Per Battle, Any Combat Phase',
        declare: 'Pick an enemy unit within 9\u201d of your general.',
        effect: 'That unit has STRIKE-LAST this phase.',
      },
    ],
    units: [
      {
        id: 'magister-on-disc-of-tzeentch',
        name: 'Magister on Disc of Tzeentch',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Wizard', 'Cavalry', 'Fly'],
        move: '14\u201d',
        health: '6',
        save: '4+',
        ward: undefined,
        control: '2',
        rangedWeapons: [
          {
            name: 'Tzeentchian Runestaff',
            type: 'Ranged',
            range: '18\u201d',
            attacks: '1',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: 'D3',
          },
        ],
        meleeWeapons: [
          {
            name: 'Warpsteel Sword',
            type: 'Melee',
            attacks: '3',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: 'D3',
          },
          {
            name: "Disc's Teeth and Horns",
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
            name: 'Bolt of Change',
            timing: 'Your Hero Phase',
            declare:
              'Pick a visible enemy unit within 18\u201d of this unit to be the target, then make a casting roll of 2D6.',
            effect:
              'On a 6+, inflict D3 mortal damage on the target. If any models are slain by this ability, you can pick a friendly Tzaangors unit wholly within 18\u201d of this unit and return 1 slain model to that Tzaangors unit.',
          },
        ],
      },
      {
        id: 'kairic-acolytes',
        name: 'Kairic Acolytes',
        count: '10x',
        isGeneral: false,
        keywords: ['Infantry', 'Reinforcements'],
        move: '5\u201d',
        health: '1',
        save: '5+',
        ward: undefined,
        control: '1',
        rangedWeapons: [
          {
            name: 'Sorcerous Bolts',
            type: 'Ranged',
            range: '18\u201d',
            attacks: '1',
            hit: '4+',
            wound: '3+',
            rend: '-',
            damage: '1',
          },
        ],
        meleeWeapons: [
          {
            name: 'Cursed Blade',
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
            name: 'Gestalt Sorcery',
            timing: 'Your Shooting Phase',
            declare: 'Make a casting roll of 2D6.',
            effect: 'On a 6+, add 1 to the Rend characteristic of this unit\u2019s Sorcerous Bolts this phase.',
          },
        ],
      },
      {
        id: 'screamers-of-tzeentch',
        name: 'Screamers of Tzeentch',
        count: '3x',
        isGeneral: false,
        keywords: ['Beast', 'Fly'],
        move: '14\u201d',
        health: '3',
        save: '5+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Lamprey Bite',
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
            name: 'Slashing Fins',
            timing: 'Your Movement Phase',
            declare:
              'Pick an enemy unit that any models in this unit passed across this phase to be the target, then roll a dice for each model in this unit that did so.',
            effect: 'For each 4+, inflict 1 mortal damage on the target.',
          },
        ],
      },
      {
        id: 'tzaangors-magister',
        name: 'Tzaangors',
        count: '5x | 5x',
        isGeneral: false,
        keywords: ['Infantry'],
        move: '6\u201d',
        health: '2',
        save: '5+',
        ward: undefined,
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Savage Blade and Vicious Beak',
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
            name: 'Long-Planned Strike',
            timing: 'Passive',
            effect:
              'While this unit is wholly within enemy territory, its melee weapons have Crit (2 Hits).',
          },
        ],
      },
      {
        id: 'flamers-of-tzeentch',
        name: 'Flamers of Tzeentch',
        count: '3x',
        isGeneral: false,
        keywords: ['Infantry', 'Fly'],
        move: '9\u201d',
        health: '2',
        save: '5+',
        ward: '6+',
        control: '1',
        rangedWeapons: [
          {
            name: 'Wyrdflame',
            type: 'Ranged',
            range: '12\u201d',
            attacks: '3',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: 'D3',
          },
        ],
        meleeWeapons: [
          {
            name: 'Flaming Maws',
            type: 'Melee',
            attacks: '3',
            hit: '3+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Capricious Wyrdflame',
            timing: 'Passive',
            effect:
              'Add 1 to hit rolls for attacks made by this unit if the target unit has 5 or more models.',
          },
        ],
      },
    ],
  },
  // ---- Disciples of Tzeentch (Tzaangor Shaman) ----
  {
    id: 'disciples-of-tzeentch-shaman',
    name: 'Disciples of Tzeentch (Tzaangor Shaman)',
    battleTraits: [
      {
        name: 'Predict the Future',
        timing: 'Your Hero Phase',
        effect:
          'You can look at up to 3 cards from the top of your battle tactic deck without adding them to your hand. Then, in any order, return each card face down to either the top or the bottom of your battle tactic deck.',
      },
      {
        name: 'Cheat Destiny',
        timing: 'Reaction: You used a command on a battle tactic card',
        effect: 'Instead of discarding that card, return it face down to the bottom of your battle tactic deck.',
      },
      {
        name: 'Fated Arrival',
        timing: 'Your Movement Phase',
        effect:
          'Your Tzaangor Enlightened unit is not set up during the deployment phase. Instead, from the second battle round onwards, it can use the following ability: Set up this unit wholly within friendly territory, within 1\u201d of a battlefield edge and more than 6\u201d from all enemy units.',
      },
    ],
    regimentalAbilities: [
      {
        name: 'Constant Flux',
        timing: 'Passive',
        effect:
          'Subtract 1 from the Rend characteristic of weapons used for attacks that target friendly units while you are the underdog.',
      },
      {
        name: 'Arcane Ritualists',
        timing: 'Passive',
        effect:
          'Add 1 to casting rolls for your general while they are wholly within 6\u201d of another friendly unit.',
      },
      {
        name: 'Predicted Strike',
        timing: 'Once Per Battle, Enemy Movement Phase',
        declare:
          'Pick a visible friendly unit wholly within 12\u201d of your general and that is not in combat to be the target.',
        effect:
          'The target can move D6\u201d. It cannot move through the combat ranges of enemy units or end that move in combat.',
      },
      {
        name: 'Fold Reality',
        timing: 'Your Hero Phase',
        declare:
          'Pick a visible friendly unit wholly within 12\u201d of your general to be the target, then make a casting roll of 2D6.',
        effect:
          'On a 6+, remove the target from the battlefield and set it up again wholly within 12\u201d of your general and more than 6\u201d from all enemy units.',
      },
      {
        name: 'Infernal Gateway',
        timing: 'Your Hero Phase',
        declare:
          'Pick a visible enemy unit within 18\u201d of your general to be the target, then make a casting roll of 2D6.',
        effect:
          'On a 5+, roll either 3 dice or a number of dice equal to the number of battle tactic cards you have discarded this battle. For each 4+, inflict 1 mortal damage on the target.',
      },
      {
        name: 'Mutagenic Sorcery',
        timing: 'End of Any Turn',
        declare:
          'Pick a visible enemy unit within 12\u201d of your general to be the enemy target. Then, pick a friendly Tzaangors unit in combat with the enemy target to be the friendly target.',
        effect:
          'Roll a D3. On a 2+:\n\u2022 Inflict an amount of mortal damage on the enemy target equal to the roll.\n\u2022 You can return 1 slain model to the friendly target.',
      },
    ],
    enhancements: [],
    units: [
      {
        id: 'tzaangor-shaman',
        name: 'Tzaangor Shaman',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Wizard', 'Cavalry', 'Fly'],
        move: '14\u201d',
        health: '6',
        save: '5+',
        ward: undefined,
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Staff of Change and Ritual Dagger',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: 'D3',
          },
          {
            name: "Disc's Teeth and Horns",
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
            name: 'Mutative Aura',
            timing: 'Your Hero Phase',
            declare:
              'Pick a visible enemy unit within 18\u201d of this unit to be the target, then make a casting roll of 2D6.',
            effect:
              'On a 7+, until the start of your next turn, each time an unmodified hit roll for a combat attack made by the target is 1, inflict 1 mortal damage on the target after the FIGHT ability has been resolved.',
          },
        ],
      },
      {
        id: 'tzaangor-enlightened',
        name: 'Tzaangor Enlightened',
        count: '3x',
        isGeneral: false,
        keywords: ['Cavalry', 'Fly'],
        move: '14\u201d',
        health: '4',
        save: '4+',
        ward: undefined,
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Tzeentchian Spear and Vicious Beak',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
          {
            name: "Disc's Teeth and Horns",
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
            name: 'Deliver on Fate',
            timing: 'Passive',
            effect: 'Add 1 to charge rolls for this unit while you are the underdog.',
          },
        ],
      },
      {
        id: 'tzaangor-skyfires',
        name: 'Tzaangor Skyfires',
        count: '3x',
        isGeneral: false,
        keywords: ['Cavalry', 'Fly'],
        move: '14\u201d',
        health: '4',
        save: '4+',
        ward: undefined,
        control: '1',
        rangedWeapons: [
          {
            name: 'Arrow of Fate',
            type: 'Ranged',
            range: '18\u201d',
            attacks: '2',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
        ],
        meleeWeapons: [
          {
            name: 'Bow Stave and Vicious Beak',
            type: 'Melee',
            attacks: '1',
            hit: '4+',
            wound: '3+',
            rend: '-',
            damage: '1',
          },
          {
            name: "Disc's Teeth and Horns",
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
            name: 'Destined Quarry',
            timing: 'Your Shooting Phase',
            declare:
              'Pick an enemy unit that had any damage points allocated to it this phase by this unit\u2019s shooting attacks to be the target.',
            effect:
              'Add 1 to hit rolls for combat attacks made by friendly units that target that enemy unit for the rest of the turn.',
          },
        ],
      },
      {
        id: 'tzaangors-shaman',
        name: 'Tzaangors',
        count: '10x',
        isGeneral: false,
        keywords: ['Infantry'],
        move: '6\u201d',
        health: '2',
        save: '5+',
        ward: undefined,
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Savage Blades and Vicious Beak',
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
            name: 'Eldritch Raiders',
            timing: 'Passive',
            effect:
              'Add 1 to wound rolls for this unit\u2019s attacks while it is wholly within enemy territory.',
          },
        ],
      },
    ],
  },
  // ---- Flesh-Eater Courts (Abhorrant Archregent) ----
  {
    id: 'flesh-eater-courts-archregent',
    name: 'Flesh-Eater Courts (Archregent)',
    battleTraits: [
      {
        name: 'Noble Deeds',
        timing: 'Passive',
        effect:
          'Each time a friendly HERO uses a FIGHT ability, after its attacks have been resolved, give that HERO a number of noble deeds points equal to the number of damage points allocated by that ability. Each HERO can have a maximum of 6 noble deeds points at any time.',
      },
      {
        name: 'Feeding Frenzy',
        timing: 'Passive',
        effect:
          'Add 1 to the Attacks characteristic of melee weapons used by friendly units while they are wholly within 12\u201d of any friendly HEROES that have 6 noble deeds points.',
      },
      {
        name: 'Summon Loyal Subjects',
        timing: 'Your Movement Phase',
        declare: 'Pick a friendly HERO with any noble deeds points to use this ability.',
        effect:
          'Spend any number of that HERO\u2019s noble deeds points as follows:\n\u2022 Spend 1 point to return 1 model to a friendly Cryptguard unit within 9\u201d.\n\u2022 Spend 2 points to return 1 model to a friendly Morbheg Knights unit within 9\u201d.',
      },
    ],
    regimentalAbilities: [
      {
        name: 'Crusading Army',
        timing: 'Passive',
        effect: 'Add 1 to run rolls and charge rolls for friendly units.',
      },
      {
        name: 'Defenders of the Realm',
        timing: 'Passive',
        effect:
          'Add 1 to save rolls for friendly units that are contesting an objective you control.',
      },
    ],
    enhancements: [
      {
        name: 'Ulguan Cloak',
        timing: 'Passive',
        effect: 'Your general is not visible to enemy models that are more than 12\u201d away from them.',
      },
      {
        name: 'Blood-River Chalice',
        timing: 'Once Per Battle, Your Hero Phase',
        effect: 'Heal (2D3) your general.',
      },
      {
        name: 'Rousing Oration',
        timing: 'Your Hero Phase',
        declare:
          'Roll a dice for each friendly unit wholly within 12\u201d of your general. Do not roll for your general.',
        effect: 'For each 5+, give 1 noble deeds point to your general.',
      },
      {
        name: 'Crimson Victuals',
        timing: 'Your Hero Phase',
        declare:
          'Pick a visible enemy unit within 18\u201d of your general to be the target, then make a casting roll of 2D6.',
        effect:
          'On a 6+, inflict D3 mortal damage on the target. Then, if your Cryptguard unit is within 6\u201d of the target, you can return 1 slain model to your Cryptguard unit for each damage point allocated by this ability.',
      },
    ],
    units: [
      {
        id: 'abhorrant-archregent',
        name: 'Abhorrant Archregent',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Infantry'],
        move: '6\u201d',
        health: '6',
        save: '5+',
        ward: '6+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Gory Talons and Fangs',
            type: 'Melee',
            attacks: '5',
            hit: '3+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
        ],
        abilities: [
          {
            name: 'Deranged Transformation',
            timing: 'Your Hero Phase',
            declare:
              'Pick a visible friendly unit wholly within 18\u201d of this unit to be the target, then make a casting roll of 2D6.',
            effect:
              'On a 6+, until the start of your next turn, add 2\u201d to the target\u2019s Move characteristic and add 1 to wound rolls for its attacks.',
          },
        ],
      },
      {
        id: 'cryptguard',
        name: 'Cryptguard',
        count: '10x',
        isGeneral: false,
        keywords: ['Infantry', 'Reinforcements'],
        move: '6\u201d',
        health: '1',
        save: '6+',
        ward: '5+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Cursed Weapon',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '4+',
            rend: '1',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Royal Bodyguard',
            timing: 'Passive',
            effect:
              'Add 1 to ward rolls for friendly HEROES that are wholly within this unit\u2019s combat range.',
          },
        ],
      },
      {
        id: 'morbheg-knights',
        name: 'Morbheg Knights',
        count: '3x',
        isGeneral: false,
        keywords: ['Cavalry', 'Fly'],
        move: '12\u201d',
        health: '4',
        save: '4+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Grisly Lance',
            type: 'Melee',
            attacks: '2',
            hit: '3+',
            wound: '4+',
            rend: '1',
            damage: '1',
            ability: 'Charge (+1 Damage)',
          },
          {
            name: "Nightshrieker's Claws and Teeth",
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '2',
            ability: 'Companion',
          },
        ],
        abilities: [
          {
            name: "Predator's Pounce",
            timing: 'Passive',
            effect:
              'This unit can use CHARGE abilities even if it used a RETREAT ability in the same turn. In addition, no mortal damage is inflicted on this unit when it uses RETREAT abilities.',
          },
        ],
      },
      {
        id: 'varghulf-courtier',
        name: 'Varghulf Courtier',
        count: '1x',
        isGeneral: false,
        keywords: ['Hero', 'Infantry'],
        move: '10\u201d',
        health: '8',
        save: '5+',
        ward: '6+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Immense Claws',
            type: 'Melee',
            attacks: '7',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
          {
            name: 'Dagger-like Fangs',
            type: 'Melee',
            attacks: '1',
            hit: '3+',
            wound: '2+',
            rend: '2',
            damage: '3',
          },
        ],
        abilities: [
          {
            name: 'Victory Feast',
            timing: 'End of Any Turn',
            effect:
              'If any models were slain by this unit this turn, Heal (D6) this unit, and this unit can immediately use the \u2018Retreat\u2019 ability without any mortal damage being inflicted on it.',
          },
        ],
      },
    ],
  },
  // ---- Flesh-Eater Courts (Abhorrant Gorewarden) ----
  {
    id: 'flesh-eater-courts-gorewarden',
    name: 'Flesh-Eater Courts (Gorewarden)',
    battleTraits: [
      {
        name: 'Delusions and Madness',
        timing: 'Once Per Battle Round (Army), Start of Battle Round',
        effect:
          'You must use this ability at the start of each battle round. If it is the first battle round, pick a DELUSION. Otherwise, make a delusion roll by rolling a D6.\n\nOn a 1-3, you must pick a different DELUSION to the one you picked last time. On a 4+, you must pick the same DELUSION as last time. For the rest of the battle round, you believe the DELUSION you picked.',
      },
      {
        name: 'Of the Great Feast',
        timing: 'Once Per Turn (Army), End of Any Turn',
        declare: 'If you believe this DELUSION, pick each friendly unit on the battlefield to be the targets.',
        effect:
          'Heal (1) each target. If the target is a SERFS unit, return D3 slain models to it instead.',
        keywords: ['Delusion'],
      },
      {
        name: 'Delusion of the Knightly Host',
        timing: 'Passive',
        effect:
          'While you believe this DELUSION, if the unmodified charge roll for a friendly HERO or KNIGHTS unit is 8+, add 1 to hit rolls for that unit\u2019s combat attacks for the rest of the turn.',
        keywords: ['Delusion'],
      },
    ],
    regimentalAbilities: [
      {
        name: 'Delusion of the Sentinel',
        timing: 'Passive',
        effect:
          'While you believe this DELUSION, add 1 to ward rolls for friendly units while each model in the unit is contesting an objective.',
        keywords: ['Delusion'],
      },
      {
        name: 'Delusion of the Hunter',
        timing: 'Passive',
        effect:
          'While you believe this DELUSION, add 1 to wound rolls for combat attacks made by friendly units while no models in the unit are contesting an objective.',
        keywords: ['Delusion'],
      },
      {
        name: 'Almost Lucid',
        timing: 'Once Per Battle, Reaction: You declared the \u2018Delusions and Madness\u2019 ability',
        effect: 'You can re-roll the delusion roll.',
      },
      {
        name: 'Companion of the Hunt',
        timing: 'End of Any Turn',
        effect:
          'If your general is not in combat, they can move 3\u201d. They cannot move into combat during any part of that move.',
      },
      {
        name: 'A Worthy Challenge',
        timing: 'Once Per Battle, Any Combat Phase',
        declare:
          'Pick an enemy unit that started the battle with 3 or fewer models and is in combat with your general to be the target. Your opponent must decide whether the target will accept or refuse your general\u2019s challenge.',
        effect:
          '\u2022 If they accept, for the rest of the phase, when your general and the target are picked to use a FIGHT ability, all of their attacks must target each other.\n\u2022 If they refuse, the target has STRIKE-LAST for the rest of the phase.',
      },
      {
        name: 'Choirmaster',
        timing: 'Once Per Battle, Your Shooting Phase',
        declare: 'Pick a visible enemy unit within 6\u201d of your general to be the target.',
        effect:
          'For the rest of the turn, add 1 to the Damage characteristic of friendly units\u2019 ranged weapons for attacks that target that enemy unit.',
      },
    ],
    enhancements: [],
    units: [
      {
        id: 'abhorrant-gorewarden',
        name: 'Abhorrant Gorewarden',
        count: '1x',
        isGeneral: true,
        keywords: ['Hero', 'Wizard', 'Infantry', 'Fly'],
        move: '12\u201d',
        health: '7',
        save: '5+',
        ward: '6+',
        control: '2',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Gory Talons and Fangs',
            type: 'Melee',
            attacks: '5',
            hit: '3+',
            wound: '3+',
            rend: '1',
            damage: '2',
          },
        ],
        abilities: [
          {
            name: 'Sound the Pursuit!',
            timing: 'Your Hero Phase',
            declare:
              'Pick a friendly unit wholly within 12\u201d of this unit to be the target, then make a casting roll of 2D6.',
            effect:
              'On a 6+, until the start of your next turn, when making charge rolls for the target, add 1 to the number of dice rolled, to a maximum of 3, then remove 1 dice of your choice and use the remaining dice as the charge roll.',
          },
        ],
      },
      {
        id: 'royal-beastflayers',
        name: 'Royal Beastflayers',
        count: '10x',
        isGeneral: false,
        keywords: ['Infantry', 'Serfs'],
        move: '6\u201d',
        health: '1',
        save: '6+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Beastflayer Weapons',
            type: 'Melee',
            attacks: '3',
            hit: '4+',
            wound: '4+',
            rend: '-',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Lie of the Land',
            timing: 'Your Movement Phase',
            effect:
              'If this unit is not in combat and is wholly within 6\u201d of a battlefield edge, remove this unit from the battlefield and set it up again wholly within 6\u201d of a battlefield edge and more than 6\u201d from all enemy units.',
          },
        ],
      },
      {
        id: 'crypt-horrors',
        name: 'Crypt Horrors',
        count: '3x',
        isGeneral: false,
        keywords: ['Infantry', 'Knights', 'Reinforcements'],
        move: '7\u201d',
        health: '4',
        save: '5+',
        ward: '6+',
        control: '1',
        rangedWeapons: [],
        meleeWeapons: [
          {
            name: 'Club and Septic Talons',
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
            name: 'Holy Blades of Bone',
            timing: 'Any Combat Phase',
            declare:
              'Pick an enemy unit in combat with this unit and that charged this turn to be the target.',
            effect:
              'Roll a dice for each model in the target unit. For each 5+, inflict 1 mortal damage on the target unit.',
          },
        ],
      },
      {
        id: 'crypt-flayers',
        name: 'Crypt Flayers',
        count: '3x',
        isGeneral: false,
        keywords: ['Infantry', 'Knights', 'Fly'],
        move: '12\u201d',
        health: '4',
        save: '5+',
        ward: '6+',
        control: '1',
        rangedWeapons: [
          {
            name: 'Death Scream',
            type: 'Ranged',
            range: '10\u201d',
            attacks: '4',
            hit: '4+',
            wound: '3+',
            rend: '2',
            damage: '1',
            ability: 'Shoot in Combat',
          },
        ],
        meleeWeapons: [
          {
            name: 'Piercing Talons',
            type: 'Melee',
            attacks: '4',
            hit: '4+',
            wound: '3+',
            rend: '1',
            damage: '1',
          },
        ],
        abilities: [
          {
            name: 'Unholy Chorus',
            timing: 'Your Shooting Phase',
            declare: 'Pick a visible enemy unit within 10\u201d of this unit to be the target.',
            effect:
              'For the rest of the turn, subtract an amount from the target\u2019s control score equal to the number of damage points allocated to the target this phase by this unit\u2019s shooting attacks.',
          },
        ],
      },
    ],
  },
  // ---- Fyreslayers (Saga Axeband) ----
  {
    id: 'fyreslayers-saga-axeband',
    name: 'Fyreslayers (Saga Axeband)',
    battleTraits: [
      {
        name: 'Awaken the Runes',
        timing: 'Once Per Battle Round, Start of Your Turn',
        declare: 'Pick 1 of the ur-gold runes on the right, then make an activation roll of D6. Each urgold rune can only be activated once per battle.',
        effect: 'On a 1-5, the rune\'s standard effect applies. On a 6, the rune\'s enhanced effect applies as well. The effects last until the start of your next turn.'
      },
    ],
    regimentalAbilities: [],
    enhancements: [],
    units: [],
  },
  // ---- Ossiarch Bonereapers (Tithe-Reaper Echelon) ----
  {
    id: 'ossiarch-bonereapers-tithe-reaper-echelon',
    name: 'Ossiarch Bonereapers (Tithe-Reaper Echelon)',
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

'use strict';

import * as RND from '../random';
import * as Dice from '../dice';
import * as Text from '../format/text';

export class SWNCharacter {
  stats: Stat[];
  background: Background;
  skills: Skill[];
  focuses: Focus[];
  characterClass: CharacterClass;
  currentLevel: number;
  attackBonus: number;
  rangedAttackBonus: number;
  meleeAttackBonus: number;
  hitPoints: number;
  abilities: (BonusFocus | BonusSkillOfType | SpecialAbility | EffortAbility)[];
  effort: number;
  equipment: (Container | MiscItem)[];
  rangedWeapons: Weapon[];
  meleeWeapons: Weapon[];
  armor: Armor[];
  armorClassBase: number;
  armorClassUnequipped: number;
  armorClassEquipped: number;
  credits: number;
  savingThrowMental: number;
  savingThrowEvasion: number;
  savingThrowPhysical: number;

  constructor() {
    this.stats = randomStats();
    this.background = randomBackground();
    this.skills = [];
    this.focuses = [];
    this.characterClass = randomClass();
    this.currentLevel = 1;
    this.attackBonus = 0;
    this.rangedAttackBonus = -2;
    this.meleeAttackBonus = -2;
    this.hitPoints = 0;
    this.abilities = [];
    this.effort = 0;
    this.equipment = [];
    this.rangedWeapons = [];
    this.meleeWeapons = [];
    this.armor = [];
    this.armorClassBase = 10;
    this.armorClassUnequipped = 10;
    this.armorClassEquipped = 10;
    this.credits = 0;
    this.savingThrowMental = 0;
    this.savingThrowEvasion = 0;
    this.savingThrowPhysical = 0;
  }

  equipmentList() {
    const list: string[] = [];

    for (let i = 0; i < this.equipment.length; i++) {
      list.push(this.equipment[i].name);
    }

    return list;
  }
}

export function generate() {
  const character = new SWNCharacter();

  let dexterity = 0;
  let strength = 0;
  let wisdom = 0;
  let intelligence = 0;
  let constitution = 0;
  let charisma = 0;

  for (let i = 0; i < character.stats.length; i++) {
    if (character.stats[i].abbreviation === 'DEX') {
      dexterity = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation === 'STR') {
      strength = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation === 'CON') {
      constitution = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation === 'WIS') {
      wisdom = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation === 'INT') {
      intelligence = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation === 'CHA') {
      charisma = character.stats[i].modifier;
    }
  }

  character.savingThrowMental = 15 - Math.max(wisdom, charisma);
  character.savingThrowEvasion = 15 - Math.max(intelligence, dexterity);
  character.savingThrowPhysical = 15 - Math.max(strength, constitution);

  character.skills = randomStartingSkills(character.background);

  const equipmentPackage = getEquipmentPackage(character.background.equipmentPackage);

  for (let i = 0; i < equipmentPackage.items.length; i++) {
    equipmentPackage.items[i].addTo(character);
  }

  character.armorClassUnequipped = character.armorClassUnequipped + dexterity;
  character.armorClassEquipped = character.armorClassEquipped + dexterity;

  character.attackBonus = character.characterClass.attackBonus;
  character.hitPoints = Dice.roll(character.characterClass.hitPointRoll);

  for (let i = 0; i < character.stats.length; i++) {
    if (character.stats[i].abbreviation === 'CON') {
      character.hitPoints += character.stats[i].modifier;
    }
  }

  const firstFocus = randomNonPsychicFocus();

  character.focuses.push(firstFocus);

  for (let i = 0; i < character.characterClass.abilities.length; i++) {
    character.characterClass.abilities[i].addTo(character);
  }

  for (let i = 0; i < character.focuses.length; i++) {
    character.focuses[i].addTo(character);
  }

  const hobbySkill = new BonusSkillOfType(['non-combat', 'combat']);
  hobbySkill.addTo(character);

  for (let i = 0; i < character.skills.length; i++) {
    if (character.skills[i].name === 'Stab') {
      character.meleeAttackBonus =
        character.skills[i].level + character.attackBonus + Math.max(dexterity, strength);
    } else if (character.skills[i].name === 'Shoot') {
      character.rangedAttackBonus = character.skills[i].level + character.attackBonus + dexterity;
    }

    if (character.skills[i].name === 'Biopsionics') {
      if (character.skills[i].level === 0) {
        character.abilities.push(
          new SpecialAbility(
            'Psychic Succor-0: The psychic’s touch can automatically stabilize a mortally-wounded target as a Main Action. This power must be used on a target within six rounds of their collapse, and does not function on targets that have been decapitated or killed by Heavy weapons. It’s the GM’s decision as to whether a target is intact enough for this power to work.',
          ),
        );
      } else if (character.skills[i].level === 1) {
        character.abilities.push(
          new SpecialAbility(
            'Psychic Succor-1: The psychic’s touch can automatically stabilize a mortally-wounded target as a Main Action. This power must be used on a target within six rounds of their collapse, and does not function on targets that have been decapitated or killed by Heavy weapons. It’s the GM’s decision as to whether a target is intact enough for this power to work. Also heal 1d6+1 hit points of damage. If used on a mortally-wounded target, they revive with the rolled hit points and can act normally on the next round.',
          ),
        );

        const ability = randomPsionicAbilityOfDiscipline('Biopsionics');
        character.abilities.push(new SpecialAbility(ability.name + ': ' + ability.description));
      }
    } else if (character.skills[i].name === 'Metapsionics') {
      if (character.skills[i].level === 0) {
        character.abilities.push(
          new SpecialAbility(
            'Psychic Refinement-0: The adept can visually and audibly detect the use of psychic powers. If both the source and target are visible to the metapsion, they can tell who’s using the power, even if it’s normally imperceptible. They gain a +2 bonus on any saving throw versus a psionic power.',
          ),
        );
      } else if (character.skills[i].level === 1) {
        character.abilities.push(
          new SpecialAbility(
            'Psychic Refinement-1: The adept can visually and audibly detect the use of psychic powers. If both the source and target are visible to the metapsion, they can tell who’s using the power, even if it’s normally imperceptible. They gain a +2 bonus on any saving throw versus a psionic power. The metapsion’s maximum Effort increases by an additional point.',
          ),
        );
        character.effort++;

        const ability = randomPsionicAbilityOfDiscipline('Metapsionics');
        character.abilities.push(new SpecialAbility(ability.name + ': ' + ability.description));
      }
    } else if (character.skills[i].name === 'Precognition') {
      if (character.skills[i].level === 0) {
        character.abilities.push(
          new SpecialAbility(
            'Oracle-0: The precog gains a progressively-greater intuitive understanding of their own future. Each invocation of the Oracle technique requires a Main Action and that the user Commit Effort for the day. Once triggered, the adept gets a single brief vision related to the question about the future that they’re asking. This vision is always from their own personal vantage point and never reveals more than a minute of insight, though the psychic processes it almost instantly as part of the power’s use. Range: One minute into the future.',
          ),
        );
      } else if (character.skills[i].level === 1) {
        character.abilities.push(
          new SpecialAbility(
            'Oracle-1: The precog gains a progressively-greater intuitive understanding of their own future. Each invocation of the Oracle technique requires a Main Action and that the user Commit Effort for the day. Once triggered, the adept gets a single brief vision related to the question about the future that they’re asking. This vision is always from their own personal vantage point and never reveals more than a minute of insight, though the psychic processes it almost instantly as part of the power’s use. Range: One day into the future.',
          ),
        );

        const ability = randomPsionicAbilityOfDiscipline('Precognition');
        character.abilities.push(new SpecialAbility(ability.name + ': ' + ability.description));
      }
    } else if (character.skills[i].name === 'Telekinesis') {
      if (character.skills[i].level === 0) {
        character.abilities.push(
          new SpecialAbility(
            'Telekinetic Manipulation-0: The psychic can exert force as if with one hand and their own strength.',
          ),
        );
      } else if (character.skills[i].level === 1) {
        character.abilities.push(
          new SpecialAbility(
            'Telekinetic Manipulation-1: The psychic can manipulate objects as if with both hands and can lift up to two hundred kilograms with this ability.',
          ),
        );

        const ability = randomPsionicAbilityOfDiscipline('Telekinesis');
        character.abilities.push(new SpecialAbility(ability.name + ': ' + ability.description));
      }
    } else if (character.skills[i].name === 'Telepathy') {
      if (character.skills[i].level === 0) {
        character.abilities.push(
          new SpecialAbility(
            'Telepathic Contact-0: Observe emotional states in a target. Intense emotions provide a single word or image related to the focus of the feelings.',
          ),
        );
      } else if (character.skills[i].level === 1) {
        character.abilities.push(
          new SpecialAbility(
            'Telepathic Contact-1: A shallow gestalt with the target’s language centers allows the telepath to understand any form of communication made by the target. If the psychic has the requisite body parts to speak the target’s language, they can communicate with it in turn.',
          ),
        );

        const ability = randomPsionicAbilityOfDiscipline('Telepathy');
        character.abilities.push(new SpecialAbility(ability.name + ': ' + ability.description));
      }
    } else if (character.skills[i].name === 'Teleportation') {
      if (character.skills[i].level === 0) {
        character.abilities.push(
          new SpecialAbility('Personal Apportation-0: The psychic can teleport up to 10 meters.'),
        );
      } else if (character.skills[i].level === 1) {
        character.abilities.push(
          new SpecialAbility('Personal Apportation-1: The psychic can teleport up to 100 meters.'),
        );

        const ability = randomPsionicAbilityOfDiscipline('Teleportation');
        character.abilities.push(new SpecialAbility(ability.name + ': ' + ability.description));
      }
    }
  }

  return character;
}

export class BonusSkill {
  skillName: string;
  description: string;

  constructor(skillName: string) {
    this.skillName = skillName;
    this.description = 'Bonus skill: ' + skillName;
  }

  addTo(character: SWNCharacter) {
    let skillAddressed = false;
    for (let j = 0; j < character.skills.length; j++) {
      if (character.skills[j].name === this.skillName) {
        character.skills[j].level++;
        skillAddressed = true;
      }
    }
    if (!skillAddressed) {
      const newSkill = getSkillByName(this.skillName);
      character.skills.push(newSkill);
    }
  }
}

export class BonusSkillFromList {
  skills: string[];
  description: string;

  constructor(skills: string[]) {
    this.skills = skills;
    this.description = 'a bonus skill from the list: ' + skills.join(',');
  }

  addTo(character: SWNCharacter) {
    let skillAddressed = false;
    const newSkillName = RND.item(this.skills);

    for (let j = 0; j < character.skills.length; j++) {
      if (character.skills[j].name === newSkillName) {
        character.skills[j].level++;
        skillAddressed = true;
      }
    }

    if (!skillAddressed) {
      character.skills.push(getSkillByName(newSkillName));
    }
  }
}

export class BonusSkillOfType {
  skillTypes: string[];
  description: string;

  constructor(skillTypes: string[]) {
    this.skillTypes = skillTypes;
    this.description = 'Bonus skill of types: ' + skillTypes.join(',');
  }

  addTo(character: SWNCharacter) {
    let skillAddressed = false;
    const skillType = RND.item(this.skillTypes);
    const newSkill = randomSkillOfType(skillType);

    for (let j = 0; j < character.skills.length; j++) {
      if (character.skills[j].name === newSkill.name) {
        character.skills[j].level++;
        skillAddressed = true;
      }
    }

    if (!skillAddressed) {
      character.skills.push(newSkill);
    }
  }
}

export class BonusHP {
  amount: number;
  description: string;

  constructor(amount: number) {
    this.amount = amount;
    this.description = `Bonus HP: ${this.amount}`;
  }

  addTo(character: SWNCharacter) {
    character.hitPoints += this.amount;
  }
}

export class InnateAC {
  ac: number;
  description: string;

  constructor(ac: number) {
    this.ac = ac;
    this.description = `Innate AC: ${this.ac}`;
  }

  addTo(character: SWNCharacter) {
    if (character.armorClassBase < this.ac) {
      character.armorClassBase = this.ac;
    }
  }
}

export class Focus {
  name: string;
  focusType: string;
  currentLevel: number;
  levelOneDescription: string;
  levelOneEffect: BonusSkill | BonusSkillFromList | BonusSkillOfType | BonusHP | InnateAC;
  levelTwoDescription: string;

  constructor(
    name: string,
    focusType: string,
    levelOneDescription: string,
    levelOneEffect: BonusSkill | BonusSkillFromList | BonusSkillOfType | BonusHP | InnateAC,
    levelTwoDescription: string,
  ) {
    this.name = name;
    this.focusType = focusType;
    this.currentLevel = 1;
    this.levelOneDescription = levelOneDescription;
    this.levelOneEffect = levelOneEffect;
    this.levelTwoDescription = levelTwoDescription;
  }

  addTo(character: SWNCharacter) {
    const levelOneAbility = new SpecialAbility(
      `From Focus ${this.name}: ${this.levelOneEffect.description}`,
    );
    character.abilities.push(levelOneAbility);
    this.levelOneEffect.addTo(character);
  }
}

function allFocuses() {
  return [
    new Focus(
      'Alert',
      'non-combat',
      'Gain Notice as a bonus skill. You cannot be surprised, nor can others use the Execution Attack option on you. When you roll initiative, roll twice and take the best result.',
      new BonusSkill('Notice'),
      'You always act first in a combat round unless someone else involved is also this Alert.',
    ),
    new Focus(
      'Armsman',
      'combat',
      'Gain Stab as a bonus skill. You can draw or sheath a Stowed melee or thrown weapon as an Instant action. You may add your Stab skill level to a melee or thrown weapon’s damage roll or Shock damage, assuming it has any to begin with.',
      new BonusSkill('Stab'),
      'Your primitive melee and thrown weapons count as TL4 weapons for the purpose of overcoming advanced armors. Even on a miss with a melee weapon, you do an unmodified 1d4 damage to the target, plus any Shock damage. This bonus damage doesn’t apply to thrown weapons or attacks that use the Punch skill.',
    ),
    new Focus(
      'Assassin',
      'combat',
      'You can conceal an object no larger than a knife or pistol from anything less invasive than a strip search, including normal TL4 weapon detection devices. You can draw or produce this object as an On Turn action, and your point-blank ranged attacks made from surprise with it cannot miss the target.',
      new BonusSkill('Sneak'),
      'You can take a Move action on the same round as you make an Execution Attack, closing rapidly with a target before you attack. You may split this Move action when making an Execution Attack, taking part of it before you murder your target and part of it afterwards. This movement happens too quickly to alert a victim or to be hindered by bodyguards, barring an actual physical wall of meat between you and your prey.',
    ),
    new Focus(
      'Authority',
      'non-combat',
      'Once per day, you can make a request from an NPC who is not openly hostile to you, rolling a Cha/Lead skill check at a difficulty of the NPC’s Morale score. If you succeed, they will comply with the request, provided it is not harmful or extremely uncharacteristic.',
      new BonusSkill('Lead'),
      'Those who follow you are fired with confidence. Any NPC being directly led by you gains a Morale and hit roll bonus equal to your Lead skill and a +1 bonus on all skill checks. Your followers will not act against your interests unless under extreme pressure.',
    ),
    new Focus(
      'Close Combatant',
      'combat',
      'You can use pistol-sized ranged weapons in melee without suffering penalties for the proximity of melee attackers. You ignore Shock damage from melee assailants, even if you’re unarmored at the time.',
      new BonusSkillOfType(['combat']),
      'The Shock damage from your melee attacks treats all targets as if they were AC 10. The Fighting Withdrawal combat action is treated as an On Turn action for you and can be performed freely.',
    ),
    new Focus(
      'Connected',
      'non-combat',
      'If you’ve spent at least a week in a not-entirely-hostile location, you’ll have built a web of contacts willing to do favors for you that are no more than mildly illegal. You can call on one favor per game day and the GM decides how far they’ll go for you.',
      new BonusSkill('Connect'),
      'Once per game session, if it’s not entirely implausible, you meet someone you know who is willing to do modest favors for you. You can decide when and where you want to meet this person, but the GM decides who they are and what they can do for you.',
    ),
    new Focus(
      'Die Hard',
      'combat',
      'You gain an extra 2 maximum hit points per level. This bonus applies retroactively if you take this focus after first level. You automatically stabilize if mortally wounded by anything smaller than a Heavy weapon.',
      new BonusHP(2),
      'The first time each day that you are reduced to zero hit points by an injury, you instead survive with one hit point remaining. This ability can’t save you from Heavy weapons or similar trauma.',
    ),
    new Focus(
      'Diplomat',
      'non-combat',
      'You speak all the languages common to the sector and can learn new ones to a workable level in a week, becoming fluent in a month. Reroll 1s on any skill check dice related to negotiation or diplomacy.',
      new BonusSkill('Talk'),
      'Once per game session, shift an intelligent NPC’s reaction roll one step closer to friendly if you can talk to them for at least thirty seconds.',
    ),
    new Focus(
      'Gunslinger',
      'combat',
      'You can draw or holster a Stowed ranged weapon as an On Turn action. You may add your Shoot skill level to a ranged weapon’s damage roll.',
      new BonusSkill('Shoot'),
      'Once per round, you can reload a ranged weapon as an On Turn action if it takes no more than one round to reload. Even on a miss with a Shoot attack, you do an unmodified 1d4 damage.',
    ),
    new Focus(
      'Hacker',
      'non-combat',
      'When attempting to hack a database or computerized system, roll 3d6 on the skill check and drop the lowest die.',
      new BonusSkill('Program'),
      'Your hack duration increases to 1d4+Program skill x 10 minutes. You have an instinctive understanding of the tech; you never need to learn the data protocols for a strange system and are always treated as familiar with it.',
    ),
    new Focus(
      'Healer',
      'non-combat',
      'You may attempt to stabilize one mortally-wounded adjacent person per round as an On Turn action. When rolling Heal skill checks, roll 3d6 and drop the lowest die.',
      new BonusSkill('Heal'),
      'Stims or other technological healing devices applied by you heal twice as many hit points as normal. Using only basic medical supplies, you can heal 1d6+Heal skill hit points of damage to every injured or wounded person in your group with ten minutes of first aid spread among them. Such healing can be applied to a given target only once per day.',
    ),
    new Focus(
      'Henchkeeper',
      'non-combat',
      'You can acquire henchmen within 24 hours of arriving in a community, assuming anyone is suitable hench material. These henchmen will not fight except to save their own lives, but will escort you on adventures and risk great danger to help you. Most henchmen will be treated as Peaceful Humans from the Xenobestiary section of the book. You can have one henchmen at a time for every three character levels you have, rounded up. You can release henchmen with no hard feelings at any plausible time and pick them back up later should you be without a current henchman.',
      new BonusSkill('Lead'),
      'Your henchmen are remarkably loyal and determined, and will fight for you against anything but clearly overwhelming odds. Whether through natural competence or their devotion to you, they’re treated as Martial Humans from the Xenobestiary section. You can make faithful henchmen out of skilled and highly-capable NPCs, but this requires that you actually have done them some favor or help that would reasonably earn such fierce loyalty.',
    ),
    new Focus(
      'Ironhide',
      'combat',
      'You have an innate Armor Class of 15 plus half your character level, rounded up.',
      new InnateAC(15),
      'Your abilities are so effective that they render you immune to unarmed attacks or primitive weaponry as if you wore powered armor.',
    ),
    new Focus(
      'Psychic Training',
      'psychic',
      'Gain any psychic skill as a bonus. If this improves it to level-1 proficiency, choose a free level-1 technique from that discipline. Your maximum Effort increases by one.',
      new BonusSkillOfType(['psychic']),
      'When you advance a level, the bonus psychic skill you chose for the first level of the focus automatically gets one skill point put toward increasing it or purchasing a technique from it. You may save these points for later, if more are required to raise the skill or buy a particular technique. These points are awarded retroactively if you take this focus level later in the game.',
    ),
    new Focus(
      'Savage Fray',
      'combat',
      'All enemies adjacent to you at the end of your turn whom you have not attacked suffer the Shock damage of your weapon if their Armor Class is not too high to be affected.',
      new BonusSkill('Stab'),
      'After suffering your first melee hit in a round, any further melee attacks from other assailants automatically miss you. If the attacker who hits you has multiple attacks, they may attempt all of them, but other foes around you simply miss.',
    ),
    new Focus(
      'Shocking Assault',
      'combat',
      'The Shock damage of your weapon treats all targets as if they were AC 10, assuming your weapon is capable of harming the target in the first place.',
      new BonusSkillFromList(['Punch', 'Stab']),
      'In addition, you gain a +2 bonus to the Shock damage rating of all melee weapons and unarmed attacks. Regular hits never do less damage than this Shock would do on a miss.',
    ),
    new Focus(
      'Sniper',
      'combat',
      'When making a skill check for an Execution Attack or target shooting, roll 3d6 and drop the lowest die.',
      new BonusSkill('Shoot'),
      'A target hit by your Execution Attack takes a -4 penalty on the Physical saving throw to avoid immediate mortal injury. Even if the save is successful, the target takes double the normal damage inflicted by the attack.',
    ),
    new Focus(
      'Specialist',
      'non-combat',
      'Roll 3d6 and drop the lowest die for all skill checks in this skill.',
      new BonusSkillOfType(['non-combat']),
      'Roll 4d6 and drop the two lowest dice for all skill checks in this skill.',
    ),
    new Focus(
      'Star Captain',
      'non-combat',
      'Your ship gains 2 extra Command Points at the start of each turn.',
      new BonusSkill('Lead'),
      'A ship you captain gains bonus hit points equal to 20% of its maximum at the start of each combat. Damage is taken from these bonus points first, and they vanish at the end of the fight and do not require repairs to replenish before the next. In addition, once per engagement, you may resolve a Crisis as an Instant action by explaining how your leadership resolves the problem.',
    ),
    new Focus(
      'Starfarer',
      'non-combat',
      'You automatically succeed at all spike drill-related skill checks of difficulty 10 or less.',
      new BonusSkill('Pilot'),
      'Double your Pilot skill for all spike drill-related skill checks. Spike drives of ships you navigate are treated as one level higher; thus, a drive-1 is treated as a drive-2, up to a maximum of drive-7. Spike drills you personally oversee take only half the time they would otherwise require.',
    ),
    new Focus(
      'Tinker',
      'non-combat',
      'Your Maintenance score is doubled, allowing you to maintain twice as many mods. Both ship and gear mods cost only half their usual price in credits, though pretech salvage requirements remain the same.',
      new BonusSkill('Fix'),
      'Your Fix skill is treated as one level higher for purposes of building and maintaining mods and calculating your Maintenance score. Advanced mods require one fewer pretech salvage part to make, down to a minimum of zero.',
    ),
    new Focus(
      'Unarmed Combatant',
      'combat',
      'Your unarmed attacks become more dangerous as your Punch skill increases. At level-0, they do 1d6 damage. At level-1, they do 1d8 damage. At level-2 they do 1d10, level-3 does 1d12, and level-4 does 1d12+1. At Punch-1 or better, they have the Shock quality equal to your Punch skill against AC 15 or less. While you normally add your Punch skill level to any unarmed damage, don’t add it twice to this Shock damage.',
      new BonusSkill('Punch'),
      'You know locks and twists that use powered servos against their wearer. Your unarmed attacks count as TL4 weapons for the purpose of overcoming advanced armors. Even on a miss with a Punch attack, you do an unmodified 1d6 damage.',
    ),
    new Focus(
      'Wanderer',
      'non-combat',
      'You can convey basic ideas in all the common languages of the sector. You can always find free transport to a desired destination for yourself and a small group of your friends provided any traffic goes to the place. Finding this transport takes no more than an hour, but it may not be a strictly legitimate means of travel and may require working passage.',
      new BonusSkill('Survive'),
      'You can forge, scrounge, or snag travel papers and identification for the party with 1d6 hours of work. These papers and permits will stand up to ordinary scrutiny, but require an opposed Int/Administer versus Wis/Notice check if examined by an official while the PC is actually wanted by the state for some crime. When finding transport for the party, the transportation always makes the trip at least as fast as a dedicated charter would.',
    ),
    new Focus(
      'Wild Psychic Talent',
      'non-combat',
      'You gain an ability equivalent to the level-0 core power of that discipline. Optionally, you may instead pick a level-1 technique from that discipline, but that technique must stand alone; you can’t pick one that augments another technique or core ability. For example, you could pick the Telekinetic Armory technique from Telekinesis, because that ability does not require the use of any other Telekinesis power. You could not pick the Mastered Succor ability from Biopsionics, because that technique is meant to augment another power you don’t have.',
      new BonusSkillOfType(['psychic']),
      'You now have a maximum Effort of two points. You may pick a second ability according to the guidelines above. This second does not need to be a stand-alone technique if it augments the power you chose for level 1 of this focus. Thus, if your first pick was gaining the level-0 power of Psychic Succor, your second could be Mastered Succor. You still could not get the level-1 core power of Psychic Succor, however, as you’re still restricted to level-0.',
    ),
  ];
}

function randomBackground() {
  const backgrounds = allBackgrounds();

  return RND.item(backgrounds);
}

export class CharacterClass {
  name: string;
  attackBonus: number;
  hitPointRoll: string;
  abilities: (BonusFocus | BonusSkillOfType | SpecialAbility | EffortAbility)[];

  constructor(
    name: string,
    attackBonus: number,
    hitPointRoll: string,
    abilities: (BonusFocus | BonusSkillOfType | SpecialAbility | EffortAbility)[],
  ) {
    this.name = name;
    this.attackBonus = attackBonus;
    this.hitPointRoll = hitPointRoll;
    this.abilities = abilities;
  }
}

export class BonusFocus {
  focusTypes: string[];
  description: string;

  constructor(focusTypes: string[]) {
    this.focusTypes = focusTypes;
    this.description = 'a bonus focus of the type(s): ' + focusTypes.join(',');
  }

  addTo(character: SWNCharacter) {
    const newFocusType = RND.item(this.focusTypes);
    const newFocus = randomFocusOfType(newFocusType);
    if (character.focuses[0].name === newFocus.name) {
      character.focuses[0].currentLevel = 2;
    } else {
      newFocus.currentLevel = 1;
      character.focuses.push(newFocus);
    }
  }
}

export class SpecialAbility {
  description: string;

  constructor(description: string) {
    this.description = description;
  }

  addTo(character: SWNCharacter) {
    character.abilities.push(this);
  }
}

export class EffortAbility {
  description: string;

  constructor() {
    this.description = 'adds the Effort stat';
  }

  addTo(character: SWNCharacter) {
    character.effort = 1;
    let maxStat = -2;
    for (let i = 0; i < character.stats.length; i++) {
      if (character.stats[i].abbreviation === 'CON' || character.stats[i].abbreviation === 'WIS') {
        if (character.stats[i].modifier > maxStat) {
          maxStat = character.stats[i].modifier;
        }
      }
    }
    character.effort += maxStat;
  }
}

function allClasses() {
  return [
    new CharacterClass('Expert', 0, '1d6', [
      new BonusFocus(['non-combat']),
      new SpecialAbility(
        'Once per scene, you can reroll a failed skill check, taking the new roll if it’s better.',
      ),
      new SpecialAbility(
        'When you advance an experience level, you gain a bonus skill point that can be spent on any non-combat, non-psychic skill. You can save this point to spend later if you wish.',
      ),
    ]),
    new CharacterClass('Psychic', 0, '1d6', [
      new BonusSkillOfType(['psychic']),
      new BonusSkillOfType(['psychic']),
      new EffortAbility(),
    ]),
    new CharacterClass('Warrior', 1, '1d6+2', [
      new BonusFocus(['combat']),
      new SpecialAbility(
        'Warriors are lucky in combat. Once per scene, as an Instant ability, you can either choose to negate a successful attack roll against you or turn a missed attack roll you made into a successful hit. You can use this ability after the dice are rolled, but it cannot be used against environmental damage, effects without an attack roll, or hits on a vehicle you’re occupying.',
      ),
      new SpecialAbility('You gain two extra maximum hit points at each character level.'),
    ]),
    new CharacterClass('Adventurer (Expert/Psychic)', 0, '1d6', [
      new BonusFocus(['non-combat']),
      new SpecialAbility(
        'Gain an extra skill point every time you gain a character level which can be spent on any non-psychic, non-combat skill.',
      ),
      new BonusSkillOfType(['psychic']),
      new EffortAbility(),
    ]),
    new CharacterClass('Adventurer (Warrior/Psychic)', 1, '1d6+2', [
      new BonusFocus(['combat']),
      new SpecialAbility('You gain two extra maximum hit points at each character level.'),
      new BonusSkillOfType(['psychic']),
      new EffortAbility(),
    ]),
    new CharacterClass('Adventurer (Warrior/Expert)', 1, '1d6+2', [
      new BonusFocus(['combat']),
      new SpecialAbility('You gain two extra maximum hit points at each character level.'),
      new BonusFocus(['non-combat']),
      new SpecialAbility(
        'Gain an extra skill point every time you gain a character level which can be spent on any non-psychic, non-combat skill.',
      ),
    ]),
  ];
}

function randomClass() {
  const classes = allClasses();

  return RND.item(classes);
}

function randomFocusOfType(focusType: string) {
  const all = allFocuses();

  const focuses = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].focusType === focusType) {
      focuses.push(all[i]);
    }
  }

  return RND.item(focuses);
}

function randomNonPsychicFocus() {
  const all = allFocuses();

  const focuses = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].focusType != 'psychic') {
      focuses.push(all[i]);
    }
  }

  return RND.item(focuses);
}

function randomStartingSkills(background: Background) {
  const skills = [];

  const startingSkills = background.quickSkills;

  for (let i = 0; i < startingSkills.length; i++) {
    let skill = new Skill('', 'non-combat');

    if (startingSkills[i] === 'Any Combat') {
      skill = randomCombatSkill();
    } else if (startingSkills[i] === 'Shoot or Trade') {
      skill = RND.item([new Skill('Shoot', 'combat'), new Skill('Trade', 'non-combat')]);
    } else {
      skill.name = startingSkills[i];
    }

    skills.push(skill);
  }

  return skills;
}

export class Stat {
  name: string;
  abbreviation: string;
  score: number;
  modifier: number;

  constructor(name: string, abbreviation: string, score: number, modifier: number) {
    this.name = name;
    this.abbreviation = abbreviation;
    this.score = score;
    this.modifier = modifier;
  }
}

function randomStats() {
  const stats = [
    new Stat('strength', 'STR', 0, 0),
    new Stat('dexterity', 'DEX', 0, 0),
    new Stat('constitution', 'CON', 0, 0),
    new Stat('intelligence', 'INT', 0, 0),
    new Stat('wisdom', 'WIS', 0, 0),
    new Stat('charisma', 'CHA', 0, 0),
  ];

  for (let i = 0; i < stats.length; i++) {
    stats[i].score = Dice.roll('3d6');
  }

  let lowest = 100;
  let lowestName = '';

  for (let i = 0; i < stats.length; i++) {
    if (stats[i].score < lowest) {
      lowest = stats[i].score;
      lowestName = stats[i].name;
    }
  }

  for (let i = 0; i < stats.length; i++) {
    if (stats[i].name === lowestName) {
      stats[i].score = 14;
    }
  }

  for (let i = 0; i < stats.length; i++) {
    if (stats[i].score < 4) {
      stats[i].modifier = -2;
    } else if (stats[i].score < 8) {
      stats[i].modifier = -1;
    } else if (stats[i].score < 14) {
      stats[i].modifier = 0;
    } else if (stats[i].score < 18) {
      stats[i].modifier = 1;
    } else {
      stats[i].modifier = 2;
    }
  }

  return stats;
}

export class Background {
  name: string;
  equipmentPackage: string;
  freeSkill: string;
  quickSkills: string[];
  learningSkills: string[];

  constructor(
    name: string,
    equipmentPackage: string,
    freeSkill: string,
    quickSkills: string[],
    learningSkills: string[],
  ) {
    this.name = name;
    this.equipmentPackage = equipmentPackage;
    this.freeSkill = freeSkill;
    this.quickSkills = quickSkills;
    this.learningSkills = learningSkills;
  }
}

function allBackgrounds() {
  return [
    new Background(
      'Barbarian',
      'Barbarian',
      'Survive',
      ['Survive', 'Notice', 'Any Combat'],
      ['Any Combat', 'Connect', 'Exert', 'Lead', 'Notice', 'Punch', 'Sneak', 'Survive'],
    ),
    new Background(
      'Clergy',
      'Civilian',
      'Talk',
      ['Talk', 'Perform', 'Know'],
      ['Administer', 'Connect', 'Know', 'Lead', 'Notice', 'Perform', 'Talk', 'Talk'],
    ),
    new Background(
      'Courtesan',
      'Civilian',
      'Perform',
      ['Perform', 'Notice', 'Connect'],
      ['Any Combat', 'Connect', 'Exert', 'Notice', 'Perform', 'Survive', 'Talk', 'Trade'],
    ),
    new Background(
      'Criminal',
      'Thief',
      'Sneak',
      ['Sneak', 'Connect', 'Talk'],
      ['Administer', 'Any Combat', 'Connect', 'Notice', 'Program', 'Sneak', 'Talk', 'Trade'],
    ),
    new Background(
      'Dilettante',
      'Civilian',
      'Connect',
      ['Connect', 'Know', 'Talk'],
      ['Any Skill', 'Any Skill', 'Connect', 'Know', 'Perform', 'Pilot', 'Talk', 'Trade'],
    ),
    new Background(
      'Entertainer',
      'Civilian',
      'Perform',
      ['Perform', 'Talk', 'Connect'],
      ['Any Combat', 'Connect', 'Exert', 'Notice', 'Perform', 'Perform', 'Sneak', 'Talk'],
    ),
    new Background(
      'Merchant',
      'Civilian',
      'Trade',
      ['Trade', 'Talk', 'Connect'],
      ['Administer', 'Any Combat', 'Connect', 'Fix', 'Know', 'Notice', 'Trade', 'Talk'],
    ),
    new Background(
      'Noble',
      'Civilian',
      'Lead',
      ['Lead', 'Connect', 'Administer'],
      ['Administer', 'Any Combat', 'Connect', 'Know', 'Lead', 'Notice', 'Pilot', 'Talk'],
    ),
    new Background(
      'Official',
      'Civilian',
      'Administer',
      ['Administer', 'Talk', 'Connect'],
      ['Administer', 'Any Skill', 'Connect', 'Know', 'Lead', 'Notice', 'Talk', 'Trade'],
    ),
    new Background(
      'Peasant',
      'Civilian',
      'Exert',
      ['Exert', 'Sneak', 'Survive'],
      ['Connect', 'Exert', 'Fix', 'Notice', 'Sneak', 'Survive', 'Trade', 'Work'],
    ),
    new Background(
      'Physician',
      'Medic',
      'Heal',
      ['Heal', 'Know', 'Notice'],
      ['Administer', 'Connect', 'Fix', 'Heal', 'Know', 'Notice', 'Talk', 'Trade'],
    ),
    new Background(
      'Pilot',
      'Scout',
      'Pilot',
      ['Pilot', 'Fix', 'Shoot or Trade'],
      ['Connect', 'Exert', 'Fix', 'Notice', 'Pilot', 'Pilot', 'Shoot', 'Trade'],
    ),
    new Background(
      'Politician',
      'Civilian',
      'Talk',
      ['Talk', 'Lead', 'Connect'],
      ['Administer', 'Connect', 'Connect', 'Lead', 'Notice', 'Perform', 'Talk', 'Talk'],
    ),
    new Background(
      'Scholar',
      'Technician',
      'Know',
      ['Know', 'Connect', 'Administer'],
      ['Administer', 'Connect', 'Fix', 'Know', 'Notice', 'Perform', 'Program', 'Talk'],
    ),
    new Background(
      'Soldier',
      'Soldier',
      'Any Combat',
      ['Any Combat', 'Exert', 'Survive'],
      ['Administer', 'Any Combat', 'Exert', 'Fix', 'Lead', 'Notice', 'Sneak', 'Survive'],
    ),
    new Background(
      'Spacer',
      'Gunslinger',
      'Fix',
      ['Fix', 'Pilot', 'Program'],
      ['Administer', 'Connect', 'Exert', 'Fix', 'Know', 'Pilot', 'Program', 'Talk'],
    ),
    new Background(
      'Technician',
      'Technician',
      'Fix',
      ['Fix', 'Exert', 'Notice'],
      ['Administer', 'Connect', 'Exert', 'Fix', 'Fix', 'Know', 'Notice', 'Pilot'],
    ),
    new Background(
      'Thug',
      'Blade',
      'Any Combat',
      ['Any Combat', 'Talk', 'Connect'],
      ['Any Combat', 'Connect', 'Exert', 'Notice', 'Sneak', 'Stab or Shoot', 'Survive', 'Talk'],
    ),
    new Background(
      'Vagabond',
      'Civilian',
      'Survive',
      ['Survive', 'Sneak', 'Notice'],
      ['Any Combat', 'Connect', 'Notice', 'Perform', 'Pilot', 'Sneak', 'Survive', 'Work'],
    ),
    new Background(
      'Worker',
      'Technician',
      'Work',
      ['Work', 'Connect', 'Exert'],
      ['Administer', 'Any Skill', 'Connect', 'Exert', 'Fix', 'Pilot', 'Program', 'Work'],
    ),
  ];
}

function randomSkillOfType(skillType: string) {
  const all = allSkills();

  const skills = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].skillType === skillType) {
      skills.push(all[i]);
    }
  }

  const newSkill = RND.item(skills);

  return newSkill;
}

function randomPsionicAbilityOfDiscipline(discipline: string) {
  const all = allPsionicAbilities();

  const abilities = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].discipline === discipline) {
      abilities.push(all[i]);
    }
  }

  return RND.item(abilities);
}

export class PsionicAbility {
  name: string;
  description: string;
  level: number;
  discipline: string;

  constructor(name: string, description: string, level: number, discipline: string) {
    this.name = name;
    this.description = description;
    this.level = level;
    this.discipline = discipline;
  }
}

function allPsionicAbilities() {
  return [
    new PsionicAbility(
      'Mastered Succor',
      'The biopsion has developed a sophisticated mastery of their core ability, and they no longer need to Commit Effort to activate it, and may use it whenever they wish. The use of additional techniques that augment Psychic Succor might still require Effort to be Committed.',
      1,
      'Biopsionics',
    ),
    new PsionicAbility(
      'Organic Purification Protocols',
      'The biopsion’s Psychic Succor now cures any poisons or diseases the subject may be suffering, albeit it requires Committing Effort for the day as an additional surcharge. Biowarfare organisms, exceptionally virulent diseases, or TL5 toxins may resist this curing, requiring a Wis/Biopsionics skill check at a difficulty of at least 10. Failure means that the adept cannot cure the target’s disease. This technique cannot cure congenital illnesses.',
      1,
      'Biopsionics',
    ),
    new PsionicAbility(
      'Remote Repair',
      'Psychic Succor and other biopsionic techniques that normally require touch contact can now be applied at a distance up to 100 meters, provided the biopsion can see the target with their unaided vision. Hostile powers that normally require a hit roll will hit automatically. Each time this technique is used, Effort must be Committed for the scene.',
      1,
      'Biopsionics',
    ),
    new PsionicAbility(
      'Cloak Powers',
      'The metapsion can conceal their own psychic abilities from metapsionic senses. They must Commit Effort for as long as they wish to cloak their powers. While hidden, only a metapsion with equal or higher skill in Metapsionics can detect their abilities with their level-0 or level-2 Psychic Refinement abilities. In such cases, an opposed Wis/Metapsionics roll is made between the metapsion and the investigator. If the investigator wins, the cloak is pierced, while if the metapsion wins, the investigator’s Psychic Refinement remains oblivious.',
      1,
      'Metapsionics',
    ),
    new PsionicAbility(
      'Mindtracing',
      'The metapsion can trace back the use of psionic powers they’ve noticed in their presence. By Committing Effort for the scene as an Instant action, they can see and hear through the senses of a user of a psychic power, gaining an intuitive awareness of their location and treating them as a visible target for purposes of their own abilities. Thus, if they see someone being affected by a telepathy power with no visible source, they can use this ability to briefly share the hidden telepath’s senses. If used on a target that is teleporting, they can perceive the teleporter’s view of their destination. Use on a metamorphically-shaped impostor would reveal the biopsion responsible for the change, and so forth. These shared senses last for only one round and do not interfere with the adept’s other actions.',
      1,
      'Metapsionics',
    ),
    new PsionicAbility(
      'Synthetic Adaptation',
      'This is a particularly esoteric technique, one that requires the adept to have at least Program-0 or Fix-0 skill in order to master. With it, however, the metapsion has learned how to synergize with the quantum intelligence of a VI or True AI in order to apply Telepathy or Biopsion powers to their inanimate corpus. Only intelligent machines can be affected, as the technique requires a sentient mind to catalyze the effect. This synergy takes much of its force from the adept. Any System Strain the powers might inflict must be paid by the adept rather than the target.',
      1,
      'Metapsionics',
    ),
    new PsionicAbility(
      'Intuitive Response',
      'As an Instant action, the precog can Commit Effort for the scene just before they roll initiative. Their initiative score is treated as one better than anyone else’s involved in the scene. If another participant has this power or some other ability that grants automatic initiative success, roll initiative normally to determine which of them goes first, and then the rest of the combatants act. This ability cannot be used if the precog has been surprised.',
      1,
      'Precognition',
    ),
    new PsionicAbility(
      'Sense the Need',
      'At some point in the recent past, the psychic had a vague but intense premonition that a particular object would be needed. By triggering this power as an Instant action and Committing Effort for the day, the psychic can retroactively declare that they brought along any one object that they could have reasonably acquired and carried to this point. This object must be plausible given recent events; if the psychic has just been stripsearched, very few objects could reasonably have been kept, while a psychic who’s just passed through a weapons check couldn’t still have a loaded laser pistol.',
      1,
      'Precognition',
    ),
    new PsionicAbility(
      'Terminal Reflection',
      'The psychic’s Oracle power automatically triggers as an Instant action moments before some unexpected danger or ambush, giving the precog a brief vision of the impending hazard. This warning comes just in time to avoid springing a trap or to negate combat surprise for the precog and their companions. If the psychic does not immediately Commit Effort for the day, this sense goes numb and this technique cannot be used for the rest of the day.',
      1,
      'Precognition',
    ),
    new PsionicAbility(
      'Kinetic Transversal',
      'The adept may Commit Effort as an On Turn action to move freely over vertical or overhanging surfaces as if they were flat ground, crossing any solid surface strong enough to bear five kilos of weight. They can also move over liquids at their full movement rate. This move- ment ability lasts as long as the Effort is committed.',
      1,
      'Telekinesis',
    ),
    new PsionicAbility(
      'Pressure Field',
      'As an Instant action, the adept can manifest a protective force skin around their person equivalent to a vacc suit, maintaining pressure and temperature even in hard vacuum conditions. They can ignore temperatures at a range of plus or minus 100 degrees Celsius and automatically pressurize thin atmospheres for breathability, or filter particulates or airborne toxins. By Committing Effort for the scene, they can shield up to six comrades. This lasts until the user reclaims the Effort.',
      1,
      'Telekinesis',
    ),
    new PsionicAbility(
      'Telekinetic Armory',
      'The adept may Commit Effort as an On Turn action to create both weapons and armor out of telekinetic force. These weapons are treated as tech level 4 and act as a rifle or any advanced melee weapon. Attack rolls can use either Dexterity, Wisdom, or Constitution modifiers, and may use the Telekinesis skill as the combat skill. Armor may be created as part of this power, granting the psychic a base Armor Class equal to 15 plus their Telekinesis skill level. This armor does not stack with conventional armor, but Dexterity or shields modify it as usual. The gear continues to exist as long as the psychic chooses to leave the Effort committed, and they may be invisible or visible at the psychic’s discretion.',
      1,
      'Telekinesis',
    ),
    new PsionicAbility(
      'Facile Mind',
      'The telepath is practiced at opening a Telepathic Contact, and need only Commit Effort for the scene to do so, instead of Committing Effort for the day. If contacting an ally who has practiced the process with the psychic for at least a week, opening the contact normally requires no Effort at all. In both cases, if the telepath chooses to Commit Effort for the day, they can open a Telepathic Contact as an Instant action rather than a Main Action.',
      1,
      'Telepathy',
    ),
    new PsionicAbility(
      'Transmit Thought',
      'The telepath can send thoughts and images over a Telepathic Contact, allowing two-way communication with a willing target as an Instant action when desired.',
      1,
      'Telepathy',
    ),
    new PsionicAbility(
      'Proficient Apportation',
      'Personal Apportation now counts as a Move action, though it still can be performed only once per round. Apportations of 10 meters or less no longer require Effort to be Committed, though any augments to the technique must still be paid for normally.',
      1,
      'Teleportation',
    ),
    new PsionicAbility(
      'Spatial Awareness',
      'The psychic may Commit Effort as an On Turn ac- tion to gain an intuitive 360-degree awareness of their physical surroundings. The sense is roughly equivalent to sight out to 100 meters, though it cannot read text or distinguish colors. It is blocked by solid objects but is unimpeded by darkness, mist, blinding light, holograms, or optical illusions. The sense lasts as long as the Effort remains Committed to the technique.',
      1,
      'Teleportation',
    ),
  ];
}

function getEquipmentPackage(name: string) {
  const all = allEquipmentPackages();

  for (let i = 0; i < all.length; i++) {
    if (all[i].name === name) {
      return all[i];
    }
  }

  return all[0];
}

export class EquipmentPackage {
  name: string;
  items: (MiscItem | Weapon | Armor | Container | CreditChip)[];

  constructor(name: string, items: (MiscItem | Weapon | Armor | Container | CreditChip)[]) {
    this.name = name;
    this.items = items;
  }
}

export class MiscItem {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  addTo(character: SWNCharacter) {
    character.equipment.push(this);
  }
}

export class Weapon {
  name: string;
  range: string;
  damage: string;

  constructor(name: string, range: string, damage: string) {
    this.name = name;
    this.range = range;
    this.damage = damage;
  }

  addTo(character: SWNCharacter) {
    if (this.range === 'melee') {
      character.meleeWeapons.push(this);
    } else {
      character.rangedWeapons.push(this);
    }
  }
}

export class Armor {
  name: string;
  ac: number;

  constructor(name: string, ac: number) {
    this.name = name;
    this.ac = ac;
  }

  addTo(character: SWNCharacter) {
    if (this.ac > character.armorClassEquipped) {
      character.armorClassEquipped = this.ac;
    }
    character.armor.push(this);
  }
}

export class Container {
  name: string;
  tl: number;

  constructor(name: string, tl: number) {
    this.name = name;
    this.tl = tl;
  }

  addTo(character: SWNCharacter) {
    character.equipment.push(this);
  }
}

export class CreditChip {
  amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }

  addTo(character: SWNCharacter) {
    character.credits += this.amount;
  }
}

function allEquipmentPackages() {
  return [
    new EquipmentPackage('Barbarian', [
      new Weapon('Spear', 'melee', '1d6+1'),
      new Armor('Primitive hide armor', 13),
      new Armor('Primitive shield', 1),
      new Weapon('Knife', 'melee', '1d4'),
      new Container('Backpack', 0),
      new MiscItem('7 days rations'),
      new MiscItem('20m rope'),
      new CreditChip(500),
    ]),
    new EquipmentPackage('Blade', [
      new Weapon('Monoblade Sword', 'melee', '1d8+1'),
      new Armor('Woven Body Armor', 15),
      new Armor('Secure Clothing', 13),
      new Weapon('Thermal Knife', 'melee', '1d6'),
      new Container('backpack', 0),
      new MiscItem('Compad'),
      new MiscItem('Lazarus patch'),
      new CreditChip(50),
    ]),
    new EquipmentPackage('Thief', [
      new Weapon('Laser Pistol', 'ranged', '1d6'),
      new Armor('Armored Undersuit', 13),
      new Weapon('Monoblade Knife', 'melee', '1d6'),
      new MiscItem('Climbing harness'),
      new MiscItem('Low-light goggles'),
      new MiscItem('2 type A cells'),
      new Container('backpack', 0),
      new MiscItem('Compad'),
      new MiscItem('Metatool'),
      new CreditChip(25),
    ]),
    new EquipmentPackage('Hacker', [
      new Weapon('Laser Pistol', 'ranged', '1d6'),
      new Armor('Secure Clothing', 13),
      new MiscItem('Postech toolkit'),
      new MiscItem('3 units of spare parts'),
      new MiscItem('2 type A cells'),
      new MiscItem('Dataslab'),
      new MiscItem('Metatool'),
      new MiscItem('2 line shunts'),
      new CreditChip(100),
    ]),
    new EquipmentPackage('Gunslinger', [
      new Weapon('Laser Pistol', 'ranged', '1d6'),
      new Armor('Armored Undersuit', 13),
      new Weapon('Monoblade Knife', 'melee', '1d6'),
      new MiscItem('8 type A cells'),
      new Container('backpack', 0),
      new MiscItem('Compad'),
      new CreditChip(100),
    ]),
    new EquipmentPackage('Soldier', [
      new Weapon('Combat Rifle', 'ranged', '1d12'),
      new Armor('Woven Body Armor', 15),
      new Weapon('Knife', 'melee', '1d4'),
      new MiscItem('80 rounds ammo'),
      new Container('backpack', 0),
      new MiscItem('Compad'),
      new CreditChip(100),
    ]),
    new EquipmentPackage('Scout', [
      new Weapon('Laser Rifle', 'ranged', '1d10'),
      new Armor('Armored vacc suit', 13),
      new Weapon('Knife', 'melee', '1d4'),
      new MiscItem('Survey scanner'),
      new MiscItem('Survival kit'),
      new MiscItem('Binoculars (TL3)'),
      new MiscItem('8 type A cells'),
      new Container('backpack', 0),
      new MiscItem('Compad'),
      new CreditChip(25),
    ]),
    new EquipmentPackage('Medic', [
      new Weapon('Laser Pistol', 'ranged', '1d6'),
      new Armor('Secure Clothing', 13),
      new MiscItem('4 Lazarus patches'),
      new MiscItem('2 doses of Lift'),
      new Container('backpack', 0),
      new MiscItem('Medkit'),
      new MiscItem('Compad'),
      new MiscItem('Bioscanner'),
      new CreditChip(25),
    ]),
    new EquipmentPackage('Civilian', [
      new Armor('Secure Clothing', 13),
      new MiscItem('Compad'),
      new CreditChip(700),
    ]),
    new EquipmentPackage('Technician', [
      new Weapon('Laser Pistol', 'ranged', '1d6'),
      new Armor('Armored Undersuit', 13),
      new Weapon('Monoblade knife', 'melee', '1d6'),
      new MiscItem('Postech toolkit'),
      new MiscItem('6 units of spare parts'),
      new MiscItem('4 type A cells'),
      new Container('backpack', 0),
      new MiscItem('Dataslab'),
      new MiscItem('Metatool'),
      new CreditChip(200),
    ]),
  ];
}

export class Skill {
  name: string;
  skillType: string;
  level: number;

  constructor(name: string, skillType: string) {
    this.name = name;
    this.skillType = skillType;
    this.level = 0;
  }
}

function allSkills() {
  return [
    new Skill('Administer', 'non-combat'),
    new Skill('Connect', 'non-combat'),
    new Skill('Exert', 'non-combat'),
    new Skill('Fix', 'non-combat'),
    new Skill('Heal', 'non-combat'),
    new Skill('Know', 'non-combat'),
    new Skill('Lead', 'non-combat'),
    new Skill('Notice', 'non-combat'),
    new Skill('Perform', 'non-combat'),
    new Skill('Pilot', 'non-combat'),
    new Skill('Program', 'non-combat'),
    new Skill('Punch', 'combat'),
    new Skill('Shoot', 'combat'),
    new Skill('Sneak', 'non-combat'),
    new Skill('Stab', 'combat'),
    new Skill('Survive', 'non-combat'),
    new Skill('Talk', 'non-combat'),
    new Skill('Trade', 'non-combat'),
    new Skill('Work', 'non-combat'),
    new Skill('Biopsionics', 'psychic'),
    new Skill('Metapsionics', 'psychic'),
    new Skill('Precognition', 'psychic'),
    new Skill('Telekinesis', 'psychic'),
    new Skill('Telepathy', 'psychic'),
    new Skill('Teleportation', 'psychic'),
  ];
}

function getSkillByName(skillName: string) {
  const all = allSkills();

  for (let i = 0; i < all.length; i++) {
    if (all[i].name === skillName) {
      return all[i];
    }
  }

  return all[0];
}

function randomCombatSkill() {
  const skills = ['Punch', 'Shoot', 'Stab'];

  return new Skill(RND.item(skills), 'combat');
}

export function formatAsText(character: SWNCharacter) {
  let description = Text.header('Stars Without Number Character');

  description += 'Background: ' + character.background.name + '\n';
  description += 'Class: ' + character.characterClass.name + '\n';
  description += 'Hit Points: ' + character.hitPoints + '\n';

  if (character.effort != 0) {
    description += 'Effort: ' + character.effort + '\n';
  }

  description += 'Base Attack Bonus: ' + character.attackBonus + '\n';
  description += 'Armor Class: ' + character.armorClassEquipped + '\n';
  description += 'Credits: ' + character.credits + '\n';

  description += Text.header('Saving Throws');

  description += 'Evasion: ' + character.savingThrowEvasion + '\n';
  description += 'Mental: ' + character.savingThrowMental + '\n';
  description += 'Physical: ' + character.savingThrowPhysical + '\n';

  description += Text.header('Focuses');

  const focuses = [];

  for (let i = 0; i < character.focuses.length; i++) {
    focuses.push(character.focuses[i].name + ', Level ' + character.focuses[i].currentLevel);
  }

  description += Text.list(focuses);

  description += Text.header('Stats');

  for (let i = 0; i < character.stats.length; i++) {
    description +=
      character.stats[i].abbreviation +
      ' ' +
      character.stats[i].score +
      ' (' +
      character.stats[i].modifier +
      ')\n';
  }

  description += Text.header('Skills');

  const skills = [];

  for (let i = 0; i < character.skills.length; i++) {
    skills.push(character.skills[i].name + '-' + character.skills[i].level);
  }

  description += Text.list(skills);

  description += Text.header('Abilities');

  for (let i = 0; i < character.abilities.length; i++) {
    description += character.abilities[i].description + '\n\n';
  }

  description += Text.header('Weapons');

  const weapons = [];

  for (let i = 0; i < character.rangedWeapons.length; i++) {
    weapons.push(
      character.rangedWeapons[i].name +
        ': ' +
        character.rangedWeapons[i].damage +
        ' damage, ' +
        character.rangedAttackBonus +
        ' attack bonus',
    );
  }

  for (let i = 0; i < character.meleeWeapons.length; i++) {
    weapons.push(
      character.meleeWeapons[i].name +
        ': ' +
        character.meleeWeapons[i].damage +
        ' damage, ' +
        character.meleeAttackBonus +
        ' attack bonus',
    );
  }

  description += Text.list(weapons);

  description += Text.header('Armor');

  const armor = [];

  for (let i = 0; i < character.armor.length; i++) {
    armor.push(character.armor[i].name + ': ' + character.armor[i].ac + ' AC');
  }

  description += Text.list(armor);

  description += Text.header('Equipment');

  description += Text.list(character.equipmentList());

  return description;
}

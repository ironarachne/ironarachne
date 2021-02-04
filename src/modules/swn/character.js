import * as iarnd from "../random.js";
import * as Dice from "../dice.js";

export function generate() {
  let character = {
    stats: randomStats(),
    background: randomBackground(),
    skills: [],
    focuses: [],
    characterClass: randomClass(),
    attackBonus: 0,
    rangedAttackBonus: -2,
    meleeAttackBonus: -2,
    hitPoints: 0,
    abilities: [],
    effort: 0,
    equipment: [],
    rangedWeapons: [],
    meleeWeapons: [],
    armor: [],
    armorClass: 10,
    credits: 0,
    savingThrowMental: 0,
    savingThrowEvasion: 0,
    savingThrowPhysical: 0,
  };

  let dexterity = 0;
  let strength = 0;
  let wisdom = 0;
  let intelligence = 0;
  let constitution = 0;
  let charisma = 0;

  for (let i=0;i<character.stats.length;i++) {
    if (character.stats[i].abbreviation == 'DEX') {
      dexterity = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation == 'STR') {
      strength = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation == 'CON') {
      constitution = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation == 'WIS') {
      wisdom = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation == 'INT') {
      intelligence = character.stats[i].modifier;
    } else if (character.stats[i].abbreviation == 'CHA') {
      charisma = character.stats[i].modifier;
    }
  }

  character.savingThrowMental = 15 - Math.max(wisdom, charisma);
  character.savingThrowEvasion = 15 - Math.max(intelligence, dexterity);
  character.savingThrowPhysical = 15 - Math.max(strength, constitution);

  character.skills = randomStartingSkills(character.background);

  let equipmentPackage = getEquipmentPackage(character.background.equipmentPackage);
  let armorMax = 10;

  for (let i=0;i<equipmentPackage.items.length;i++) {
    if (equipmentPackage.items[i].type == 'ranged weapon') {
      character.rangedWeapons.push(equipmentPackage.items[i]);
    } else if (equipmentPackage.items[i].type == 'melee weapon') {
      character.meleeWeapons.push(equipmentPackage.items[i]);
    } else if (equipmentPackage.items[i].type == 'armor') {
      if (equipmentPackage.items[i].AC > armorMax) {
        armorMax = equipmentPackage.items[i].AC;
      }
      character.armor.push(equipmentPackage.items[i]);
    } else if (equipmentPackage.items[i].type == 'credits') {
      character.credits = equipmentPackage.items[i].amount;
    } else {
      character.equipment.push(equipmentPackage.items[i].name);
    }
  }

  character.armorClass = armorMax + dexterity;

  character.attackBonus = character.characterClass.attackBonus;
  character.hitPoints = Dice.roll(character.characterClass.hitPointRoll);

  for (let i=0;i<character.stats;i++) {
    if (character.stats[i].abbreviation == 'CON') {
      character.hitPoints += character.stats[i].modifier;
    }
  }

  let firstFocus = randomNonPsychicFocus();
  firstFocus.currentLevel = 1;

  character.focuses.push(firstFocus);

  for (let i=0;i<character.characterClass.abilities.length;i++) {
    if (character.characterClass.abilities[i].type == 'bonus focus') {
      let newFocusType = iarnd.item(character.characterClass.abilities[i].focusTypes);
      let newFocus = randomFocusOfType(newFocusType);
      if (character.focuses[0].name == newFocus.name) {
        character.focuses[0].currentLevel = 2;
      } else {
        newFocus.currentLevel = 1;
        character.focuses.push(newFocus);
      }
    } else if (character.characterClass.abilities[i].type == 'bonus skill') {
      let skillAddressed = false;
      let skillType = iarnd.item(character.characterClass.abilities[i].skillTypes);
      let newSkill = randomSkillOfType(skillType);

      for (let j=0;j<character.skills.length;j++) {
        if (character.skills[j].name == newSkill) {
          character.skills[j].level++;
          skillAddressed = true;
        }
      }

      if (!skillAddressed) {
        character.skills.push({name: newSkill, level: 0});
      }
    } else if (character.characterClass.abilities[i].type == 'special') {
      character.abilities.push(character.characterClass.abilities[i].description);
    } else if (character.characterClass.abilities[i].type == 'Effort') {
      character.effort = 1;
      let maxStat = -2;
      for (let i=0;i<character.stats.length;i++) {
        if (character.stats[i].abbreviation == 'CON' || character.stats[i].abbreviation == 'WIS') {
          if (character.stats[i].modifier > maxStat) {
            maxStat = character.stats[i].modifier;
          }
        }
      }
      character.effort += maxStat;
    }
  }

  for (let i=0;i<character.focuses.length;i++) {
    character.abilities.push(character.focuses[i].levelOneDescription);

    if (character.focuses[i].levelOneEffect.type == 'specific bonus skill') {
      let skillAddressed = false;
      for (let j=0;j<character.skills.length;j++) {
        if (character.skills[j].name == character.focuses[i].levelOneEffect.skillName) {
          character.skills[j].level++;
          skillAddressed = true;
        }
      }
      if (!skillAddressed) {
        character.skills.push({name: character.focuses[i].levelOneEffect.skillName, level: 0});
      }
    } else if (character.focuses[i].levelOneEffect.type == 'bonus skill') {
      let skillAddressed = false;
      let skillType = iarnd.item(character.focuses[i].levelOneEffect.skillTypes);
      let newSkill = randomSkillOfType(skillType);

      for (let j=0;j<character.skills.length;j++) {
        if (character.skills[j].name == newSkill) {
          character.skills[j].level++;
          skillAddressed = true;
        }
      }

      if (!skillAddressed) {
        character.skills.push({name: newSkill, level: 0});
      }
    } else if (character.focuses[i].levelOneEffect.type == 'bonus HP') {
      character.hitPoints += character.focuses[i].levelOneEffect.amount;
    } else if (character.focuses[i].levelOneEffect.type == 'innate AC') {
      character.AC = character.focuses[i].levelOneEffect.amount + 1;
    } else if (character.focuses[i].levelOneEffect.type == 'bonus skill from list') {
      let skillAddressed = false;
      let newSkill = iarnd.item(character.focuses[i].levelOneEffect.skillNames);

      for (let j=0;j<character.skills.length;j++) {
        if (character.skills[j].name == newSkill) {
          character.skills[j].level++;
          skillAddressed = true;
        }
      }

      if (!skillAddressed) {
        character.skills.push({name: newSkill, level: 0});
      }
    }
  }

  let skillAddressed = false;
  let hobbySkill = iarnd.item([randomSkillOfType('non-combat'), randomSkillOfType('combat')]);

  for (let j=0;j<character.skills.length;j++) {
    if (character.skills[j].name == hobbySkill) {
      character.skills[j].level++;
      skillAddressed = true;
    }
  }

  if (!skillAddressed) {
    character.skills.push({name: hobbySkill, level: 0});
  }

  for (let i=0;i<character.skills.length;i++) {
    if (character.skills[i].name == 'Stab') {
      character.meleeAttackBonus = character.skills[i].level + character.attackBonus + Math.max(dexterity, strength);
    } else if (character.skills[i].name == 'Shoot') {
      character.rangedAttackBonus = character.skills[i].level + character.attackBonus + dexterity;
    }

    if (character.skills[i].name == 'Biopsionics') {
      if (character.skills[i].level == 0) {
        character.abilities.push('Psychic Succor-0: The psychic’s touch can automatically stabilize a mortally-wounded target as a Main Action. This power must be used on a target within six rounds of their collapse, and does not function on targets that have been decapitated or killed by Heavy weapons. It’s the GM’s decision as to whether a target is intact enough for this power to work.');
      } else if (character.skills[i].level == 1) {
        character.abilities.push('Psychic Succor-1: The psychic’s touch can automatically stabilize a mortally-wounded target as a Main Action. This power must be used on a target within six rounds of their collapse, and does not function on targets that have been decapitated or killed by Heavy weapons. It’s the GM’s decision as to whether a target is intact enough for this power to work. Also heal 1d6+1 hit points of damage. If used on a mortally-wounded target, they revive with the rolled hit points and can act normally on the next round.');

        let ability = randomPsionicAbilityOfDiscipline('Biopsionics');
        character.abilities.push(ability.name + ': ' + ability.description);
      }
    } else if (character.skills[i].name == 'Metapsionics') {
      if (character.skills[i].level == 0) {
        character.abilities.push('Psychic Refinement-0: The adept can visually and audibly detect the use of psychic powers. If both the source and target are visible to the metapsion, they can tell who’s using the power, even if it’s normally imperceptible. They gain a +2 bonus on any saving throw versus a psionic power.');
      } else if (character.skills[i].level == 1) {
        character.abilities.push('Psychic Refinement-1: The adept can visually and audibly detect the use of psychic powers. If both the source and target are visible to the metapsion, they can tell who’s using the power, even if it’s normally imperceptible. They gain a +2 bonus on any saving throw versus a psionic power. The metapsion’s maximum Effort increases by an additional point.');
        character.effort++;

        let ability = randomPsionicAbilityOfDiscipline('Metapsionics');
        character.abilities.push(ability.name + ': ' + ability.description);
      }
    } else if (character.skills[i].name == 'Precognition') {
      if (character.skills[i].level == 0) {
        character.abilities.push('Oracle-0: The precog gains a progressively-greater intuitive understanding of their own future. Each invocation of the Oracle technique requires a Main Action and that the user Commit Effort for the day. Once triggered, the adept gets a single brief vision related to the question about the future that they’re asking. This vision is always from their own personal vantage point and never reveals more than a minute of insight, though the psychic processes it almost instantly as part of the power’s use. Range: One minute into the future.');
      } else if (character.skills[i].level == 1) {
        character.abilities.push('Oracle-1: The precog gains a progressively-greater intuitive understanding of their own future. Each invocation of the Oracle technique requires a Main Action and that the user Commit Effort for the day. Once triggered, the adept gets a single brief vision related to the question about the future that they’re asking. This vision is always from their own personal vantage point and never reveals more than a minute of insight, though the psychic processes it almost instantly as part of the power’s use. Range: One day into the future.');

        let ability = randomPsionicAbilityOfDiscipline('Precognition');
        character.abilities.push(ability.name + ': ' + ability.description);
      }
    } else if (character.skills[i].name == 'Telekinesis') {
      if (character.skills[i].level == 0) {
        character.abilities.push('Telekinetic Manipulation-0: The psychic can exert force as if with one hand and their own strength.');
      } else if (character.skills[i].level == 1) {
        character.abilities.push('Telekinetic Manipulation-1: The psychic can manipulate objects as if with both hands and can lift up to two hundred kilograms with this ability.');

        let ability = randomPsionicAbilityOfDiscipline('Telekinesis');
        character.abilities.push(ability.name + ': ' + ability.description);
      }
    } else if (character.skills[i].name == 'Telepathy') {
      if (character.skills[i].level == 0) {
        character.abilities.push('Telepathic Contact-0: Observe emotional states in a target. Intense emotions provide a single word or image related to the focus of the feelings.');
      } else if (character.skills[i].level == 1) {
        character.abilities.push('Telepathic Contact-1: A shallow gestalt with the target’s language centers allows the telepath to understand any form of communication made by the target. If the psychic has the requisite body parts to speak the target’s language, they can communicate with it in turn.');

        let ability = randomPsionicAbilityOfDiscipline('Telepathy');
        character.abilities.push(ability.name + ': ' + ability.description);
      }
    } else if (character.skills[i].name == 'Teleportation') {
      if (character.skills[i].level == 0) {
        character.abilities.push('Personal Apportation-0: The psychic can teleport up to 10 meters.');
      } else if (character.skills[i].level == 1) {
        character.abilities.push('Personal Apportation-1: The psychic can teleport up to 100 meters.');

        let ability = randomPsionicAbilityOfDiscipline('Teleportation');
        character.abilities.push(ability.name + ': ' + ability.description);
      }
    }
  }

  return character;
}

function allFocuses() {
  return [
    {
      name: 'Alert',
      focusType: 'non-combat',
      levelOneDescription: 'Gain Notice as a bonus skill. You cannot be surprised, nor can others use the Execution Attack option on you. When you roll initiative, roll twice and take the best result.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Notice',
      },
      levelTwoDescription: 'You always act first in a combat round unless someone else involved is also this Alert.',
    },
    {
      name: 'Armsman',
      focusType: 'combat',
      levelOneDescription: 'Gain Stab as a bonus skill. You can draw or sheath a Stowed melee or thrown weapon as an Instant action. You may add your Stab skill level to a melee or thrown weapon’s damage roll or Shock damage, assuming it has any to begin with.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Stab',
      },
      levelTwoDescription: 'Your primitive melee and thrown weapons count as TL4 weapons for the purpose of overcoming advanced armors. Even on a miss with a melee weapon, you do an unmodified 1d4 damage to the target, plus any Shock damage. This bonus damage doesn’t apply to thrown weapons or attacks that use the Punch skill.',
    },
    {
      name: 'Assassin',
      focusType: 'combat',
      levelOneDescription: 'You can conceal an object no larger than a knife or pistol from anything less invasive than a strip search, including normal TL4 weapon detection devices. You can draw or produce this object as an On Turn action, and your point-blank ranged attacks made from surprise with it cannot miss the target.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Sneak',
      },
      levelTwoDescription: 'You can take a Move action on the same round as you make an Execution Attack, closing rapidly with a target before you attack. You may split this Move action when making an Execution Attack, taking part of it before you murder your target and part of it afterwards. This movement happens too quickly to alert a victim or to be hindered by bodyguards, barring an actual physical wall of meat between you and your prey.',
    },
    {
      name: 'Authority',
      focusType: 'non-combat',
      levelOneDescription: 'Once per day, you can make a request from an NPC who is not openly hostile to you, rolling a Cha/Lead skill check at a difficulty of the NPC’s Morale score. If you succeed, they will comply with the request, provided it is not harmful or extremely uncharacteristic.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Lead',
      },
      levelTwoDescription: 'Those who follow you are fired with confidence. Any NPC being directly led by you gains a Morale and hit roll bonus equal to your Lead skill and a +1 bonus on all skill checks. Your followers will not act against your interests unless under extreme pressure.',
    },
    {
      name: 'Close Combatant',
      focusType: 'combat',
      levelOneDescription: 'You can use pistol-sized ranged weapons in melee without suffering penalties for the proximity of melee attackers. You ignore Shock damage from melee assailants, even if you’re unarmored at the time.',
      levelOneEffect: {
        type: 'bonus skill',
        skillTypes: ['combat'],
      },
      levelTwoDescription: 'The Shock damage from your melee attacks treats all targets as if they were AC 10. The Fighting Withdrawal combat action is treated as an On Turn action for you and can be performed freely.',
    },
    {
      name: 'Connected',
      focusType: 'non-combat',
      levelOneDescription: 'If you’ve spent at least a week in a not-entirely-hostile location, you’ll have built a web of contacts willing to do favors for you that are no more than mildly illegal. You can call on one favor per game day and the GM decides how far they’ll go for you.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Connect',
      },
      levelTwoDescription: 'Once per game session, if it’s not entirely implausible, you meet someone you know who is willing to do modest favors for you. You can decide when and where you want to meet this person, but the GM decides who they are and what they can do for you.',
    },
    {
      name: 'Die Hard',
      focusType: 'combat',
      levelOneDescription: 'You gain an extra 2 maximum hit points per level. This bonus applies retroactively if you take this focus after first level. You automatically stabilize if mortally wounded by anything smaller than a Heavy weapon.',
      levelOneEffect: {
        type: 'bonus HP',
        amount: 2,
      },
      levelTwoDescription: 'The first time each day that you are reduced to zero hit points by an injury, you instead survive with one hit point remaining. This ability can’t save you from Heavy weapons or similar trauma.',
    },
    {
      name: 'Diplomat',
      focusType: 'non-combat',
      levelOneDescription: 'You speak all the languages common to the sector and can learn new ones to a workable level in a week, becoming fluent in a month. Reroll 1s on any skill check dice related to negotiation or diplomacy.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Talk',
      },
      levelTwoDescription: 'Once per game session, shift an intelligent NPC’s reaction roll one step closer to friendly if you can talk to them for at least thirty seconds.',
    },
    {
      name: 'Gunslinger',
      focusType: 'combat',
      levelOneDescription: 'You can draw or holster a Stowed ranged weapon as an On Turn action. You may add your Shoot skill level to a ranged weapon’s damage roll.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Shoot',
      },
      levelTwoDescription: 'Once per round, you can reload a ranged weapon as an On Turn action if it takes no more than one round to reload. Even on a miss with a Shoot attack, you do an unmodified 1d4 damage.',
    },
    {
      name: 'Hacker',
      focusType: 'non-combat',
      levelOneDescription: 'When attempting to hack a database or computerized system, roll 3d6 on the skill check and drop the lowest die.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Program',
      },
      levelTwoDescription: 'Your hack duration increases to 1d4+Program skill x 10 minutes. You have an instinctive understanding of the tech; you never need to learn the data protocols for a strange system and are always treated as familiar with it.',
    },
    {
      name: 'Healer',
      focusType: 'non-combat',
      levelOneDescription: 'You may attempt to stabilize one mortally-wounded adjacent person per round as an On Turn action. When rolling Heal skill checks, roll 3d6 and drop the lowest die.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Heal',
      },
      levelTwoDescription: 'Stims or other technological healing devices applied by you heal twice as many hit points as normal. Using only basic medical supplies, you can heal 1d6+Heal skill hit points of damage to every injured or wounded person in your group with ten minutes of first aid spread among them. Such healing can be applied to a given target only once per day.',
    },
    {
      name: 'Henchkeeper',
      focusType: 'non-combat',
      levelOneDescription: 'You can acquire henchmen within 24 hours of arriving in a community, assuming anyone is suitable hench material. These henchmen will not fight except to save their own lives, but will escort you on adventures and risk great danger to help you. Most henchmen will be treated as Peaceful Humans from the Xenobestiary section of the book. You can have one henchmen at a time for every three character levels you have, rounded up. You can release henchmen with no hard feelings at any plausible time and pick them back up later should you be without a current henchman.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Lead',
      },
      levelTwoDescription: 'Your henchmen are remarkably loyal and determined, and will fight for you against anything but clearly overwhelming odds. Whether through natural competence or their devotion to you, they’re treated as Martial Humans from the Xenobestiary section. You can make faithful henchmen out of skilled and highly-capable NPCs, but this requires that you actually have done them some favor or help that would reasonably earn such fierce loyalty.',
    },
    {
      name: 'Ironhide',
      focusType: 'combat',
      levelOneDescription: 'You have an innate Armor Class of 15 plus half your character level, rounded up.',
      levelOneEffect: {
        type: 'innate AC',
        amount: 15,
      },
      levelTwoDescription: 'Your abilities are so effective that they render you immune to unarmed attacks or primitive weaponry as if you wore powered armor.',
    },
    {
      name: 'Psychic Training',
      focusType: 'psychic',
      levelOneDescription: 'Gain any psychic skill as a bonus. If this improves it to level-1 proficiency, choose a free level-1 technique from that discipline. Your maximum Effort increases by one.',
      levelOneEffect: {
        type: 'bonus skill',
        skillTypes: ['psychic'],
      },
      levelTwoDescription: 'When you advance a level, the bonus psychic skill you chose for the first level of the focus automatically gets one skill point put toward increasing it or purchasing a technique from it. You may save these points for later, if more are required to raise the skill or buy a particular technique. These points are awarded retroactively if you take this focus level later in the game.',
    },
    {
      name: 'Savage Fray',
      focusType: 'combat',
      levelOneDescription: 'All enemies adjacent to you at the end of your turn whom you have not attacked suffer the Shock damage of your weapon if their Armor Class is not too high to be affected.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Stab',
      },
      levelTwoDescription: 'After suffering your first melee hit in a round, any further melee attacks from other assailants automatically miss you. If the attacker who hits you has multiple attacks, they may attempt all of them, but other foes around you simply miss.',
    },
    {
      name: 'Shocking Assault',
      focusType: 'combat',
      levelOneDescription: 'The Shock damage of your weapon treats all targets as if they were AC 10, assuming your weapon is capable of harming the target in the first place.',
      levelOneEffect: {
        type: 'bonus skill from list',
        skillNames: ['Punch', 'Stab'],
      },
      levelTwoDescription: 'In addition, you gain a +2 bonus to the Shock damage rating of all melee weapons and unarmed attacks. Regular hits never do less damage than this Shock would do on a miss.',
    },
    {
      name: 'Sniper',
      focusType: 'combat',
      levelOneDescription: 'When making a skill check for an Execution Attack or target shooting, roll 3d6 and drop the lowest die.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Shoot',
      },
      levelTwoDescription: 'A target hit by your Execution Attack takes a -4 penalty on the Physical saving throw to avoid immediate mortal injury. Even if the save is successful, the target takes double the normal damage inflicted by the attack.',
    },
    {
      name: 'Specialist',
      focusType: 'non-combat',
      levelOneDescription: 'Roll 3d6 and drop the lowest die for all skill checks in this skill.',
      levelOneEffect: {
        type: 'bonus skill',
        skillTypes: ['non-combat'],
      },
      levelTwoDescription: 'Roll 4d6 and drop the two lowest dice for all skill checks in this skill.',
    },
    {
      name: 'Star Captain',
      focusType: 'non-combat',
      levelOneDescription: 'Your ship gains 2 extra Command Points at the start of each turn.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Lead',
      },
      levelTwoDescription: 'A ship you captain gains bonus hit points equal to 20% of its maximum at the start of each combat. Damage is taken from these bonus points first, and they vanish at the end of the fight and do not require repairs to replenish before the next. In addition, once per engagement, you may resolve a Crisis as an Instant action by explaining how your leadership resolves the problem.',
    },
    {
      name: 'Starfarer',
      focusType: 'non-combat',
      levelOneDescription: 'You automatically succeed at all spike drill-related skill checks of difficulty 10 or less.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Pilot',
      },
      levelTwoDescription: 'Double your Pilot skill for all spike drill-related skill checks. Spike drives of ships you navigate are treated as one level higher; thus, a drive-1 is treated as a drive-2, up to a maximum of drive-7. Spike drills you personally oversee take only half the time they would otherwise require.',
    },
    {
      name: 'Tinker',
      focusType: 'non-combat',
      levelOneDescription: 'Your Maintenance score is doubled, allowing you to maintain twice as many mods. Both ship and gear mods cost only half their usual price in credits, though pretech salvage requirements remain the same.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Fix',
      },
      levelTwoDescription: 'Your Fix skill is treated as one level higher for purposes of building and maintaining mods and calculating your Maintenance score. Advanced mods require one fewer pretech salvage part to make, down to a minimum of zero.',
    },
    {
      name: 'Unarmed Combatant',
      focusType: 'combat',
      levelOneDescription: 'Your unarmed attacks become more dangerous as your Punch skill increases. At level-0, they do 1d6 damage. At level-1, they do 1d8 damage. At level-2 they do 1d10, level-3 does 1d12, and level-4 does 1d12+1. At Punch-1 or better, they have the Shock quality equal to your Punch skill against AC 15 or less. While you normally add your Punch skill level to any unarmed damage, don’t add it twice to this Shock damage.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Punch',
      },
      levelTwoDescription: 'You know locks and twists that use powered servos against their wearer. Your unarmed attacks count as TL4 weapons for the purpose of overcoming advanced armors. Even on a miss with a Punch attack, you do an unmodified 1d6 damage.',
    },
    {
      name: 'Wanderer',
      focusType: 'non-combat',
      levelOneDescription: 'You can convey basic ideas in all the common languages of the sector. You can always find free transport to a desired destination for yourself and a small group of your friends provided any traffic goes to the place. Finding this transport takes no more than an hour, but it may not be a strictly legitimate means of travel and may require working passage.',
      levelOneEffect: {
        type: 'specific bonus skill',
        skillName: 'Survive',
      },
      levelTwoDescription: 'You can forge, scrounge, or snag travel papers and identification for the party with 1d6 hours of work. These papers and permits will stand up to ordinary scrutiny, but require an opposed Int/Administer versus Wis/Notice check if examined by an official while the PC is actually wanted by the state for some crime. When finding transport for the party, the transportation always makes the trip at least as fast as a dedicated charter would.',
    },
    {
      name: 'Wild Psychic Talent',
      focusType: 'non-combat',
      levelOneDescription: 'You gain an ability equivalent to the level-0 core power of that discipline. Optionally, you may instead pick a level-1 technique from that discipline, but that technique must stand alone; you can’t pick one that augments another technique or core ability. For example, you could pick the Telekinetic Armory technique from Telekinesis, because that ability does not require the use of any other Telekinesis power. You could not pick the Mastered Succor ability from Biopsionics, because that technique is meant to augment another power you don’t have.',
      levelOneEffect: {
        type: 'bonus skill',
        skillTypes: ['psychic'],
      },
      levelTwoDescription: 'You now have a maximum Effort of two points. You may pick a second ability according to the guidelines above. This second does not need to be a stand-alone technique if it augments the power you chose for level 1 of this focus. Thus, if your first pick was gaining the level-0 power of Psychic Succor, your second could be Mastered Succor. You still could not get the level-1 core power of Psychic Succor, however, as you’re still restricted to level-0.',
    }
  ];
}

function randomBackground() {
  let backgrounds = allBackgrounds();

  let background = iarnd.item(backgrounds);

  return background;
}

function randomClass() {
  let classes = [
    {
      name: 'Expert',
      attackBonus: 0,
      hitPointRoll: '1d6',
      abilities: [
        {
          type: 'bonus focus',
          focusTypes: ['non-combat'],
        },
        {
          type: 'special',
          description: 'Once per scene, you can reroll a failed skill check, taking the new roll if it’s better.',
        },
        {
          type: 'special',
          description: 'When you advance an experience level, you gain a bonus skill point that can be spent on any non-combat, non-psychic skill. You can save this point to spend later if you wish.',
        },
      ],
    },
    {
      name: 'Psychic',
      attackBonus: 0,
      hitPointRoll: '1d6',
      abilities: [
        {
          type: 'bonus skill',
          skillTypes: ['psychic'],
        },
        {
          type: 'bonus skill',
          skillTypes: ['psychic'],
        },
        {
          type: 'Effort',
        },
      ]
    },
    {
      name: 'Warrior',
      attackBonus: 1,
      hitPointRoll: '1d6+2',
      abilities: [
        {
          type: 'bonus focus',
          focusTypes: ['combat'],
        },
        {
          type: 'special',
          description: 'Warriors are lucky in combat. Once per scene, as an Instant ability, you can either choose to negate a successful attack roll against you or turn a missed attack roll you made into a successful hit. You can use this ability after the dice are rolled, but it cannot be used against environmental damage, effects without an attack roll, or hits on a vehicle you’re occupying.',
        },
        {
          type: 'special',
          description: 'You gain two extra maximum hit points at each character level.',
        },
      ]
    },
    {
      name: 'Adventurer (Expert/Psychic)',
      attackBonus: 0,
      hitPointRoll: '1d6',
      abilities: [
        {
          type: 'bonus focus',
          focusTypes: ['non-combat'],
        },
        {
          type: 'special',
          description: 'Gain an extra skill point every time you gain a character level which can be spent on any non-psychic, non-combat skill.',
        },
        {
          type: 'bonus skill',
          skillTypes: ['psychic'],
        },
        {
          type: 'Effort',
        },
      ]
    },
    {
      name: 'Adventurer (Warrior/Psychic)',
      attackBonus: 1,
      hitPointRoll: '1d6+2',
      abilities: [
        {
          type: 'bonus focus',
          focusTypes: ['combat'],
        },
        {
          type: 'special',
          description: 'You gain two extra maximum hit points at each character level.',
        },
        {
          type: 'bonus skill',
          skillTypes: ['psychic'],
        },
        {
          type: 'Effort',
        },
      ]
    },
    {
      name: 'Adventurer (Warrior/Expert)',
      attackBonus: 1,
      hitPointRoll: '1d6+2',
      abilities: [
        {
          type: 'bonus focus',
          focusTypes: ['combat'],
        },
        {
          type: 'special',
          description: 'You gain two extra maximum hit points at each character level.',
        },
        {
          type: 'bonus focus',
          focusTypes: ['non-combat'],
        },
        {
          type: 'special',
          description: 'Gain an extra skill point every time you gain a character level which can be spent on any non-psychic, non-combat skill.',
        },
      ]
    }
  ];

  return iarnd.item(classes);
}

function randomFocusOfType(focusType) {
  let all = allFocuses();

  let focuses = [];

  for (let i=0;i<all.length;i++) {
    if (all[i].focusType == focusType) {
      focuses.push(all[i]);
    }
  }

  return iarnd.item(focuses);
}

function randomNonPsychicFocus() {
  let all = allFocuses();

  let focuses = [];

  for (let i=0;i<all.length;i++) {
    if (all[i].focusType != 'psychic') {
      focuses.push(all[i]);
    }
  }

  return iarnd.item(focuses);
}

function randomStartingSkills(background) {
  let skills = [];

  let startingSkills = background.quickSkills;

  for (let i=0;i<startingSkills.length;i++) {
    let skill = {
      name: '',
      level: 0,
    };

    if (startingSkills[i] == 'Any Combat') {
      skill.name = randomCombatSkill();
    } else if (startingSkills[i] == 'Shoot or Trade') {
      skill.name = iarnd.item(['Shoot', 'Trade']);
    } else {
      skill.name = startingSkills[i];
    }

    skills.push(skill);
  }

  return skills;
}

function randomStats() {
  let stats = [
    {
      name: 'strength',
      abbreviation: 'STR',
      score: 0,
      modifier: 0,
    },
    {
      name: 'dexterity',
      abbreviation: 'DEX',
      score: 0,
      modifier: 0,
    },
    {
      name: 'constitution',
      abbreviation: 'CON',
      score: 0,
      modifier: 0,
    },
    {
      name: 'intelligence',
      abbreviation: 'INT',
      score: 0,
      modifier: 0,
    },
    {
      name: 'wisdom',
      abbreviation: 'WIS',
      score: 0,
      modifier: 0,
    },
    {
      name: 'charisma',
      abbreviation: 'CHA',
      score: 0,
      modifier: 0,
    },
  ];

  for (let i=0;i<stats.length;i++) {
    stats[i].score = Dice.roll("3d6");
  }

  let lowest = 100;
  let lowestName = '';

  for (let i=0;i<stats.length;i++) {
    if (stats[i].score < lowest) {
      lowest = stats[i].score;
      lowestName = stats[i].name;
    }
  }

  for (let i=0;i<stats.length;i++) {
    if (stats[i].name == lowestName) {
      stats[i].score = 14;
    }
  }

  for (let i=0;i<stats.length;i++) {
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

function allBackgrounds() {
  return [
    {
      name: 'Barbarian',
      equipmentPackage: 'Barbarian',
      freeSkill: 'Survive',
      quickSkills: [
        'Survive',
        'Notice',
        'Any Combat',
      ],
      learningSkills: [
        'Any Combat',
        'Connect',
        'Exert',
        'Lead',
        'Notice',
        'Punch',
        'Sneak',
        'Survive',
      ],
    },
    {
      name: 'Clergy',
      equipmentPackage: 'Civilian',
      freeSkill: 'Talk',
      quickSkills: [
        'Talk',
        'Perform',
        'Know',
      ],
      learningSkills: [
        'Administer',
        'Connect',
        'Know',
        'Lead',
        'Notice',
        'Perform',
        'Talk',
        'Talk',
      ],
    },
    {
      name: 'Courtesan',
      equipmentPackage: 'Civilian',
      freeSkill: 'Perform',
      quickSkills: [
        'Perform',
        'Notice',
        'Connect',
      ],
      learningSkills: [
        'Any Combat',
        'Connect',
        'Exert',
        'Notice',
        'Perform',
        'Survive',
        'Talk',
        'Trade',
      ],
    },
    {
      name: 'Criminal',
      equipmentPackage: 'Thief',
      freeSkill: 'Sneak',
      quickSkills: [
        'Sneak',
        'Connect',
        'Talk',
      ],
      learningSkills: [
        'Administer',
        'Any Combat',
        'Connect',
        'Notice',
        'Program',
        'Sneak',
        'Talk',
        'Trade',
      ],
    },
    {
      name: 'Dilettante',
      equipmentPackage: 'Civilian',
      freeSkill: 'Connect',
      quickSkills: [
        'Connect',
        'Know',
        'Talk',
      ],
      learningSkills: [
        'Any Skill',
        'Any Skill',
        'Connect',
        'Know',
        'Perform',
        'Pilot',
        'Talk',
        'Trade',
      ],
    },
    {
      name: 'Entertainer',
      equipmentPackage: 'Civilian',
      freeSkill: 'Perform',
      quickSkills: [
        'Perform',
        'Talk',
        'Connect',
      ],
      learningSkills: [
        'Any Combat',
        'Connect',
        'Exert',
        'Notice',
        'Perform',
        'Perform',
        'Sneak',
        'Talk',
      ],
    },
    {
      name: 'Merchant',
      equipmentPackage: 'Civilian',
      freeSkill: 'Trade',
      quickSkills: [
        'Trade',
        'Talk',
        'Connect',
      ],
      learningSkills: [
        'Administer',
        'Any Combat',
        'Connect',
        'Fix',
        'Know',
        'Notice',
        'Trade',
        'Talk',
      ],
    },
    {
      name: 'Noble',
      equipmentPackage: 'Civilian',
      freeSkill: 'Lead',
      quickSkills: [
        'Lead',
        'Connect',
        'Administer',
      ],
      learningSkills: [
        'Administer',
        'Any Combat',
        'Connect',
        'Know',
        'Lead',
        'Notice',
        'Pilot',
        'Talk',
      ],
    },
    {
      name: 'Official',
      equipmentPackage: 'Civilian',
      freeSkill: 'Administer',
      quickSkills: [
        'Administer',
        'Talk',
        'Connect',
      ],
      learningSkills: [
        'Administer',
        'Any Skill',
        'Connect',
        'Know',
        'Lead',
        'Notice',
        'Talk',
        'Trade',
      ],
    },
    {
      name: 'Peasant',
      equipmentPackage: 'Civilian',
      freeSkill: 'Exert',
      quickSkills: [
        'Exert',
        'Sneak',
        'Survive',
      ],
      learningSkills: [
        'Connect',
        'Exert',
        'Fix',
        'Notice',
        'Sneak',
        'Survive',
        'Trade',
        'Work',
      ],
    },
    {
      name: 'Physician',
      equipmentPackage: 'Medic',
      freeSkill: 'Heal',
      quickSkills: [
        'Heal',
        'Know',
        'Notice',
      ],
      learningSkills: [
        'Administer',
        'Connect',
        'Fix',
        'Heal',
        'Know',
        'Notice',
        'Talk',
        'Trade',
      ],
    },
    {
      name: 'Pilot',
      equipmentPackage: 'Scout',
      freeSkill: 'Pilot',
      quickSkills: [
        'Pilot',
        'Fix',
        'Shoot or Trade',
      ],
      learningSkills: [
        'Connect',
        'Exert',
        'Fix',
        'Notice',
        'Pilot',
        'Pilot',
        'Shoot',
        'Trade',
      ],
    },
    {
      name: 'Politician',
      equipmentPackage: 'Civilian',
      freeSkill: 'Talk',
      quickSkills: [
        'Talk',
        'Lead',
        'Connect',
      ],
      learningSkills: [
        'Administer',
        'Connect',
        'Connect',
        'Lead',
        'Notice',
        'Perform',
        'Talk',
        'Talk',
      ],
    },
    {
      name: 'Scholar',
      equipmentPackage: 'Technician',
      freeSkill: 'Know',
      quickSkills: [
        'Know',
        'Connect',
        'Administer',
      ],
      learningSkills: [
        'Administer',
        'Connect',
        'Fix',
        'Know',
        'Notice',
        'Perform',
        'Program',
        'Talk',
      ],
    },
    {
      name: 'Soldier',
      equipmentPackage: 'Soldier',
      freeSkill: 'Any Combat',
      quickSkills: [
        'Any Combat',
        'Exert',
        'Survive',
      ],
      learningSkills: [
        'Administer',
        'Any Combat',
        'Exert',
        'Fix',
        'Lead',
        'Notice',
        'Sneak',
        'Survive',
      ],
    },
    {
      name: 'Spacer',
      equipmentPackage: 'Gunslinger',
      freeSkill: 'Fix',
      quickSkills: [
        'Fix',
        'Pilot',
        'Program',
      ],
      learningSkills: [
        'Administer',
        'Connect',
        'Exert',
        'Fix',
        'Know',
        'Pilot',
        'Program',
        'Talk',
      ],
    },
    {
      name: 'Technician',
      equipmentPackage: 'Technician',
      freeSkill: 'Fix',
      quickSkills: [
        'Fix',
        'Exert',
        'Notice',
      ],
      learningSkills: [
        'Administer',
        'Connect',
        'Exert',
        'Fix',
        'Fix',
        'Know',
        'Notice',
        'Pilot',
      ],
    },
    {
      name: 'Thug',
      equipmentPackage: 'Blade',
      freeSkill: 'Any Combat',
      quickSkills: [
        'Any Combat',
        'Talk',
        'Connect',
      ],
      learningSkills: [
        'Any Combat',
        'Connect',
        'Exert',
        'Notice',
        'Sneak',
        'Stab or Shoot',
        'Survive',
        'Talk',
      ],
    },
    {
      name: 'Vagabond',
      equipmentPackage: 'Civilian',
      freeSkill: 'Survive',
      quickSkills: [
        'Survive',
        'Sneak',
        'Notice',
      ],
      learningSkills: [
        'Any Combat',
        'Connect',
        'Notice',
        'Perform',
        'Pilot',
        'Sneak',
        'Survive',
        'Work',
      ],
    },
    {
      name: 'Worker',
      equipmentPackage: 'Technician',
      freeSkill: 'Work',
      quickSkills: [
        'Work',
        'Connect',
        'Exert',
      ],
      learningSkills: [
        'Administer',
        'Any Skill',
        'Connect',
        'Exert',
        'Fix',
        'Pilot',
        'Program',
        'Work',
      ],
    },
  ];
}

function randomSkillOfType(skillType) {
  let all = allSkills();

  let skills = [];

  for (let i=0;i<all.length;i++) {
    if (all[i].skillType == skillType) {
      skills.push(all[i]);
    }
  }

  let newSkill = iarnd.item(skills);

  return newSkill.name;
}

function randomPsionicAbilityOfDiscipline(discipline) {
  let all = allPsionicAbilities();

  let abilities = [];

  for (let i=0;i<all.length;i++) {
    if (all[i].discipline == discipline) {
      abilities.push(all[i]);
    }
  }

  return iarnd.item(abilities);
}

function allPsionicAbilities() {
  return [
    {
      name: 'Mastered Succor',
      description: 'The biopsion has developed a sophisticated mastery of their core ability, and they no longer need to Commit Effort to activate it, and may use it whenever they wish. The use of additional techniques that augment Psychic Succor might still require Effort to be Committed.',
      level: 1,
      discipline: 'Biopsionics',
    },
    {
      name: 'Organic Purification Protocols',
      description: 'The biopsion’s Psychic Succor now cures any poisons or diseases the subject may be suffering, albeit it requires Committing Effort for the day as an additional surcharge. Biowarfare organisms, exceptionally virulent diseases, or TL5 toxins may resist this curing, requiring a Wis/Biopsionics skill check at a difficulty of at least 10. Failure means that the adept cannot cure the target’s disease. This technique cannot cure congenital illnesses.',
      level: 1,
      discipline: 'Biopsionics',
    },
    {
      name: 'Remote Repair',
      description: 'Psychic Succor and other biopsionic techniques that normally require touch contact can now be applied at a distance up to 100 meters, provided the biopsion can see the target with their unaided vision. Hostile powers that normally require a hit roll will hit automatically. Each time this technique is used, Effort must be Committed for the scene.',
      level: 1,
      discipline: 'Biopsionics',
    },
    {
      name: 'Cloak Powers',
      description: 'The metapsion can conceal their own psychic abilities from metapsionic senses. They must Commit Effort for as long as they wish to cloak their powers. While hidden, only a metapsion with equal or higher skill in Metapsionics can detect their abilities with their level-0 or level-2 Psychic Refinement abilities. In such cases, an opposed Wis/Metapsionics roll is made between the metapsion and the investigator. If the investigator wins, the cloak is pierced, while if the metapsion wins, the investigator’s Psychic Refinement remains oblivious.',
      level: 1,
      discipline: 'Metapsionics',
    },
    {
      name: 'Mindtracing',
      description: 'The metapsion can trace back the use of psionic powers they’ve noticed in their presence. By Committing Effort for the scene as an Instant action, they can see and hear through the senses of a user of a psychic power, gaining an intuitive awareness of their location and treating them as a visible target for purposes of their own abilities. Thus, if they see someone being affected by a telepathy power with no visible source, they can use this ability to briefly share the hidden telepath’s senses. If used on a target that is teleporting, they can perceive the teleporter’s view of their destination. Use on a metamorphically-shaped impostor would reveal the biopsion responsible for the change, and so forth. These shared senses last for only one round and do not interfere with the adept’s other actions.',
      level: 1,
      discipline: 'Metapsionics',
    },
    {
      name: 'Synthetic Adaptation',
      description: 'This is a particularly esoteric technique, one that requires the adept to have at least Program-0 or Fix-0 skill in order to master. With it, however, the metapsion has learned how to synergize with the quantum intelligence of a VI or True AI in order to apply Telepathy or Biopsion powers to their inanimate corpus. Only intelligent machines can be affected, as the technique requires a sentient mind to catalyze the effect. This synergy takes much of its force from the adept. Any System Strain the powers might inflict must be paid by the adept rather than the target.',
      level: 1,
      discipline: 'Metapsionics',
    },
    {
      name: 'Intuitive Response',
      description: 'As an Instant action, the precog can Commit Effort for the scene just before they roll initiative. Their initiative score is treated as one better than anyone else’s involved in the scene. If another participant has this power or some other ability that grants automatic initiative success, roll initiative normally to determine which of them goes first, and then the rest of the combatants act. This ability cannot be used if the precog has been surprised.',
      level: 1,
      discipline: 'Precognition',
    },
    {
      name: 'Sense the Need',
      description: 'At some point in the recent past, the psychic had a vague but intense premonition that a particular object would be needed. By triggering this power as an Instant action and Committing Effort for the day, the psychic can retroactively declare that they brought along any one object that they could have reasonably acquired and carried to this point. This object must be plausible given recent events; if the psychic has just been stripsearched, very few objects could reasonably have been kept, while a psychic who’s just passed through a weapons check couldn’t still have a loaded laser pistol.',
      level: 1,
      discipline: 'Precognition',
    },
    {
      name: 'Terminal Reflection',
      description: 'The psychic’s Oracle power automatically triggers as an Instant action moments before some unexpected danger or ambush, giving the precog a brief vision of the impending hazard. This warning comes just in time to avoid springing a trap or to negate combat surprise for the precog and their companions. If the psychic does not immediately Commit Effort for the day, this sense goes numb and this technique cannot be used for the rest of the day.',
      level: 1,
      discipline: 'Precognition',
    },
    {
      name: 'Kinetic Transversal',
      description: 'The adept may Commit Effort as an On Turn action to move freely over vertical or overhanging surfaces as if they were flat ground, crossing any solid surface strong enough to bear five kilos of weight. They can also move over liquids at their full movement rate. This move- ment ability lasts as long as the Effort is committed.',
      level: 1,
      discipline: 'Telekinesis',
    },
    {
      name: 'Pressure Field',
      description: 'As an Instant action, the adept can manifest a protective force skin around their person equivalent to a vacc suit, maintaining pressure and temperature even in hard vacuum conditions. They can ignore temperatures at a range of plus or minus 100 degrees Celsius and automatically pressurize thin atmospheres for breathability, or filter particulates or airborne toxins. By Committing Effort for the scene, they can shield up to six comrades. This lasts until the user reclaims the Effort.',
      level: 1,
      discipline: 'Telekinesis',
    },
    {
      name: 'Telekinetic Armory',
      description: 'The adept may Commit Effort as an On Turn action to create both weapons and armor out of telekinetic force. These weapons are treated as tech level 4 and act as a rifle or any advanced melee weapon. Attack rolls can use either Dexterity, Wisdom, or Constitution modifiers, and may use the Telekinesis skill as the combat skill. Armor may be created as part of this power, granting the psychic a base Armor Class equal to 15 plus their Telekinesis skill level. This armor does not stack with conventional armor, but Dexterity or shields modify it as usual. The gear continues to exist as long as the psychic chooses to leave the Effort committed, and they may be invisible or visible at the psychic’s discretion.',
      level: 1,
      discipline: 'Telekinesis',
    },
    {
      name: 'Facile Mind',
      description: 'The telepath is practiced at opening a Telepathic Contact, and need only Commit Effort for the scene to do so, instead of Committing Effort for the day. If contacting an ally who has practiced the process with the psychic for at least a week, opening the contact normally requires no Effort at all. In both cases, if the telepath chooses to Commit Effort for the day, they can open a Telepathic Contact as an Instant action rather than a Main Action.',
      level: 1,
      discipline: 'Telepathy',
    },
    {
      name: 'Transmit Thought',
      description: 'The telepath can send thoughts and images over a Telepathic Contact, allowing two-way communication with a willing target as an Instant action when desired.',
      level: 1,
      discipline: 'Telepathy',
    },
    {
      name: 'Proficient Apportation',
      description: 'Personal Apportation now counts as a Move action, though it still can be performed only once per round. Apportations of 10 meters or less no longer require Effort to be Committed, though any augments to the technique must still be paid for normally.',
      level: 1,
      discipline: 'Teleportation',
    },
    {
      name: 'Spatial Awareness',
      description: 'The psychic may Commit Effort as an On Turn ac- tion to gain an intuitive 360-degree awareness of their physical surroundings. The sense is roughly equivalent to sight out to 100 meters, though it cannot read text or distinguish colors. It is blocked by solid objects but is unimpeded by darkness, mist, blinding light, holograms, or optical illusions. The sense lasts as long as the Effort remains Committed to the technique.',
      level: 1,
      discipline: 'Teleportation',
    },
  ]
}

function getEquipmentPackage(name) {
  let all = allEquipmentPackages();

  for (let i=0;i<all.length;i++) {
    if (all[i].name == name) {
      return all[i];
    }
  }
}

function allEquipmentPackages() {
  return [
    {
      name: 'Barbarian',
      items: [
        {
          name: 'Spear',
          type: 'melee weapon',
          damage: '1d6+1',
        },
        {
          name: 'Primitive hide armor',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Primitive shield',
          type: 'armor',
          AC: 1,
        },
        {
          name: 'Knife',
          type: 'melee weapon',
          damage: '1d4',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: '7 days rations',
          type: 'miscellaneous',
        },
        {
          name: '20m rope',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 500,
        },
      ],
    },
    {
      name: 'Blade',
      items: [
        {
          name: 'Monoblade Sword',
          type: 'melee weapon',
          damage: '1d8+1',
        },
        {
          name: 'Woven Body Armor',
          type: 'armor',
          AC: 15,
        },
        {
          name: 'Secure Clothing',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Thermal Knife',
          type: 'melee weapon',
          damage: '1d6',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: 'Compad',
          type: 'miscellaneous',
        },
        {
          name: 'Lazarus patch',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 50,
        },
      ],
    },
    {
      name: 'Thief',
      items: [
        {
          name: 'Laser Pistol',
          type: 'ranged weapon',
          damage: '1d6',
        },
        {
          name: 'Armored Undersuit',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Monoblade Knife',
          type: 'melee weapon',
          damage: '1d6',
        },
        {
          name: 'Climbing harness',
          type: 'miscellaneous',
        },
        {
          name: 'Low-light goggles',
          type: 'miscellaneous',
        },
        {
          name: '2 type A cells',
          type: 'miscellaneous',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: 'Compad',
          type: 'miscellaneous',
        },
        {
          name: 'Metatool',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 25,
        },
      ],
    },
    {
      name: 'Hacker',
      items: [
        {
          name: 'Laser Pistol',
          type: 'ranged weapon',
          damage: '1d6',
        },
        {
          name: 'Secure Clothing',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Postech toolkit',
          type: 'miscellaneous',
        },
        {
          name: '3 units of spare parts',
          type: 'miscellaneous',
        },
        {
          name: '2 type A cells',
          type: 'miscellaneous',
        },
        {
          name: 'Dataslab',
          type: 'miscellaneous',
        },
        {
          name: 'Metatool',
          type: 'miscellaneous',
        },
        {
          name: '2 line shunts',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 100,
        },
      ],
    },
    {
      name: 'Gunslinger',
      items: [
        {
          name: 'Laser Pistol',
          type: 'ranged weapon',
          damage: '1d6',
        },
        {
          name: 'Armored Undersuit',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Monoblade Knife',
          type: 'melee weapon',
          damage: '1d6',
        },
        {
          name: '8 type A cells',
          type: 'miscellaneous',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: 'Compad',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 100,
        },
      ],
    },
    {
      name: 'Soldier',
      items: [
        {
          name: 'Combat Rifle',
          type: 'ranged weapon',
          damage: '1d12',
        },
        {
          name: 'Woven Body Armor',
          type: 'armor',
          AC: 15,
        },
        {
          name: 'Knife',
          type: 'melee weapon',
          damage: '1d4',
        },
        {
          name: '80 rounds ammo',
          type: 'miscellaneous',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: 'Compad',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 100,
        },
      ],
    },
    {
      name: 'Scout',
      items: [
        {
          name: 'Laser Rifle',
          type: 'ranged weapon',
          damage: '1d10',
        },
        {
          name: 'Armored vacc suit',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Knife',
          type: 'melee weapon',
          damage: '1d4',
        },
        {
          name: 'Survey scanner',
          type: 'miscellaneous',
        },
        {
          name: 'Survival kit',
          type: 'miscellaneous',
        },
        {
          name: 'Binoculars (TL3)',
          type: 'miscellaneous',
        },
        {
          name: '8 type A cells',
          type: 'miscellaneous',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: 'Compad',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 25,
        },
      ],
    },
    {
      name: 'Medic',
      items: [
        {
          name: 'Laser Pistol',
          type: 'ranged weapon',
          damage: '1d6',
        },
        {
          name: 'Secure Clothing',
          type: 'armor',
          AC: 13,
        },
        {
          name: '4 Lazarus patches',
          type: 'miscellaneous',
        },
        {
          name: '2 doses of Lift',
          type: 'miscellaneous',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: 'Medkit',
          type: 'miscellaneous',
        },
        {
          name: 'Compad',
          type: 'miscellaneous',
        },
        {
          name: 'Bioscanner',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 25,
        },
      ],
    },
    {
      name: 'Civilian',
      items: [
        {
          name: 'Secure Clothing',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Compad',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 700,
        },
      ],
    },
    {
      name: 'Technician',
      items: [
        {
          name: 'Laser Pistol',
          type: 'ranged weapon',
          damage: '1d6',
        },
        {
          name: 'Armored Undersuit',
          type: 'armor',
          AC: 13,
        },
        {
          name: 'Monoblade knife',
          type: 'melee weapon',
          damage: '1d6',
        },
        {
          name: 'Postech toolkit',
          type: 'miscellaneous',
        },
        {
          name: '6 units of spare parts',
          type: 'miscellaneous',
        },
        {
          name: '4 type A cells',
          type: 'miscellaneous',
        },
        {
          name: 'Backpack',
          type: 'container',
          TL: 0,
        },
        {
          name: 'Dataslab',
          type: 'miscellaneous',
        },
        {
          name: 'Metatool',
          type: 'miscellaneous',
        },
        {
          name: 'credits',
          type: 'credits',
          amount: 200,
        },
      ],
    },
  ];
}

function allSkills() {
  let skills = [
    {
      name: 'Administer',
      skillType: 'non-combat',
    },
    {
      name: 'Connect',
      skillType: 'non-combat',
    },
    {
      name: 'Exert',
      skillType: 'non-combat',
    },
    {
      name: 'Fix',
      skillType: 'non-combat',
    },
    {
      name: 'Heal',
      skillType: 'non-combat',
    },
    {
      name: 'Know',
      skillType: 'non-combat',
    },
    {
      name: 'Lead',
      skillType: 'non-combat',
    },
    {
      name: 'Notice',
      skillType: 'non-combat',
    },
    {
      name: 'Perform',
      skillType: 'non-combat',
    },
    {
      name: 'Pilot',
      skillType: 'non-combat',
    },
    {
      name: 'Program',
      skillType: 'non-combat',
    },
    {
      name: 'Punch',
      skillType: 'combat',
    },
    {
      name: 'Shoot',
      skillType: 'combat',
    },
    {
      name: 'Sneak',
      skillType: 'non-combat',
    },
    {
      name: 'Stab',
      skillType: 'combat',
    },
    {
      name: 'Survive',
      skillType: 'non-combat',
    },
    {
      name: 'Talk',
      skillType: 'non-combat',
    },
    {
      name: 'Trade',
      skillType: 'non-combat',
    },
    {
      name: 'Work',
      skillType: 'non-combat',
    },
    {
      name: 'Biopsionics',
      skillType: 'psychic',
    },
    {
      name: 'Metapsionics',
      skillType: 'psychic',
    },
    {
      name: 'Precognition',
      skillType: 'psychic',
    },
    {
      name: 'Telekinesis',
      skillType: 'psychic',
    },
    {
      name: 'Telepathy',
      skillType: 'psychic',
    },
    {
      name: 'Teleportation',
      skillType: 'psychic',
    },
  ];

  return skills;
}

function randomCombatSkill() {
  let skills = [
    'Punch',
    'Shoot',
    'Stab',
  ];

  return iarnd.item(skills);
}

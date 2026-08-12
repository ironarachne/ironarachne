import type ADNDSpell from './adndspell.js';
import type SpellFilter from './spellfilter.js';

export function getFilteredSpells(filter: SpellFilter, spells: ADNDSpell[]): ADNDSpell[] {
  const result: ADNDSpell[] = [];

  for (let i = 0; i < spells.length; i++) {
    let meetsLevelCriterion = false;
    let meetsClassCriterion = false;
    let meetsBannedTagsCriterion = false;
    let meetsRequiredTagsCriterion = false;
    if ((filter.level !== -1 && spells[i].level === filter.level) || filter.level === -1) {
      meetsLevelCriterion = true;
    }
    if (filter.casterClass === spells[i].casterClass) {
      meetsClassCriterion = true;
    }
    if (filter.bannedTags.length > 0) {
      let countOfBannedTags = 0;
      for (let j = 0; j < filter.bannedTags.length; j++) {
        if (spells[i].tags.indexOf(filter.bannedTags[j]) !== -1) {
          countOfBannedTags++;
        }
      }
      if (countOfBannedTags === 0) {
        meetsBannedTagsCriterion = true;
      }
    } else {
      meetsBannedTagsCriterion = true;
    }
    if (filter.requiredTags.length > 0) {
      for (let j = 0; j < filter.requiredTags.length; j++) {
        if (spells[i].tags.indexOf(filter.requiredTags[j]) !== -1) {
          meetsRequiredTagsCriterion = true;
        }
      }
    } else {
      meetsRequiredTagsCriterion = true;
    }
    if (
      meetsLevelCriterion &&
      meetsClassCriterion &&
      meetsBannedTagsCriterion &&
      meetsRequiredTagsCriterion
    ) {
      result.push(spells[i]);
    }
  }

  return result;
}

export function getAll(): ADNDSpell[] {
  return [
    {
      name: 'Animal Friendship',
      casterClass: 'priest',
      level: 1,
      tags: ['animal', 'enchantment', 'charm'],
    },
    { name: 'Bless', casterClass: 'priest', level: 1, tags: ['conjuration', 'summoning', 'all'] },
    { name: 'Combine', casterClass: 'priest', level: 1, tags: ['evocation', 'all'] },
    { name: 'Command', casterClass: 'priest', level: 1, tags: ['enchantment', 'charm'] },
    {
      name: 'Create Water',
      casterClass: 'priest',
      level: 1,
      tags: ['alteration', 'elemental', 'water'],
    },
    { name: 'Cure Light Wounds', casterClass: 'priest', level: 1, tags: ['necromancy', 'healing'] },
    { name: 'Detect Evil', casterClass: 'priest', level: 1, tags: ['divination', 'all'] },
    { name: 'Detect Magic', casterClass: 'priest', level: 1, tags: ['divination'] },
    { name: 'Detect Poison', casterClass: 'priest', level: 1, tags: ['divination'] },
    { name: 'Detect Snares and Pits', casterClass: 'priest', level: 1, tags: ['divination'] },
    {
      name: 'Endure Cold/Endure Heat',
      casterClass: 'priest',
      level: 1,
      tags: ['alteration', 'protection'],
    },
    { name: 'Entangle', casterClass: 'priest', level: 1, tags: ['alteration', 'plant'] },
    { name: 'Faerie Fire', casterClass: 'priest', level: 1, tags: ['alteration', 'weather'] },
    {
      name: 'Invisibility to Animals',
      casterClass: 'priest',
      level: 1,
      tags: ['alteration', 'animal'],
    },
    {
      name: 'Invisibility to Undead',
      casterClass: 'priest',
      level: 1,
      tags: ['abjuration', 'necromantic'],
    },
    { name: 'Light', casterClass: 'priest', level: 1, tags: ['alteration', 'sun'] },
    {
      name: 'Locate Animals or Plants',
      casterClass: 'priest',
      level: 1,
      tags: ['divination', 'animal', 'plant'],
    },
    { name: 'Magical Stone', casterClass: 'priest', level: 1, tags: ['enchantment', 'combat'] },
    {
      name: 'Pass without Trace',
      casterClass: 'priest',
      level: 1,
      tags: ['enchantment', 'charm', 'plant'],
    },
    {
      name: 'Protection from Evil',
      casterClass: 'priest',
      level: 1,
      tags: ['abjuration', 'protection'],
    },
    { name: 'Purify Food and Drink', casterClass: 'priest', level: 1, tags: ['alteration', 'all'] },
    { name: 'Remove Fear', casterClass: 'priest', level: 1, tags: ['abjuration', 'charm'] },
    { name: 'Sanctuary', casterClass: 'priest', level: 1, tags: ['abjuration', 'protection'] },
    {
      name: 'Shillelagh',
      casterClass: 'priest',
      level: 1,
      tags: ['alteration', 'combat', 'plant'],
    },
    { name: 'Affect Normal Fires', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Alarm', casterClass: 'wizard', level: 1, tags: ['abjuration', 'evocation'] },
    { name: 'Armor', casterClass: 'wizard', level: 1, tags: ['conjuration'] },
    { name: 'Audible Glamer', casterClass: 'wizard', level: 1, tags: ['illusion', 'phantasm'] },
    { name: 'Burning Hands', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Cantrip', casterClass: 'wizard', level: 1, tags: ['all'] },
    { name: 'Change Self', casterClass: 'wizard', level: 1, tags: ['illusion', 'phantasm'] },
    { name: 'Charm Person', casterClass: 'wizard', level: 1, tags: ['enchantment', 'charm'] },
    { name: 'Chill Touch', casterClass: 'wizard', level: 1, tags: ['necromancy'] },
    { name: 'Color Spray', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Comprehend Languages', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Dancing Lights', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Detect Magic', casterClass: 'wizard', level: 1, tags: ['divination'] },
    { name: 'Detect Undead', casterClass: 'wizard', level: 1, tags: ['divination', 'necromancy'] },
    { name: 'Enlarge', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Erase', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Feather Fall', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Find Familiar', casterClass: 'wizard', level: 1, tags: ['conjuration', 'summoning'] },
    { name: 'Friends', casterClass: 'wizard', level: 1, tags: ['enchantment', 'charm'] },
    { name: 'Gaze Reflection', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Grease', casterClass: 'wizard', level: 1, tags: ['conjuration'] },
    { name: 'Hold Portal', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Hypnotism', casterClass: 'wizard', level: 1, tags: ['enchantment', 'charm'] },
    { name: 'Identify', casterClass: 'wizard', level: 1, tags: ['divination'] },
    { name: 'Jump', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Light', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Magic Missile', casterClass: 'wizard', level: 1, tags: ['evocation'] },
    { name: 'Mending', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Message', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Mount', casterClass: 'wizard', level: 1, tags: ['conjuration', 'summoning'] },
    {
      name: "Nystul's Magic Aura",
      casterClass: 'wizard',
      level: 1,
      tags: ['illusion', 'phantasm'],
    },
    { name: 'Phantasmal Force', casterClass: 'wizard', level: 1, tags: ['illusion', 'phantasm'] },
    { name: 'Protection from Evil', casterClass: 'wizard', level: 1, tags: ['abjuration'] },
    { name: 'Read Magic', casterClass: 'wizard', level: 1, tags: ['divination'] },
    { name: 'Shield', casterClass: 'wizard', level: 1, tags: ['evocation'] },
    { name: 'Shocking Grasp', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Sleep', casterClass: 'wizard', level: 1, tags: ['enchantment', 'charm'] },
    { name: 'Spider Climb', casterClass: 'wizard', level: 1, tags: ['alteration'] },
    { name: 'Spook', casterClass: 'wizard', level: 1, tags: ['illusion', 'phantasm'] },
    { name: 'Taunt', casterClass: 'wizard', level: 1, tags: ['enchantment'] },
    { name: "Tenser's Floating Disk", casterClass: 'wizard', level: 1, tags: ['evocation'] },
    { name: 'Unseen Servant', casterClass: 'wizard', level: 1, tags: ['conjuration'] },
    { name: 'Ventriloquism', casterClass: 'wizard', level: 1, tags: ['illusion', 'phantasm'] },
    { name: 'Wall of Fog', casterClass: 'wizard', level: 1, tags: ['evocation'] },
    { name: 'Wizard Mark', casterClass: 'wizard', level: 1, tags: ['alteration'] },
  ];
}

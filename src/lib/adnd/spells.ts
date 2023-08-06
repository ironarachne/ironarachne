"use strict";

import ADNDSpell from "./adndspell.js";
import SpellFilter from "./spellfilter.js";

export function getFilteredSpells(filter: SpellFilter, spells: ADNDSpell[]): ADNDSpell[] {
  let result = [];

  for (let i = 0; i < spells.length; i++) {
    let meetsLevelCriterion = false;
    let meetsClassCriterion = false;
    let meetsBannedTagsCriterion = false;
    let meetsRequiredTagsCriterion = false;
    if ((filter.level != -1 && spells[i].level == filter.level) || filter.level == -1) {
      meetsLevelCriterion = true;
    }
    if (filter.casterClass == spells[i].casterClass) {
      meetsClassCriterion = true;
    }
    if (filter.bannedTags.length > 0) {
      let countOfBannedTags = 0;
      for (let j = 0; j < filter.bannedTags.length; j++) {
        if (spells[i].tags.indexOf(filter.bannedTags[j]) != -1) {
          countOfBannedTags++;
        }
      }
      if (countOfBannedTags == 0) {
        meetsBannedTagsCriterion = true;
      }
    } else {
      meetsBannedTagsCriterion = true;
    }
    if (filter.requiredTags.length > 0) {
      for (let j = 0; j < filter.requiredTags.length; j++) {
        if (spells[i].tags.indexOf(filter.requiredTags[j]) != -1) {
          meetsRequiredTagsCriterion = true;
        }
      }
    } else {
      meetsRequiredTagsCriterion = true;
    }
    if (
      meetsLevelCriterion
      && meetsClassCriterion
      && meetsBannedTagsCriterion
      && meetsRequiredTagsCriterion
    ) {
      result.push(spells[i]);
    }
  }

  return result;
}

export function getAll(): ADNDSpell[] {
  return [
    new ADNDSpell("Animal Friendship", "priest", 1, ["animal", "enchantment", "charm"]),
    new ADNDSpell("Bless", "priest", 1, ["conjuration", "summoning", "all"]),
    new ADNDSpell("Combine", "priest", 1, ["evocation", "all"]),
    new ADNDSpell("Command", "priest", 1, ["enchantment", "charm"]),
    new ADNDSpell("Create Water", "priest", 1, ["alteration", "elemental", "water"]),
    new ADNDSpell("Cure Light Wounds", "priest", 1, ["necromancy", "healing"]),
    new ADNDSpell("Detect Evil", "priest", 1, ["divination", "all"]),
    new ADNDSpell("Detect Magic", "priest", 1, ["divination"]),
    new ADNDSpell("Detect Poison", "priest", 1, ["divination"]),
    new ADNDSpell("Detect Snares and Pits", "priest", 1, ["divination"]),
    new ADNDSpell("Endure Cold/Endure Heat", "priest", 1, ["alteration", "protection"]),
    new ADNDSpell("Entangle", "priest", 1, ["alteration", "plant"]),
    new ADNDSpell("Faerie Fire", "priest", 1, ["alteration", "weather"]),
    new ADNDSpell("Invisibility to Animals", "priest", 1, ["alteration", "animal"]),
    new ADNDSpell("Invisibility to Undead", "priest", 1, ["abjuration", "necromantic"]),
    new ADNDSpell("Light", "priest", 1, ["alteration", "sun"]),
    new ADNDSpell("Locate Animals or Plants", "priest", 1, ["divination", "animal", "plant"]),
    new ADNDSpell("Magical Stone", "priest", 1, ["enchantment", "combat"]),
    new ADNDSpell("Pass without Trace", "priest", 1, ["enchantment", "charm", "plant"]),
    new ADNDSpell("Protection from Evil", "priest", 1, ["abjuration", "protection"]),
    new ADNDSpell("Purify Food and Drink", "priest", 1, ["alteration", "all"]),
    new ADNDSpell("Remove Fear", "priest", 1, ["abjuration", "charm"]),
    new ADNDSpell("Sanctuary", "priest", 1, ["abjuration", "protection"]),
    new ADNDSpell("Shillelagh", "priest", 1, ["alteration", "combat", "plant"]),
    new ADNDSpell("Affect Normal Fires", "wizard", 1, ["alteration"]),
    new ADNDSpell("Alarm", "wizard", 1, ["abjuration", "evocation"]),
    new ADNDSpell("Armor", "wizard", 1, ["conjuration"]),
    new ADNDSpell("Audible Glamer", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Burning Hands", "wizard", 1, ["alteration"]),
    new ADNDSpell("Cantrip", "wizard", 1, ["all"]),
    new ADNDSpell("Change Self", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Charm Person", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Chill Touch", "wizard", 1, ["necromancy"]),
    new ADNDSpell("Color Spray", "wizard", 1, ["alteration"]),
    new ADNDSpell("Comprehend Languages", "wizard", 1, ["alteration"]),
    new ADNDSpell("Dancing Lights", "wizard", 1, ["alteration"]),
    new ADNDSpell("Detect Magic", "wizard", 1, ["divination"]),
    new ADNDSpell("Detect Undead", "wizard", 1, ["divination", "necromancy"]),
    new ADNDSpell("Enlarge", "wizard", 1, ["alteration"]),
    new ADNDSpell("Erase", "wizard", 1, ["alteration"]),
    new ADNDSpell("Feather Fall", "wizard", 1, ["alteration"]),
    new ADNDSpell("Find Familiar", "wizard", 1, ["conjuration", "summoning"]),
    new ADNDSpell("Friends", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Gaze Reflection", "wizard", 1, ["alteration"]),
    new ADNDSpell("Grease", "wizard", 1, ["conjuration"]),
    new ADNDSpell("Hold Portal", "wizard", 1, ["alteration"]),
    new ADNDSpell("Hypnotism", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Identify", "wizard", 1, ["divination"]),
    new ADNDSpell("Jump", "wizard", 1, ["alteration"]),
    new ADNDSpell("Light", "wizard", 1, ["alteration"]),
    new ADNDSpell("Magic Missile", "wizard", 1, ["evocation"]),
    new ADNDSpell("Mending", "wizard", 1, ["alteration"]),
    new ADNDSpell("Message", "wizard", 1, ["alteration"]),
    new ADNDSpell("Mount", "wizard", 1, ["conjuration", "summoning"]),
    new ADNDSpell("Nystul's Magic Aura", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Phantasmal Force", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Protection from Evil", "wizard", 1, ["abjuration"]),
    new ADNDSpell("Read Magic", "wizard", 1, ["divination"]),
    new ADNDSpell("Shield", "wizard", 1, ["evocation"]),
    new ADNDSpell("Shocking Grasp", "wizard", 1, ["alteration"]),
    new ADNDSpell("Sleep", "wizard", 1, ["enchantment", "charm"]),
    new ADNDSpell("Spider Climb", "wizard", 1, ["alteration"]),
    new ADNDSpell("Spook", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Taunt", "wizard", 1, ["enchantment"]),
    new ADNDSpell("Tenser's Floating Disk", "wizard", 1, ["evocation"]),
    new ADNDSpell("Unseen Servant", "wizard", 1, ["conjuration"]),
    new ADNDSpell("Ventriloquism", "wizard", 1, ["illusion", "phantasm"]),
    new ADNDSpell("Wall of Fog", "wizard", 1, ["evocation"]),
    new ADNDSpell("Wizard Mark", "wizard", 1, ["alteration"]),
  ];
}

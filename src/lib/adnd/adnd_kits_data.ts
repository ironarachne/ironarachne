/**
 * Optional character kits (curated; narrative features only in this generator).
 * Rows are matched by `className` to `ADNDClass.name` and minimum ability scores.
 */
export type AdndKitRow = {
  className: string;
  name: string;
  minStrength?: number;
  minDexterity?: number;
  minConstitution?: number;
  minIntelligence?: number;
  minWisdom?: number;
  minCharisma?: number;
  features: string[];
};

export const adndKitRows: AdndKitRow[] = [
  {
    className: 'fighter',
    name: 'Berserker',
    minConstitution: 14,
    features: [
      'May enter a controlled rage in combat: +2 to damage for a short fight, -2 AC until next rest',
      'Intimidation comes naturally; NPC reactions may be more fearful',
    ],
  },
  {
    className: 'fighter',
    name: 'Myrmidon',
    features: [
      'Favors disciplined unit tactics and battlefield awareness',
      "One extra nonweapon slot may be used for a military or leadership skill at the DM's option",
    ],
  },
  {
    className: 'paladin',
    name: 'Hospitaler',
    minCharisma: 15,
    features: [
      'Known as a healer and protector on the road',
      'Tends to be trusted by common folk and travelers',
    ],
  },
  {
    className: 'paladin',
    name: 'Avenger',
    minWisdom: 13,
    features: ['Special focus on smiting those who have broken oaths or harmed innocents'],
  },
  {
    className: 'ranger',
    name: 'Warden of the green',
    minWisdom: 14,
    features: ['Patrols wild borders; extra attention to foraging and trail signs in fiction'],
  },
  {
    className: 'ranger',
    name: 'Beast friend',
    features: ['Builds trust with natural beasts faster in roleplay; tracking emphasis'],
  },
  {
    className: 'mage',
    name: 'Academician',
    minIntelligence: 15,
    features: ['Keeps careful spell notes; favors research and library scenes'],
  },
  {
    className: 'mage',
    name: 'Vagabond arcanist',
    features: ['Learns from roadside masters and odd relics; comfortable with rough travel'],
  },
  {
    className: 'abjurer',
    name: 'Ward-keeper',
    minIntelligence: 14,
    features: ['Obsessed with protecting others through barriers and negation'],
  },
  {
    className: 'abjurer',
    name: 'Oath of silence',
    features: ['Avoids speaking true names of powers in play; mystery around wards'],
  },
  {
    className: 'conjurer',
    name: 'Summoner of circles',
    minIntelligence: 15,
    features: ['Ritual circles and names matter in how you cast summoning; flair for names'],
  },
  {
    className: 'conjurer',
    name: 'Beast-binder',
    features: ['Prefers natural spirits and fey-adjacent allies over fiends in flavor'],
  },
  {
    className: 'diviner',
    name: 'Soothsayer',
    minWisdom: 13,
    features: ['Reads lots in small omens: weather, livers, cards, in fiction'],
  },
  {
    className: 'diviner',
    name: 'Tactical seer',
    features: ['Frames divination as battlefield intelligence, not just prophecy'],
  },
  {
    className: 'enchanter',
    name: 'Court enchanter',
    minCharisma: 14,
    features: ['Fits high society: favors charm and image as much as raw power'],
  },
  {
    className: 'enchanter',
    name: 'Whisper-hexer',
    features: ['Favors subtle compulsions; reputation as someone not to be crossed lightly'],
  },
  {
    className: 'illusionist',
    name: 'Stage mage',
    minDexterity: 13,
    features: ['Treats illusions as performance art: smoke, mirror, and voice'],
  },
  {
    className: 'illusionist',
    name: 'Ghost painter',
    features: ["Leans on visual illusions with artistic descriptions and 'false scenery'"],
  },
  {
    className: 'invoker',
    name: 'Elemental purist',
    minConstitution: 14,
    features: ["Picks one element as a 'signature' in flavor, even if mechanics stay broad"],
  },
  {
    className: 'invoker',
    name: 'War-flinger',
    features: ["Loud, destructive reputation; comrades may ask you to 'hold the burst' in fiction"],
  },
  {
    className: 'necromancer',
    name: 'Caretaker of the dead',
    minWisdom: 13,
    features: ['Frames necromancy as rites, consent of spirits, or closure for families'],
  },
  {
    className: 'necromancer',
    name: 'Bone scholar',
    features: ['Collects morbid lore; not necessarily sadistic, but unnerving to NPCs'],
  },
  {
    className: 'transmuter',
    name: 'Alchemic tinkerer',
    minIntelligence: 14,
    features: ['Favors transmutation stories tied to materials, metals, and brews'],
  },
  {
    className: 'transmuter',
    name: 'Form-shaper',
    features: ["Narrative focus on self-transformation and 'perfecting' the body in play"],
  },
  {
    className: 'cleric',
    name: 'Militant priest',
    minStrength: 12,
    features: ['Trains in armor as worship; sermons with a warlike edge'],
  },
  {
    className: 'cleric',
    name: 'Village parson',
    features: ['Known in one region; ties to a single community or small shrine'],
  },
  {
    className: 'druid',
    name: 'Circle of seasons',
    minWisdom: 15,
    features: ['Rituals tied to equinox; strong seasonal story hooks'],
  },
  {
    className: 'druid',
    name: 'Swamp warden',
    features: ['Flavor around wetlands, disease, and thick growth instead of only forests'],
  },
  {
    className: 'bard',
    name: 'Skald',
    minConstitution: 12,
    features: ['Songs of battles and long halls; mead-hall bragging rights in fiction'],
  },
  {
    className: 'bard',
    name: 'Minstrel spy',
    minDexterity: 13,
    features: ['Loves gossip and a good cover; stories double as information trade'],
  },
  {
    className: 'thief',
    name: 'Cutpurse of the bazaar',
    minDexterity: 14,
    features: ["Knows the crowd's rhythm; picks pockets in busy markets in fiction"],
  },
  {
    className: 'thief',
    name: 'Second-story worker',
    features: ['Leans to climbing and rooftop routes more than back-alley brawling'],
  },
];

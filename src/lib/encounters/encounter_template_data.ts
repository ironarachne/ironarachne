import type { EncounterTemplate } from './encounter_types';
import { getGroupTemplateByName } from './encounter_group_templates';

/**
 * The fantasy encounter templates: which groups make up one encounter.
 *
 * Built once at module load, so the `getGroupTemplateByName` lookups resolve then rather than on
 * every call. A name that does not match now fails on import instead of when a template is first
 * asked for, which is the earlier and louder of the two.
 *
 * Shared and read-only.
 */
export const FANTASY_ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  {
    name: 'group of bandits',
    groupTemplates: [getGroupTemplateByName('bandits'), getGroupTemplateByName('bandit leader')],
    tags: ['bandits', 'humanoid'],
  },
  {
    name: 'group of cultists',
    groupTemplates: [getGroupTemplateByName('cultists'), getGroupTemplateByName('cult priest')],
    tags: ['cultists', 'demonic', 'humanoid', 'magic'],
  },
  {
    name: 'group of raiders',
    groupTemplates: [getGroupTemplateByName('raiders'), getGroupTemplateByName('raider captain')],
    tags: ['raiders', 'humanoid'],
  },
  {
    name: 'military patrol',
    groupTemplates: [
      getGroupTemplateByName('squad of soldiers'),
      getGroupTemplateByName('soldier captain'),
    ],
    tags: ['military', 'soldiers', 'humanoid', 'guard', 'fortress'],
  },
  {
    name: 'necromancer and minions',
    groupTemplates: [
      getGroupTemplateByName('necromancer'),
      getGroupTemplateByName('skeleton warriors'),
      getGroupTemplateByName('pack of zombies'),
    ],
    tags: ['undead', 'necromancer', 'tomb', 'crypt', 'magic'],
  },
  {
    name: 'pack of ghouls',
    groupTemplates: [getGroupTemplateByName('pack of ghouls')],
    tags: ['undead', 'ghouls', 'tomb', 'crypt'],
  },
  {
    name: 'lone adventurer',
    groupTemplates: [getGroupTemplateByName('adventurer')],
    tags: ['adventurer', 'humanoid'],
  },
  {
    name: 'party of adventurers',
    groupTemplates: [getGroupTemplateByName('adventurers')],
    tags: ['adventurer', 'humanoid'],
  },
  {
    name: 'lone mage',
    groupTemplates: [getGroupTemplateByName('mage')],
    tags: ['mage', 'magic', 'arcane', 'knowledge', 'library'],
  },
  {
    name: 'wandering monster',
    groupTemplates: [getGroupTemplateByName('wandering creature')],
    tags: ['monster', 'beast', 'monstrosity', 'cave', 'natural', 'underground'],
  },
  {
    name: 'pack of wandering monsters',
    groupTemplates: [getGroupTemplateByName('group of wandering creatures')],
    tags: ['monster', 'beast', 'monstrosity', 'cave', 'natural', 'underground'],
  },
  {
    name: 'temple pilgrimage guard',
    groupTemplates: [
      getGroupTemplateByName('temple acolytes'),
      getGroupTemplateByName('templar knight'),
    ],
    tags: ['humanoid', 'divine', 'guard', 'stronghold', 'magic'],
  },
  {
    name: 'cathedral inquisitors',
    groupTemplates: [
      getGroupTemplateByName('battle abbot'),
      getGroupTemplateByName('templar knight'),
      getGroupTemplateByName('temple acolytes'),
    ],
    tags: ['humanoid', 'divine', 'guard', 'magic'],
  },
  {
    name: 'holy war band',
    groupTemplates: [
      getGroupTemplateByName('battle abbot'),
      getGroupTemplateByName('squad of soldiers'),
    ],
    tags: ['humanoid', 'divine', 'military', 'guard', 'fortress'],
  },
  {
    name: 'templar crusade',
    groupTemplates: [
      getGroupTemplateByName('templar knight'),
      getGroupTemplateByName('temple acolytes'),
      getGroupTemplateByName('soldier captain'),
    ],
    tags: ['humanoid', 'divine', 'military', 'stronghold', 'guard'],
  },
  {
    name: "assassins' meeting",
    groupTemplates: [getGroupTemplateByName('assassin cadre')],
    tags: ['humanoid', 'stealth'],
  },
  {
    name: 'shadow syndicate',
    groupTemplates: [
      getGroupTemplateByName('assassin cadre'),
      getGroupTemplateByName('thieves guild'),
    ],
    tags: ['humanoid', 'stealth'],
  },
  {
    name: 'thieves guild raid',
    groupTemplates: [getGroupTemplateByName('thieves guild')],
    tags: ['humanoid', 'stealth'],
  },
  {
    name: 'druidic ritual',
    groupTemplates: [getGroupTemplateByName('circle of druids')],
    tags: ['humanoid', 'nature', 'magic', 'cave', 'natural'],
  },
  {
    name: 'druid wardens',
    groupTemplates: [
      getGroupTemplateByName('circle of druids'),
      getGroupTemplateByName('templar knight'),
    ],
    tags: ['humanoid', 'nature', 'magic', 'divine'],
  },
  {
    name: 'arcane symposium',
    groupTemplates: [
      getGroupTemplateByName('archmage'),
      getGroupTemplateByName('novice arcanists'),
    ],
    tags: ['magic', 'arcane', 'knowledge', 'library', 'humanoid'],
  },
  {
    name: 'circle of novices',
    groupTemplates: [getGroupTemplateByName('novice arcanists')],
    tags: ['magic', 'arcane', 'knowledge', 'library', 'humanoid'],
  },
  {
    name: 'lone archmage',
    groupTemplates: [getGroupTemplateByName('archmage')],
    tags: ['magic', 'arcane', 'knowledge', 'library', 'humanoid', 'mage'],
  },
  {
    name: 'mage duel',
    groupTemplates: [getGroupTemplateByName('archmage'), getGroupTemplateByName('mage')],
    tags: ['magic', 'arcane', 'knowledge', 'library', 'humanoid'],
  },
  {
    name: 'vampire coterie',
    groupTemplates: [getGroupTemplateByName('vampire spawn')],
    tags: ['undead', 'tomb', 'crypt'],
  },
  {
    name: 'skeleton skirmish line',
    groupTemplates: [getGroupTemplateByName('skeleton skirmishers')],
    tags: ['undead', 'tomb', 'crypt'],
  },
  {
    name: 'mixed undead host',
    groupTemplates: [
      getGroupTemplateByName('pack of zombies'),
      getGroupTemplateByName('skeleton skirmishers'),
    ],
    tags: ['undead', 'tomb', 'crypt'],
  },
  {
    name: 'undead siege crew',
    groupTemplates: [
      getGroupTemplateByName('skeleton warriors'),
      getGroupTemplateByName('pack of zombies'),
    ],
    tags: ['undead', 'tomb', 'crypt'],
  },
  {
    name: "necromancer's vanguard",
    groupTemplates: [
      getGroupTemplateByName('necromancer'),
      getGroupTemplateByName('skeleton skirmishers'),
      getGroupTemplateByName('vampire spawn'),
    ],
    tags: ['undead', 'necromancer', 'tomb', 'crypt', 'magic'],
  },
  {
    name: 'monstrosity lair',
    groupTemplates: [getGroupTemplateByName('pack of monstrosities')],
    tags: ['monstrosity', 'beast', 'cave', 'natural', 'underground'],
  },
  {
    name: 'giant spider nest',
    groupTemplates: [getGroupTemplateByName('giant spider nest')],
    tags: ['beast', 'monstrosity', 'cave', 'natural', 'underground'],
  },
  {
    name: 'wolf pack hunters',
    groupTemplates: [getGroupTemplateByName('wolf pack')],
    tags: ['beast', 'monstrosity', 'cave', 'natural', 'underground'],
  },
  {
    name: 'rat swarm',
    groupTemplates: [getGroupTemplateByName('rat swarm')],
    tags: ['beast', 'cave', 'natural', 'underground', 'monster'],
  },
  {
    name: 'cultist war party',
    groupTemplates: [getGroupTemplateByName('cultists'), getGroupTemplateByName('raiders')],
    tags: ['cultists', 'demonic', 'humanoid', 'magic', 'raiders'],
  },
];

import type { EncounterTemplate } from "./encounter_types";
import { getGroupTemplateByName } from "./encounter_group_templates";

export function getAllFantasyEncounterTemplates(): EncounterTemplate[] {
  return [
    {
      name: "group of bandits",
      groupTemplates: [
        getGroupTemplateByName("bandits"),
        getGroupTemplateByName("bandit leader"),
      ],
      tags: ['bandits'],
    },
    {
      name: "group of cultists",
      groupTemplates: [
        getGroupTemplateByName("cultists"),
        getGroupTemplateByName("cult priest"),
      ],
      tags: ['cultists'],
    },
    {
      name: "group of raiders",
      groupTemplates: [
        getGroupTemplateByName("raiders"),
        getGroupTemplateByName("raider captain"),
      ],
      tags: ['raiders'],
    },
    {
      name: "military patrol",
      groupTemplates: [
        getGroupTemplateByName("squad of soldiers"),
        getGroupTemplateByName("soldier captain"),
      ],
      tags: ['military', 'soldiers'],
    },
    {
      name: "necromancer and minions",
      groupTemplates: [
        getGroupTemplateByName("necromancer"),
        getGroupTemplateByName("skeleton warriors"),
        getGroupTemplateByName("pack of zombies"),
      ],
      tags: ['undead', 'necromancer'],
    },
    {
      name: "pack of ghouls",
      groupTemplates: [
        getGroupTemplateByName("pack of ghouls"),
      ],
      tags: ['undead', 'ghouls'],
    },
    {
      name: "lone adventurer",
      groupTemplates: [
        getGroupTemplateByName("adventurer"),
      ],
      tags: ['adventurer'],
    },
    {
      name: "party of adventurers",
      groupTemplates: [
        getGroupTemplateByName("adventurers"),
      ],
      tags: ['adventurer'],
    },
    {
      name: "lone mage",
      groupTemplates: [
        getGroupTemplateByName("mage"),
      ],
      tags: ['mage'],
    },
    {
      name: "wandering monster",
      groupTemplates: [
        getGroupTemplateByName("wandering creature"),
      ],
      tags: ['monster'],
    },
    {
      name: "pack of wandering monsters",
      groupTemplates: [
        getGroupTemplateByName("group of wandering creatures"),
      ],
      tags: ['monster'],
    }
  ]
}

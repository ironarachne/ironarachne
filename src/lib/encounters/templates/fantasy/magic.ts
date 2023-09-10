import * as Archetypes from "$lib/archetypes/archetypes.js";
import * as FantasyArchetypes from "$lib/archetypes/fantasy/all.js";
import MobFilter from "$lib/mobs/filter.js";
import type EncounterTemplate from "../../encounter_template";

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();

  return [
    {
      name: "archmage",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "archmage",
          threatLevel: 5,
          isSentient: true,
          archetypes: [Archetypes.byName("archmage", allArchetypes)],
          filter: new MobFilter([], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ["mage", "magic"],
      commonality: 1,
    },
    {
      name: "mage",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "mage",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("mage", allArchetypes)],
          filter: new MobFilter([], [], "humanoid", "", ["skeleton", "zombie"]),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ["mage", "magic"],
      commonality: 5,
    },
  ];
}

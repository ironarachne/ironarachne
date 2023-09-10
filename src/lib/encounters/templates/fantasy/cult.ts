import * as Archetypes from "$lib/archetypes/archetypes.js";
import * as FantasyArchetypes from "$lib/archetypes/fantasy/all.js";
import MobFilter from "$lib/mobs/filter.js";
import type EncounterTemplate from "../../encounter_template.js";

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();
  return [
    {
      name: "group of cult acolytes",
      threatLevel: 1,
      groupTemplates: [
        {
          name: "cult acolytes",
          threatLevel: 1,
          isSentient: true,
          archetypes: [Archetypes.byName("cult acolyte", allArchetypes)],
          filter: new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ["cult"],
      commonality: 50,
    },
    {
      name: "group of lesser demons",
      threatLevel: 4,
      groupTemplates: [
        {
          name: "lesser demons",
          threatLevel: 2,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter(["demon"], [], "", "", []),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ["cult", "demonic"],
      commonality: 1,
    },
    {
      name: "cult priest",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "cult priest",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("cult priest", allArchetypes)],
          filter: new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ["cult"],
      commonality: 20,
    },
    {
      name: "cult high priest",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "cult high priest",
          threatLevel: 5,
          isSentient: true,
          archetypes: [Archetypes.byName("cult high priest", allArchetypes)],
          filter: new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ["cult"],
      commonality: 15,
    },
  ];
}

import * as Archetypes from "$lib/archetypes/archetypes.js";
import * as FantasyArchetypes from "$lib/archetypes/fantasy/all.js";
import MobFilter from "$lib/mobs/filter.js";
import type EncounterTemplate from "../../encounter_template.js";

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();
  return [
    {
      name: "group of raiders",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "raider captain",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("raider captain", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1,
        },
        {
          name: "raiders",
          threatLevel: 3,
          isSentient: true,
          archetypes: [Archetypes.byName("raider", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 3,
          maxNumber: 6,
        },
      ],
      tags: ["bandits"],
      commonality: 5,
    },
    {
      name: "group of looters",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "looters",
          threatLevel: 3,
          isSentient: true,
          archetypes: [Archetypes.byName("thug", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 3,
          maxNumber: 6,
        },
      ],
      tags: ["bandits"],
      commonality: 5,
    },
    {
      name: "group of thugs",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "thugs",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("thug", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ["bandits"],
      commonality: 5,
    },
  ];
}

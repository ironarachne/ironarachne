import * as Archetypes from "$lib/archetypes/archetypes.js";
import * as FantasyArchetypes from "$lib/archetypes/fantasy/all.js";
import MobFilter from "$lib/mobs/filter.js";
import type EncounterTemplate from "../../encounter_template.js";

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();

  return [
    {
      name: "squad of soldiers",
      threatLevel: 1,
      groupTemplates: [
        {
          name: "soldiers",
          threatLevel: 1,
          isSentient: true,
          archetypes: [Archetypes.byName("soldier", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ["martial", "soldiers"],
      commonality: 10,
    },
    {
      name: "squad of veterans",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "veteran soldiers",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("veteran soldier", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ["martial", "soldiers"],
      commonality: 5,
    },
    {
      name: "captain",
      threatLevel: 4,
      groupTemplates: [
        {
          name: "captain",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("captain", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1,
        },
        {
          name: "veteran soldiers",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("veteran soldier", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ["martial", "soldiers"],
      commonality: 3,
    },
    {
      name: "general",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "general",
          threatLevel: 3,
          isSentient: true,
          archetypes: [Archetypes.byName("general", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1,
        },
        {
          name: "captain",
          threatLevel: 2,
          isSentient: true,
          archetypes: [Archetypes.byName("captain", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 2,
        },
      ],
      tags: ["martial", "soldiers"],
      commonality: 2,
    },
  ];
}

import * as Archetypes from "$lib/archetypes/archetypes.js";
import * as FantasyArchetypes from "$lib/archetypes/fantasy/all.js";
import MobFilter from "$lib/mobs/filter.js";
import type EncounterTemplate from "../../encounter_template.js";

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();

  return [
    {
      name: "group of hunters",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "hunters",
          threatLevel: 3,
          isSentient: true,
          archetypes: [Archetypes.byName("hunter", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 3,
          maxNumber: 6,
        },
      ],
      tags: ["hunters"],
      commonality: 5,
    },
    {
      name: "lone hunter",
      threatLevel: 1,
      groupTemplates: [
        {
          name: "hunter",
          threatLevel: 1,
          isSentient: true,
          archetypes: [Archetypes.byName("hunter", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ["hunters"],
      commonality: 1,
    },
    {
      name: "swarming insects",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "swarming insects",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter(["swarm"], [], "", "", []),
          minNumber: 3,
          maxNumber: 8,
        },
      ],
      tags: ["insect swarm"],
      commonality: 5,
    },
    {
      name: "wandering creature",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "wandering creature",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter([], [], "", "", []),
          minNumber: 1,
          maxNumber: 1,
        },
      ],
      tags: ["wandering creature"],
      commonality: 10,
    },
    {
      name: "group of wandering creatures",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "wandering creatures",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter([], [], "", "", []),
          minNumber: 2,
          maxNumber: 4,
        },
      ],
      tags: ["wandering creature"],
      commonality: 10,
    },
  ];
}

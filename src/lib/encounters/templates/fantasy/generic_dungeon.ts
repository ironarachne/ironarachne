import MobFilter from "$lib/mobs/filter.js";
import type EncounterTemplate from "../../encounter_template.js";

export function all(): EncounterTemplate[] {
  return [
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
      tags: ["insects"],
      commonality: 5,
    },
    {
      name: "wandering creature",
      threatLevel: 2,
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
      commonality: 40,
    },
    {
      name: "group of wandering creatures",
      threatLevel: 4,
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
      commonality: 30,
    },
  ];
}

"use strict";

import * as Archetypes from "../../../archetypes/archetypes.js";
import * as FantasyArchetypes from "../../../archetypes/fantasy/all.js";
import MobFilter from "../../../mobs/filter.js";
import EncounterGroupTemplate from "../../grouptemplate.js";
import EncounterTemplate from "../../template.js";

export function all(): EncounterTemplate[] {
  let allArchetypes = FantasyArchetypes.all();

  return [
    new EncounterTemplate(
      "group of hunters",
      3,
      [
        new EncounterGroupTemplate(
          "hunters",
          3,
          true,
          [Archetypes.byName("hunter", allArchetypes)],
          new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          3,
          6,
        ),
      ],
      ["hunters"],
      5,
    ),
    new EncounterTemplate(
      "lone hunter",
      1,
      [
        new EncounterGroupTemplate(
          "hunter",
          1,
          true,
          [Archetypes.byName("hunter", allArchetypes)],
          new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          1,
          1,
        ),
      ],
      ["hunters"],
      1,
    ),
    new EncounterTemplate(
      "swarming insects",
      3,
      [
        new EncounterGroupTemplate(
          "swarming insects",
          3,
          false,
          [],
          new MobFilter(["swarm"], [], "", "", []),
          3,
          8,
        ),
      ],
      ["insect swarm"],
      5,
    ),
    new EncounterTemplate(
      "wandering creature",
      3,
      [
        new EncounterGroupTemplate(
          "wandering creature",
          3,
          false,
          [],
          new MobFilter([], [], "", "", []),
          1,
          1,
        ),
      ],
      ["wandering creature"],
      10,
    ),
    new EncounterTemplate(
      "group of wandering creatures",
      5,
      [
        new EncounterGroupTemplate(
          "wandering creatures",
          3,
          false,
          [],
          new MobFilter([], [], "", "", []),
          2,
          4,
        ),
      ],
      ["wandering creature"],
      10,
    ),
  ];
}

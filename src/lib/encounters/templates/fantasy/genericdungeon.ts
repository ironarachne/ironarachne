"use strict";

import Archetype from "../../../archetypes/archetype.js";
import * as ItemGenerators from "../../../equipment/generators.js";
import MobFilter from "../../../mobs/filter.js";
import EncounterGroupTemplate from "../../grouptemplate.js";
import EncounterTemplate from "../../template.js";

export function all(): EncounterTemplate[] {
  return [
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
      ["insects"],
      5,
    ),
    new EncounterTemplate(
      "wandering creature",
      2,
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
      40,
    ),
    new EncounterTemplate(
      "group of wandering creatures",
      4,
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
      30,
    ),
  ];
}

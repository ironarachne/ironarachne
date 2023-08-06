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
      "group of cult acolytes",
      1,
      [
        new EncounterGroupTemplate(
          "cult acolytes",
          1,
          true,
          [Archetypes.byName("cult acolyte", allArchetypes)],
          new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          2,
          4,
        ),
      ],
      ["cult"],
      50,
    ),
    new EncounterTemplate(
      "group of lesser demons",
      4,
      [
        new EncounterGroupTemplate(
          "lesser demons",
          2,
          false,
          [],
          new MobFilter(["demon"], [], "", "", []),
          2,
          4,
        ),
      ],
      ["cult", "demonic"],
      1,
    ),
    new EncounterTemplate(
      "cult priest",
      2,
      [
        new EncounterGroupTemplate(
          "cult priest",
          2,
          true,
          [Archetypes.byName("cult priest", allArchetypes)],
          new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          1,
          1,
        ),
      ],
      ["cult"],
      20,
    ),
    new EncounterTemplate(
      "cult high priest",
      5,
      [
        new EncounterGroupTemplate(
          "cult high priest",
          5,
          true,
          [Archetypes.byName("cult high priest", allArchetypes)],
          new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          1,
          1,
        ),
      ],
      ["cult"],
      15,
    ),
  ];
}

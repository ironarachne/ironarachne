"use strict";

import * as RND from "@ironarachne/rng";
import RoomFeatureGenerator from "./featuregenerator.js";

function all(): RoomFeatureGenerator[] {
  return [
    new RoomFeatureGenerator(
      "boxes",
      [
        "There are several boxes in one corner here.",
        "This room has a number of boxes of various sizes.",
        "A bunch of boxes are strewn about here.",
        "There are many wooden crates here.",
      ],
      [],
      true,
    ),
    new RoomFeatureGenerator("bookcase", ["There is a bookcase here."], [], true),
    new RoomFeatureGenerator("table", ["There is a table here."], [], false),
    new RoomFeatureGenerator(
      "chair",
      [
        `There is a ${RND.item(["broken", "busted", "simple", "turned-over"])} chair here.`,
        `There is ${RND.item(["an ornate", "a decorated", "a carved"])} chair here.`,
      ],
      [],
      false,
    ),
    new RoomFeatureGenerator("bench", ["There is a bench here."], [], false),
    new RoomFeatureGenerator(
      "chest",
      [
        "There is "
        + RND.item(["an ornate", "a simple", "a large", "an iron-bound", "a small"])
        + " chest here.",
      ],
      [],
      true,
    ),
  ];
}

export function random(): RoomFeatureGenerator {
  let generators = all();

  return RND.item(generators);
}

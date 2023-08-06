"use strict";

import RoomFeatureGenerator from "../features/featuregenerator.js";
import Room from "../room.js";
import RoomMutator from "./mutator.js";

export function all(): RoomMutator[] {
  return [
    new RoomMutator(
      "brazier",
      (room: Room) => {
        let featureGenerator = new RoomFeatureGenerator(
          "brazier",
          [
            "There is a large lit brazier in the middle of the room.",
            "There are lit braziers around the room here.",
          ],
          [],
          false,
        );
        room.features.push(featureGenerator.generate());
        room.lightLevel += 2;

        return room;
      },
      ["light"],
    ),
    new RoomMutator(
      "torches",
      (room: Room) => {
        let featureGenerator = new RoomFeatureGenerator(
          "torches",
          ["Torches line the walls.", "A few torches sit in sconces on the walls."],
          [],
          false,
        );
        room.features.push(featureGenerator.generate());
        room.lightLevel += 1;

        return room;
      },
      ["light"],
    ),
  ];
}

export function withName(name: string, mutators: RoomMutator[]): RoomMutator {
  for (let i = 0; i < mutators.length; i++) {
    if (mutators[i].name == name) {
      return mutators[i];
    }
  }

  throw new Error(`Failed to find mutator with name ${name}.`);
}

export function withTag(tag: string, mutators: RoomMutator[]): RoomMutator[] {
  let result = [];

  for (let i = 0; i < mutators.length; i++) {
    if (mutators[i].tags.includes(tag)) {
      result.push(mutators[i]);
    }
  }

  return result;
}

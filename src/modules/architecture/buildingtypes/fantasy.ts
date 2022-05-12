"use strict";

import Range from "../../range";
import BuildingType from "../buildingtype";
import RoomSpec from "../roomspec";
import RoomType from "../roomtype";

export function all(): BuildingType[] {
  return [
    new BuildingType(
      "small house",
      "residence",
      new Range(1, 1),
      [
        new RoomSpec(
          new RoomType(
            "common room",
            "living",
            new Range(2, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "bedroom",
            "sleeping",
            new Range(1, 1),
            new Range(1, 1),
            new Range(2, 4),
            new Range(2, 4),
          ),
          new Range(1, 1),
        ),
      ],
    ),
    new BuildingType(
      "medium house",
      "residence",
      new Range(1, 1),
      [
        new RoomSpec(
          new RoomType(
            "kitchen",
            "food preparation",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "dining room",
            "eating",
            new Range(2, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "bedroom",
            "sleeping",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 2),
        ),
      ],
    ),
    new BuildingType(
      "large house",
      "residence",
      new Range(1, 2),
      [
        new RoomSpec(
          new RoomType(
            "kitchen",
            "food preparation",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "dining room",
            "eating",
            new Range(2, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "bedroom",
            "sleeping",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(2, 4),
        ),
        new RoomSpec(
          new RoomType(
            "washroom",
            "relief",
            new Range(1, 4),
            new Range(1, 1),
            new Range(2, 4),
            new Range(2, 4),
          ),
          new Range(1, 2),
        ),
      ],
    ),
    new BuildingType(
      "manor house",
      "residence",
      new Range(1, 3),
      [
        new RoomSpec(
          new RoomType(
            "kitchen",
            "food preparation",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 2),
        ),
        new RoomSpec(
          new RoomType(
            "dining room",
            "eating",
            new Range(2, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "bedroom",
            "sleeping",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(4, 6),
        ),
        new RoomSpec(
          new RoomType(
            "washroom",
            "relief",
            new Range(1, 4),
            new Range(1, 1),
            new Range(2, 4),
            new Range(2, 4),
          ),
          new Range(3, 4),
        ),
        new RoomSpec(
          new RoomType(
            "pantry",
            "food storage",
            new Range(1, 4),
            new Range(1, 1),
            new Range(2, 4),
            new Range(2, 4),
          ),
          new Range(1, 2),
        ),
      ],
    ),
    new BuildingType(
      "tavern",
      "community",
      new Range(1, 1),
      [
        new RoomSpec(
          new RoomType(
            "common room",
            "eating",
            new Range(2, 4),
            new Range(1, 1),
            new Range(10, 20),
            new Range(10, 20),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "kitchen",
            "food preparation",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 2),
        ),
      ],
    ),
    new BuildingType(
      "inn",
      "community",
      new Range(1, 2),
      [
        new RoomSpec(
          new RoomType(
            "common room",
            "eating",
            new Range(2, 4),
            new Range(1, 1),
            new Range(10, 20),
            new Range(10, 20),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "kitchen",
            "food preparation",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 2),
        ),
        new RoomSpec(
          new RoomType(
            "bedroom",
            "sleeping",
            new Range(1, 4),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(4, 10),
        ),
      ],
    ),
    new BuildingType(
      "church",
      "religion",
      new Range(1, 2),
      [
        new RoomSpec(
          new RoomType(
            "sanctuary",
            "worship",
            new Range(2, 4),
            new Range(1, 2),
            new Range(10, 20),
            new Range(10, 20),
          ),
          new Range(1, 1),
        ),
        new RoomSpec(
          new RoomType(
            "vestry",
            "storage",
            new Range(1, 2),
            new Range(1, 1),
            new Range(3, 4),
            new Range(3, 4),
          ),
          new Range(1, 1),
        ),
      ],
    ),
  ];
}

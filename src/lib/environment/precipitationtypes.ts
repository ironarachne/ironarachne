"use strict";

import PrecipitationType from "./precipitationtype.js";

export function all(): PrecipitationType[] {
  return [
    new PrecipitationType(
      "rain",
      [
        "Rain here is light.",
        "When it happens, rain is light.",
        "Rainstorms are uncommon. Precipitation here is rare.",
        "Light rainstorms are frequent here.",
      ],
      [
        "Storms producing sheets of rain are common.",
        "Rainstorms are common.",
        "The rain here is particularly heavy.",
      ],
      [
        "Torrential downpours are common.",
        "Monsoons in this area are problematic.",
        "Flooding caused by heavy rains is common.",
      ],
    ),
    new PrecipitationType(
      "snow",
      ["The occasional dusting of snow happens.", "Snow is light but not uncommon."],
      [
        "Heavy snows are not unheard of.",
        "Snow is common here.",
        "Though not usually heavy, snow is frequent here.",
      ],
      [
        "Blizzards are common in the colder months.",
        "Heavy, wet snow falls in the winter.",
        "White-out blizzards are not uncommon here.",
      ],
    ),
  ];
}

export function byName(name: string): PrecipitationType {
  const options = all();

  for (let i = 0; i < options.length; i++) {
    if (options[i].name == name) {
      return options[i];
    }
  }

  throw new Error("Invalid precipitation type name.");
}

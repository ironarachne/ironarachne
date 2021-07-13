import Biome from "./biome";
import * as RND from "../random";

export function all(): Biome[] {
  return [
    new Biome("desert", 10, 1, 1, false, [
      "The sun blasts this desert region.",
      "This area is a vast, hot desert.",
      "This desert is made up of rocky cliffs, dry riverbeds, and sand dunes.",
    ],
      [
        "A large oasis is the focus of this area.",
        "The sand dunes here resemble vast rolling seas.",
      ],
      [
        "Sandstorms are frequent and violent here.",
        "Infrequent flash floods are both the bane and lifeblood of people here.",
      ]),
    new Biome("deciduous forest", 5, 3, 5, false, [
      "This is an old forest region. Some of the trees here are bigger around than ten men linking arms could wrap around.",
      "Deciduous trees cover this area. Thick canopies give way to the occasional meadow.",
      "This forest is filled with big oaks and ample wildlife.",
    ],
      [
        "There is a large meadow here within an otherwise endless expanse of trees.",
        "Large, ancient oaks grow around here.",
      ],
      [
        "Occasional thunderstorms roll through this area.",
        "Rainstorms here are brief but intense.",
      ]),
    new Biome("coniferous forest", 4, 3, 5, false, [
      "This is an old forest region. Some of the trees here are bigger around than ten men linking arms could wrap around.",
      "Coniferous trees cover this area. Thick canopies give way to the occasional meadow.",
      "This forest is filled with conifers and light underbrush.",
    ],
      [
        "The pine trees here grow tall.",
        "Vast areas of forest are broken occasionally by short, rocky cliffs.",
      ],
      [
        "The rain here is particularly heavy.",
        "Light rainstorms are frequent here.",
      ]),
    new Biome("rainforest", 7, 3, 9, false, [
      "This tropical rainforest is filled with lush vegetation.",
      "The heat of this rainforest is oppressive, but the thick canopy and frequent rains provide relief.",
      "Heavy rains, hot temperatures, and rampant predators make this jungle difficult to live in.",
    ],
      [
        "This area has beautiful waterfalls in between lush jungle foliage.",
        "A wide variety of colorful animals make their home here.",
      ],
      [
        "Torrential downpours are common.",
        "Monsoons in this area are problematic.",
      ]),
    new Biome("grassland", 6, 2, 4, false, [
      "This area's broad open spaces are covered in tall grasses.",
      "Low rolling hills make up this region.",
      "The occasional hill breaks up what is otherwise a vast expanse of flat grassland.",
    ],
      [
        "The tall grasses here resemble ocean waves in the breeze.",
        "Wild horses are common here.",
      ],
      [
        "Cloudless days are common here.",
        "Rain is infrequent, but when it comes, the wind makes the storms violent.",
        "This area is extremely windy.",
      ]),
    new Biome("mountain", 3, 10, 2, false, [
      "This is a craggy mountainous region, with few trees and a lot of shrubs.",
      "This mountain area is covered in coniferous trees.",
      "This region is high in the mountains.",
    ],
      [
        "Sheer cliffs are common here.",
        "An unusual number of trees grow here on the side of the mountain.",
        "This area is heavily forested, despite the extreme elevation.",
      ],
      [
        "Rain is common and cold here.",
        "The cold and biting wind makes life here hard.",
      ]),
  ];
}

export function random(): Biome {
  return RND.item(all());
}

"use strict";

import * as RND from "./random";
import * as Words from "./words";

export function generate() {
  let description = `${Words.capitalize(randomIntro())} ${randomOrigin()} ${randomTwist()}`;

  return description;
}

function randomSize() {
  return RND.item([
    "gigantic",
    "immense",
    "large",
    "huge",
    "colossal",
    "vast",
  ]);
}

function randomShip() {
  return RND.item([
    "derelict",
    "freighter",
    "hulk",
    "mining vessel",
    "warship",
    "passenger liner",
    "merchant ship",
  ]);
}

function randomIntro() {
  let size = randomSize();
  let part1 = RND.item([
    `${Words.article(size)} ${size} ${randomShip()} ${RND.item(["drifts", "floats"])} in space ${RND.item(["in front of you", "here"])}, `,
    `a ${randomShip()} of ${size} proportions is adrift here, `,
  ]);

  let part2 = RND.item([
    "its outer hull breached in several places.",
    "surrounded by strange, dancing lights.",
    "partially obscured by a thick, dark nebula.",
    "its hull shattered and fragmented.",
    "floating endlessly in the vast nothinginess of space.",
    "floating in a cloud of debris.",
    "inexorably being drawn towards a nearby star.",
  ]);

  return part1 + part2;
}

function randomOrigin() {
  return RND.item([
    "It matches no known ship design you've ever seen.",
    "It appears to be of an ancient design.",
    "There is something distinctly alien about its features.",
    "The ship's contours make it seem familiar, but all identification is obscured or destroyed.",
    "While the ship's design is familiar, it appears to have been heavily modified.",
    "The ship's barely recognizable but it is definitely a model familiar to you.",
  ]);
}

function randomTwist() {
  return RND.item([
    "Strangely, you are getting life readings from deep within it...",
    "There appears to be an active power source somewhere on the ship.",
    "A distress beacon from the ship beeps weakly.",
    "There is evidence of a fire fight, but the weapon marks match nothing in your experience.",
    "Gashes have been ripped in the hull in some places. They appear to be made by... claws?",
    "Thick layers of ice surround several rips in the hull.",
    "Faint filaments of light surround the vessel, reminiscent of string loosely tangled around something.",
    "Several holes have been burned into the hull. The burn marks are consistent with damage caused by acid.",
    "Fire has consumed several sections of the ship, but it appears that some compartments still hold atmosphere.",
  ]);
}

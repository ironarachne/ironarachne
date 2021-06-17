"use strict";

const random = require("random");

export function render(width, height) {
  let svg =
    "<svg width=\"" +
    width +
    "\" height=\"" +
    height +
    "\" viewBox=\"0 0 " +
    width +
    " " +
    height +
    "\">";

  svg += "<rect width=\"" + width + "\" height=\"" + height + "\" fill=\"black\" />";

  let numberOfStars = Math.floor(width * height * 0.005);

  for (let i = 0; i < numberOfStars; i++) {
    let x = random.int(0, width);
    let y = random.int(0, height);

    svg +=
      "<rect x=\"" +
      x +
      "\" y=\"" +
      y +
      "\" width=\"1\" height=\"1\" fill=\"" +
      randomStarColor() +
      "\" />";
  }

  svg += "</svg>";

  return svg;
}

function randomStarColor() {
  let colorBase = random.int(80, 180);

  let r = colorBase;
  let g = colorBase;
  let b = colorBase;

  let tweaked = false;

  let tweakBlueChance = random.int(1, 100);
  if (tweakBlueChance > 70 && tweaked === false) {
    b += random.int(10, 20);
    tweaked = true;
  }

  let tweakRedChance = random.int(1, 100);
  if (tweakRedChance > 70 && tweaked == false) {
    r += random.int(10, 20);
    tweaked = true;
  }

  let tweakGreenChance = random.int(1, 100);
  if (tweakGreenChance > 70 && tweaked == false) {
    g += random.int(10, 20);
    tweaked = true;
  }

  return "rgb(" + r + "," + g + "," + b + ")";
}

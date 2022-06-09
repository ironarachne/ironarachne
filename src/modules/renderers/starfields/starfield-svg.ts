'use strict';

import random from 'random';

export default class SVGStarfieldRenderer {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  render(): string {
    let svg =
      '<svg width="' +
      this.width +
      '" height="' +
      this.height +
      '" viewBox="0 0 ' +
      this.width +
      ' ' +
      this.height +
      '">';

    svg += '<rect width="' + this.width + '" height="' + this.height + '" fill="black" />';

    const numberOfStars = Math.floor(this.width * this.height * 0.005);

    for (let i = 0; i < numberOfStars; i++) {
      const x = random.int(0, this.width);
      const y = random.int(0, this.height);

      svg +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="1" height="1" fill="' +
        randomStarColor() +
        '" />';
    }

    svg += '</svg>';

    return svg;
  }
}

function randomStarColor() {
  const colorBase = random.int(80, 180);

  let r = colorBase;
  let g = colorBase;
  let b = colorBase;

  let tweaked = false;

  const tweakBlueChance = random.int(1, 100);
  if (tweakBlueChance > 70 && tweaked === false) {
    b += random.int(10, 20);
    tweaked = true;
  }

  const tweakRedChance = random.int(1, 100);
  if (tweakRedChance > 70 && tweaked == false) {
    r += random.int(10, 20);
    tweaked = true;
  }

  const tweakGreenChance = random.int(1, 100);
  if (tweakGreenChance > 70 && tweaked == false) {
    g += random.int(10, 20);
    tweaked = true;
  }

  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

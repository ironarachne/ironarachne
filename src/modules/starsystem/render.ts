'use strict';

import random from 'random';

export function renderPlanet(
  width: number,
  height: number,
  texture: string,
  hasAtmosphere: boolean,
  atmosphereColor: string,
  sizeClass: string,
) {
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  const planetId = random.int(0, 1000);

  const min = Math.min(width, height);

  let radius = (Math.floor(min) * random.float(0.8, 0.9)) / 2;

  if (sizeClass === 'small') {
    radius = (Math.floor(min) * random.float(0.2, 0.4)) / 2;
  } else if (sizeClass === 'medium') {
    radius = (Math.floor(min) * random.float(0.5, 0.7)) / 2;
  }

  const atmosphereRadius = Math.floor(radius * 1.1);

  const background = renderStarfield(width, height);

  let svg =
    '<svg width="' +
    width +
    '" height="' +
    height +
    '" viewBox="0 0 ' +
    width +
    ' ' +
    height +
    '">';

  svg += '<defs>';

  svg +=
    '<radialGradient id="atmosphere-' +
    planetId +
    '"><stop offset="95%" stop-color="' +
    atmosphereColor +
    '" stop-opacity="0.8" /><stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" /></radialGradient>';

  svg +=
    '<radialGradient id="planetShadow" cx="0.5" cy="0.5" r="0.75" fx="0.275" fy="0.275"><stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0" /><stop offset="80%" stop-color="rgb(0,0,70)" stop-opacity="0.8" /><stop offset="90%" stop-color="rgb(0,0,0)" stop-opacity="0.8" /><stop offset="100%" stop-color="rgb(0,00,40)" stop-opacity="0.6" /></radialGradient>';

  svg +=
    '<pattern id="planetTexture-' +
    planetId +
    '" x="0" y="0" width="1" height="1">' +
    texture +
    '</pattern>';

  svg += '</defs>';

  svg += background;

  if (hasAtmosphere) {
    svg +=
      '<circle cx="' +
      midX +
      '" cy="' +
      midY +
      '" r="' +
      atmosphereRadius +
      '" fill="url(#atmosphere-' +
      planetId +
      ')" />';
  }

  svg +=
    '<circle cx="' +
    midX +
    '" cy="' +
    midY +
    '" r="' +
    radius +
    '" fill="url(#planetTexture-' +
    planetId +
    ')" />';

  svg +=
    '<circle cx="' + midX + '" cy="' + midY + '" r="' + radius + '" fill="url(#planetShadow)" />';

  return svg;
}

export function renderStar(width: number, height: number, color: string, classification: string) {
  let starColor = '';

  if (color == 'red') {
    starColor = 'rgb(255,43,10)';
  } else if (color == 'orange') {
    starColor = 'rgb(255,146,20)';
  } else if (color == 'yellow') {
    starColor = 'rgb(255,223,18)';
  } else if (color == 'yellow-white') {
    starColor = 'rgb(251, 255, 168)';
  } else if (color == 'white') {
    starColor = 'rgb(255,255,255)';
  } else if (color == 'blue-white') {
    starColor = 'rgb(198, 243, 247)';
  } else if (color == 'blue') {
    starColor = 'rgb(59,118,255)';
  }

  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  const min = Math.min(width, height);
  let radius = (Math.floor(min) * random.float(0.2, 0.4)) / 2;

  if (classification == 'main sequence') {
    radius = (Math.floor(min) * random.float(0.6, 0.7)) / 2;
  } else if (classification == 'giant') {
    radius = (Math.floor(min) * random.float(0.8, 0.9)) / 2;
  } else if (classification == 'supergiant') {
    radius = (Math.floor(min) * random.float(0.9, 1.1)) / 2;
  }

  const glowRadius = Math.floor(radius * 1.4);

  const background = renderStarfield(width, height);

  let svg =
    '<svg width="' +
    width +
    '" height="' +
    height +
    '" viewBox="0 0 ' +
    width +
    ' ' +
    height +
    '">';

  svg +=
    '<defs><radialGradient id="starglow"><stop offset="60%" stop-color="' +
    starColor +
    '" stop-opacity="0.8" /><stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" /></radialGradient></defs>';

  svg += '<filter id="starSurface">';
  svg +=
    '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="' +
    starColor +
    '" result="base" />';
  svg += '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />';
  svg += '<feBlend in2="base" in="noise" mode="multiply" />';
  svg += '</filter>';

  svg += `<mask id="starMask"><circle cx="${midX}" cy="${midY}" r="${radius}" fill="white" /></mask>`;

  svg += background;

  svg +=
    '<circle cx="' + midX + '" cy="' + midY + '" r="' + glowRadius + '" fill="url(#starglow)" />';

  svg +=
    '<circle cx="' +
    midX +
    '" cy="' +
    midY +
    '" r="' +
    radius +
    '" fill="' +
    starColor +
    '" filter="url(#starSurface)" mask="url(#starMask)" />';

  svg += '</svg>';

  return svg;
}

export function renderStarfield(width: number, height: number) {
  let svg =
    '<svg width="' +
    width +
    '" height="' +
    height +
    '" viewBox="0 0 ' +
    width +
    ' ' +
    height +
    '">';

  svg += '<rect width="' + width + '" height="' + height + '" fill="black" />';

  const numberOfStars = Math.floor(width * height * 0.005);

  for (let i = 0; i < numberOfStars; i++) {
    const x = random.int(0, width);
    const y = random.int(0, height);

    svg +=
      '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + randomStarColor() + '" />';
  }

  svg += '</svg>';

  return svg;
}

function randomStarColor() {
  const colorBase = random.int(80, 180);

  let r = colorBase;
  let g = colorBase;
  let b = colorBase;

  let tweaked = false;

  const tweakBlueChance = random.int(1, 100);
  if (tweakBlueChance > 70 && !tweaked) {
    b += random.int(10, 20);
    tweaked = true;
  }

  const tweakRedChance = random.int(1, 100);
  if (tweakRedChance > 70 && !tweaked) {
    r += random.int(10, 20);
    tweaked = true;
  }

  const tweakGreenChance = random.int(1, 100);
  if (tweakGreenChance > 70 && !tweaked) {
    g += random.int(10, 20);
  }

  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

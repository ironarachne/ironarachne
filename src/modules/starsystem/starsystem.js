import * as iarnd from "../random.js";
import * as StarSystemRender from "./render.js";
import * as StarSystemName from "./name.js";
import * as Words from "../words.js";

const random = require("random");

export function generate() {
  let starsystem = {
    name: "",
    description: "",
    stars: [],
    planets: [],
  };

  let graphicWidth = 128;
  let graphicHeight = 128;

  starsystem.name = StarSystemName.generate();

  let star = randomStar(graphicWidth, graphicHeight);
  star.name = starsystem.name;
  star.svg = StarSystemRender.renderStar(
    graphicWidth,
    graphicHeight,
    star.color,
    star.classification
  );

  starsystem.stars.push(star);

  let numberOfInnerPlanets = random.int(star.minInner, star.maxInner);
  let numberOfGoldilocksPlanets = random.int(
    star.minGoldilocks,
    star.maxGoldilocks
  );
  let numberOfOuterPlanets = random.int(star.minOuter, star.maxOuter);

  let planetCount = 0;

  for (let i = 0; i < numberOfInnerPlanets; i++) {
    let planetType = randomInnerPlanetType();
    let planet = randomPlanet(planetType);
    planet.name = starsystem.name + " " + Words.romanize(planetCount - 1);
    let planetTexture = planetType.renderSVG();
    planet.svg = StarSystemRender.renderPlanet(
      graphicWidth,
      graphicHeight,
      planetTexture,
      planetType.hasAtmosphere,
      planetType.sizeClass
    );
    planetCount++;
    starsystem.planets.push(planet);
  }

  for (let i = 0; i < numberOfGoldilocksPlanets; i++) {
    let planetType = randomGoldilocksPlanetType();
    let planet = randomPlanet(planetType);
    planet.name = starsystem.name + " " + Words.romanize(planetCount);
    let planetTexture = planetType.renderSVG();
    planet.svg = StarSystemRender.renderPlanet(
      graphicWidth,
      graphicHeight,
      planetTexture,
      planetType.hasAtmosphere,
      planetType.sizeClass
    );
    planetCount++;
    starsystem.planets.push(planet);
  }

  for (let i = 0; i < numberOfOuterPlanets; i++) {
    let planetType = randomOuterPlanetType();
    let planet = randomPlanet(planetType);
    planet.name = starsystem.name + " " + Words.romanize(planetCount);
    let planetTexture = planetType.renderSVG();
    planet.svg = StarSystemRender.renderPlanet(
      graphicWidth,
      graphicHeight,
      planetTexture,
      planetType.hasAtmosphere,
      planetType.sizeClass
    );
    planetCount++;
    starsystem.planets.push(planet);
  }

  starsystem.description =
    "The " + starsystem.name + " system has " + planetCount + " planets";

  let asteroidBeltChance = random.int(1, 100);

  if (asteroidBeltChance > 70) {
    starsystem.description += " and an asteroid belt.";
  } else {
    starsystem.description += ".";
  }

  return starsystem;
}

function allPlanetTypes() {
  return [
    {
      name: "barren",
      possibleRegions: ["inner", "outer"],
      habitationChance: 0,
      sizeClass: "small",
      hasAtmosphere: false,
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";
        svg +=
          '<radialGradient id="craterTrough" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(170,170,170)" /><stop offset="5%" stop-color="rgb(150,150,150)" /><stop offset="95%" stop-color="rgb(150,150,150)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(110,110,110)" /></radialGradient>';

        svg +=
          '<filter id="barrenTexture1"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg += "</defs>";
        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="rgb(150,150,150)" />';

        let numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(10, 20);
          let amount = random.int(110, 170);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="rgb(' +
            amount +
            ", " +
            amount +
            ", " +
            amount +
            ')" filter="url(#barrenTexture1)" />';
        }

        let numberOfCraters = random.int(55, 80);

        for (let i = 0; i < numberOfCraters; i++) {
          let x = random.int(20, 200);
          let y = random.int(20, 200);
          let r = random.int(3, 8);
          let crater =
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="url(#craterTrough)" />';
          svg += crater;
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "arid",
      possibleRegions: ["inner", "goldilocks"],
      habitationChance: 15,
      hasAtmosphere: true,
      sizeClass: "medium",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";
        svg +=
          '<radialGradient id="aridCrater" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(237,220,151)" /><stop offset="5%" stop-color="rgb(227,210,141)" /><stop offset="95%" stop-color="rgb(217,200,131)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(197,190,121)" /></radialGradient>';

        svg +=
          '<filter id="aridTexture1"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg += "</defs>";
        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="rgb(227,210,141)" />';

        let numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(10, 20);
          let amount = random.int(-10, 20);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="rgb(' +
            (227 + amount) +
            ", " +
            (210 + amount) +
            ", " +
            (141 + amount) +
            ')" filter="url(#aridTexture1)" />';
        }

        let numberOfCraters = random.int(25, 30);

        for (let i = 0; i < numberOfCraters; i++) {
          let x = random.int(20, 200);
          let y = random.int(20, 200);
          let r = random.int(3, 8);
          let crater =
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="url(#aridCrater)" />';
          svg += crater;
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "garden",
      possibleRegions: ["goldilocks"],
      habitationChance: 85,
      hasAtmosphere: true,
      sizeClass: "medium",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";

        svg +=
          '<radialGradient id="gardenContinentGradient"><stop offset="0%" stop-color="rgb(130,181,91)" /><stop offset="100%" stop-color="rgb(120,153,55)" /></radialGradient>';

        svg +=
          '<filter id="gardenTexture1"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg +=
          '<filter id="cloudTexture"><feTurbulence type="turbulence" baseFrequency="0.2" numOctaves="2" result="turbulence" /><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation="0.1" /></filter>';

        svg += "</defs>";
        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="rgb(36,27,161)" />';

        let numberOfContinents = random.int(7, 18);

        for (let i = 0; i < numberOfContinents; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(5, 30);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="url(#gardenContinentGradient)" filter="url(#gardenTexture1)" />';
        }

        let numberOfClouds = random.int(20, 30);

        for (let i = 0; i < numberOfClouds; i++) {
          let x = random.int(15, 100);
          let y = random.int(15, 100);
          let rx = random.int(5, 9);
          let ry = random.int(5, 9);

          svg +=
            '<ellipse cx="' +
            x +
            '" cy="' +
            y +
            '" rx="' +
            rx +
            '" ry="' +
            ry +
            '" fill="white" filter="url(#cloudTexture)" />';
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "jungle",
      possibleRegions: ["goldilocks"],
      habitationChance: 65,
      hasAtmosphere: true,
      sizeClass: "medium",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";

        svg +=
          '<linearGradient id="jungleLakeGradient"><stop offset="0%" stop-color="rgb(17,109,128)" /><stop offset="100%" stop-color="rgb(7,99,118)" /></linearGradient>';

        svg +=
          '<filter id="jungleTexture1"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg +=
          '<filter id="cloudTexture"><feTurbulence type="turbulence" baseFrequency="0.2" numOctaves="2" result="turbulence" /><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation="0.1" /></filter>';

        svg += "</defs>";
        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="rgb(8,94,40)" />';

        let numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(10, 20);
          let amount = random.int(-10, 20);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="rgb(' +
            (10 + amount) +
            ", " +
            (96 + amount) +
            ", " +
            (42 + amount) +
            ')" filter="url(#jungleTexture1)" />';
        }

        let numberOfOceans = random.int(4, 7);

        for (let i = 0; i < numberOfOceans; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(5, 10);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="url(#jungleLakeGradient)" filter="url(#jungleTexture1)" />';
        }

        let numberOfClouds = random.int(40, 60);

        for (let i = 0; i < numberOfClouds; i++) {
          let x = random.int(15, 100);
          let y = random.int(15, 100);
          let rx = random.int(5, 9);
          let ry = random.int(5, 9);

          svg +=
            '<ellipse cx="' +
            x +
            '" cy="' +
            y +
            '" rx="' +
            rx +
            '" ry="' +
            ry +
            '" fill="white" filter="url(#cloudTexture)" />';
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "volcanic",
      possibleRegions: ["inner"],
      habitationChance: 15,
      hasAtmosphere: true,
      sizeClass: "medium",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";
        svg +=
          '<radialGradient id="volcanicCrater" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(67,50,45)" /><stop offset="5%" stop-color="rgb(57,40,35)" /><stop offset="95%" stop-color="rgb(47,30,25)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(37,20,15)" /></radialGradient>';

        svg +=
          '<filter id="volcanicTexture1"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg += "</defs>";
        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="rgb(57,40,35)" />';

        let numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(10, 20);
          let amount = random.int(-10, 20);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="rgb(' +
            (57 + amount) +
            ", " +
            (40 + amount) +
            ", " +
            (35 + amount) +
            ')" filter="url(#volcanicTexture1)" />';
        }

        let numberOfLavaLakes = random.int(26, 30);

        for (let i = 0; i < numberOfLavaLakes; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(1, 4);
          let amount = random.int(-10, 20);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="rgb(' +
            (235 + amount) +
            ", " +
            (132 + amount) +
            ", " +
            (5 + amount) +
            ')" filter="url(#volcanicTexture1)" />';
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "gas giant",
      possibleRegions: ["outer"],
      habitationChance: 0,
      hasAtmosphere: false,
      sizeClass: "large",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";

        svg +=
          '<filter id="bandFilter"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg += "</defs>";

        let numberOfBands = random.int(10, 16);

        let remainingHeight = 256;

        let baseR = random.int(60, 255);
        let baseG = random.int(60, 255);
        let baseB = random.int(60, 255);

        let baseColor = "rgb(" + baseR + "," + baseG + "," + baseB + ")";

        let bandsSVG = "";

        for (let i = 0; i < numberOfBands; i++) {
          let bandOffset = random.int(0, 5);
          let bandHeight = random.int(3, 15);

          let y = 256 - remainingHeight + bandHeight + bandOffset;

          let r = baseR + random.int(-30, 30);
          let g = baseG + random.int(-30, 30);
          let b = baseB + random.int(-30, 30);

          let bandSVG =
            '<rect x="0" y="' +
            y +
            '" width="256" height="' +
            bandHeight +
            '" fill="rgb(' +
            r +
            ", " +
            g +
            ", " +
            b +
            ')" filter="url(#bandFilter)" />';

          bandsSVG += bandSVG;

          remainingHeight -= bandHeight - bandOffset;
        }

        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="' +
          baseColor +
          '" />';

        svg += bandsSVG;

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "toxic",
      possibleRegions: ["inner", "goldilocks"],
      habitationChance: 5,
      hasAtmosphere: true,
      sizeClass: "medium",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";

        svg +=
          '<linearGradient id="toxicLakeGradient"><stop offset="0%" stop-color="rgb(152,222,52)" /><stop offset="100%" stop-color="rgb(172,232,67)" /></linearGradient>';

        svg +=
          '<filter id="toxicTexture1"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg += "</defs>";
        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="rgb(168,155,39)" />';

        let numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(10, 20);
          let amount = random.int(-10, 20);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="rgb(' +
            (168 + amount) +
            ", " +
            (155 + amount) +
            ", " +
            (39 + amount) +
            ')" filter="url(#toxicTexture1)" />';
        }

        let numberOfToxicOceans = random.int(4, 7);

        for (let i = 0; i < numberOfToxicOceans; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(10, 20);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="url(#toxicLakeGradient)" filter="url(#toxicTexture1)" />';
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "ice",
      possibleRegions: ["outer"],
      habitationChance: 15,
      hasAtmosphere: true,
      sizeClass: "medium",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";
        svg +=
          '<radialGradient id="iceCrater" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(234,255,255)" /><stop offset="5%" stop-color="rgb(224,250,255)" /><stop offset="95%" stop-color="rgb(214,240,245)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(204,230,235)" /></radialGradient>';

        svg +=
          '<filter id="iceTexture1"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';

        svg += "</defs>";
        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="rgb(224,250,255)" />';

        let numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          let x = random.int(1, 90);
          let y = random.int(1, 90);
          let r = random.int(10, 20);
          let amount = random.int(0, 20);

          svg +=
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="' +
            r +
            '" fill="rgb(' +
            (210 + amount) +
            ", " +
            (230 + amount) +
            ", " +
            (235 + amount) +
            ')" filter="url(#iceTexture1)" />';
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "ocean",
      possibleRegions: ["goldilocks"],
      habitationChance: 20,
      hasAtmosphere: true,
      sizeClass: "medium",
      renderSVG: function () {
        let svg =
          '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';

        svg += "<defs>";

        svg +=
          '<radialGradient id="oceanGradient" cx="0.5" cy="0.5"><stop offset="0%" stop-color="rgb(45,14,201)" /><stop offset="100%" stop-color="rgb(95,117,227)" />';

        svg +=
          '<filter id="cloudTexture"><feTurbulence type="turbulence" baseFrequency="0.2" numOctaves="2" result="turbulence" /><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation="0.1" /></filter>';

        svg += "</defs>";

        svg +=
          '<rect x="0" y="0" width="256" height="256" fill="url(#oceanGradient)" />';

        svg += "</svg>";

        let numberOfClouds = random.int(20, 30);

        for (let i = 0; i < numberOfClouds; i++) {
          let x = random.int(15, 100);
          let y = random.int(15, 100);
          let rx = random.int(5, 9);
          let ry = random.int(5, 9);

          svg +=
            '<ellipse cx="' +
            x +
            '" cy="' +
            y +
            '" rx="' +
            rx +
            '" ry="' +
            ry +
            '" fill="white" filter="url(#cloudTexture)" />';
        }

        return svg;
      },
    },
  ];
}

function randomPlanet(planetType) {
  let planet = {
    name: "",
    inhabited: false,
    planetType: planetType,
    size: randomSize(),
  };

  planet.numberOfMoons = random.int(0, 5);

  let habitationChance = random.int(1, 100);

  if (habitationChance <= planet.planetType.habitationChance) {
    planet.inhabited = true;
  }

  planet.description =
    "This world is " +
    Words.article(planetType.name) +
    " " +
    planetType.name +
    " planet.";

  if (planet.inhabited) {
    planet.description += " It is inhabited.";
  }

  if (planet.numberOfMoons == 1) {
    planet.description += " It has one moon.";
  } else if (planet.numberOfMoons > 1) {
    planet.description += " It has " + planet.numberOfMoons + " moons.";
  }

  return planet;
}

function randomSize() {
  return iarnd.item(["tiny", "small", "medium-sized", "large", "huge"]);
}

function randomStar() {
  let star = iarnd.item([
    {
      color: "red",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 1,
      maxGoldilocks: 3,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "yellow",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 1,
      maxGoldilocks: 3,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "orange",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 1,
      maxGoldilocks: 3,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "white",
      classification: "main sequence",
      minInner: 1,
      maxInner: 3,
      minGoldilocks: 0,
      maxGoldilocks: 2,
      minOuter: 1,
      maxOuter: 4,
    },
    {
      color: "red",
      classification: "dwarf",
      minInner: 0,
      maxInner: 3,
      minGoldilocks: 0,
      maxGoldilocks: 0,
      minOuter: 2,
      maxOuter: 4,
    },
    {
      color: "white",
      classification: "dwarf",
      minInner: 0,
      maxInner: 3,
      minGoldilocks: 0,
      maxGoldilocks: 0,
      minOuter: 0,
      maxOuter: 4,
    },
  ]);

  star.description =
    "This is " +
    Words.article(star.color) +
    " " +
    star.color +
    " " +
    star.classification +
    " star.";

  return star;
}

function randomInnerPlanetType() {
  let all = allPlanetTypes();

  let possible = [];

  all.forEach(function (element) {
    if (element.possibleRegions.includes("inner")) {
      possible.push(element);
    }
  });

  return iarnd.item(possible);
}

function randomGoldilocksPlanetType() {
  let all = allPlanetTypes();

  let possible = [];

  all.forEach(function (element) {
    if (element.possibleRegions.includes("goldilocks")) {
      possible.push(element);
    }
  });

  return iarnd.item(possible);
}

function randomOuterPlanetType() {
  let all = allPlanetTypes();

  let possible = [];

  all.forEach(function (element) {
    if (element.possibleRegions.includes("outer")) {
      possible.push(element);
    }
  });

  return iarnd.item(possible);
}

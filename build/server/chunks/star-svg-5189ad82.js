import './sentry-release-injection-file-2a0756c4.js';
import * as Words from '@ironarachne/words';
import random from 'random';
import { P as PlanetGenerator, a as PlanetGeneratorConfig } from './generator2-8cd7f408.js';
import * as MUN from '@ironarachne/made-up-names';
import * as RND from '@ironarachne/rng';

class Star {
  name;
  color;
  description;
  classification;
  radius;
  // in km
  mass;
  // in 10^30 kg
  temperature;
  // in K
  luminosity;
  // in 10^26 W
  constructor() {
    this.name = "";
    this.color = "";
    this.description = "";
    this.classification = "";
    this.radius = 0;
    this.mass = 0;
    this.temperature = 0;
    this.luminosity = 0;
  }
  getColorFromTemperature() {
    if (this.temperature < 3700) {
      return "red";
    } else if (this.temperature < 5200) {
      return "orange";
    } else if (this.temperature < 6e3) {
      return "yellow";
    } else if (this.temperature < 7500) {
      return "yellow-white";
    } else if (this.temperature < 1e4) {
      return "white";
    } else if (this.temperature < 3e4) {
      return "blue-white";
    }
    return "blue";
  }
}
class StarSystem {
  name;
  description;
  stars;
  planets;
  constructor() {
    this.name = "";
    this.description = "";
    this.stars = [];
    this.planets = [];
  }
}
class StarClassification {
  name;
  radius_min;
  // relative to the sun
  radius_max;
  // relative to the sun
  mass_min;
  // relative to the sun
  mass_max;
  // relative to the sun
  temperature_min;
  // in K
  temperature_max;
  // in K
  luminosity_min;
  // relative to the sun
  luminosity_max;
  // relative to the sun
  commonality;
  // commonality in the universe
  constructor(name, radius_min, radius_max, mass_min, mass_max, temperature_min, temperature_max, luminosity_min, luminosity_max, commonality) {
    this.name = name;
    this.radius_min = radius_min;
    this.radius_max = radius_max;
    this.mass_min = mass_min;
    this.mass_max = mass_max;
    this.temperature_min = temperature_min;
    this.temperature_max = temperature_max;
    this.luminosity_min = luminosity_min;
    this.luminosity_max = luminosity_max;
    this.commonality = commonality;
  }
}
function all() {
  return [
    new StarClassification("main sequence", 0.1, 0.5, 0.1, 0.5, 2e3, 4e3, 0.01, 0.05, 40),
    new StarClassification("main sequence", 0.6, 0.9, 0.6, 0.8, 4e3, 5e3, 0.1, 0.8, 45),
    new StarClassification("main sequence", 0.9, 1.1, 0.8, 1.3, 5e3, 6e3, 0.8, 3, 60),
    new StarClassification("main sequence", 1.1, 1.5, 1.3, 1.8, 6e3, 8e3, 3, 8, 30),
    new StarClassification("main sequence", 1.5, 4, 1.8, 5, 8e3, 15e3, 15, 25, 10),
    new StarClassification("main sequence", 4, 6, 8, 12, 15e3, 25e3, 900, 1100, 5),
    new StarClassification(
      "main sequence",
      8,
      12,
      45,
      55,
      35e3,
      45e3,
      9e4,
      11e4,
      1
    ),
    new StarClassification("giant", 10, 50, 1, 5, 3e3, 1e4, 50, 1e3, 2),
    new StarClassification(
      "supergiant",
      30,
      500,
      10,
      70,
      4e3,
      4e4,
      3e4,
      1e6,
      1
    )
  ];
}
class StarGeneratorConfig {
  possibleClassifications;
  constructor() {
    this.possibleClassifications = all();
  }
}
class StarGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    const classification = RND.weighted(this.config.possibleClassifications);
    const star = new Star();
    star.classification = classification.name;
    star.radius = random.float(classification.radius_min, classification.radius_max) * 695508;
    star.mass = random.float(classification.mass_min, classification.mass_max) * 1.989;
    star.temperature = random.int(classification.temperature_min, classification.temperature_max);
    star.luminosity = random.float(classification.luminosity_min, classification.luminosity_max) * 3.828;
    star.color = star.getColorFromTemperature();
    const article = Words.article(star.color);
    star.description = `This is ${article} ${star.color} ${star.classification} star.`;
    star.name = MUN.star();
    return star;
  }
}
class StarSystemGeneratorConfig {
  minPlanets;
  maxPlanets;
  constructor() {
    this.minPlanets = 3;
    this.maxPlanets = 12;
  }
}
class StarSystemGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let starsystem = new StarSystem();
    let starGenConfig = new StarGeneratorConfig();
    let starGen = new StarGenerator(starGenConfig);
    const star = starGen.generate();
    starsystem.name = star.name;
    starsystem.stars.push(star);
    const numberOfPlanets = random.int(this.config.minPlanets, this.config.maxPlanets);
    let planetGenConfig = new PlanetGeneratorConfig();
    let planetGenerator = new PlanetGenerator(planetGenConfig);
    for (let i = 0; i < numberOfPlanets; i++) {
      const planet = planetGenerator.generate();
      starsystem.planets.push(planet);
    }
    starsystem.planets.sort(function(x, y) {
      if (x.distance_from_sun < y.distance_from_sun) {
        return -1;
      }
      if (x.distance_from_sun > y.distance_from_sun) {
        return 1;
      }
      return 0;
    });
    for (let i = 0; i < starsystem.planets.length; i++) {
      if (!starsystem.planets[i].is_inhabited) {
        starsystem.planets[i].name = starsystem.name + " " + Words.romanize(i + 1);
      }
    }
    starsystem.description = `The ${starsystem.name} system has ${numberOfPlanets} planets`;
    const asteroidBeltChance = random.int(1, 100);
    if (asteroidBeltChance > 70) {
      starsystem.description += " and an asteroid belt.";
    } else {
      starsystem.description += ".";
    }
    return starsystem;
  }
}
class SVGStarfieldRenderer {
  width;
  height;
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  render() {
    let svg = '<svg width="' + this.width + '" height="' + this.height + '" viewBox="0 0 ' + this.width + " " + this.height + '">';
    svg += '<rect width="' + this.width + '" height="' + this.height + '" fill="black" />';
    const numberOfStars = Math.floor(this.width * this.height * 5e-3);
    for (let i = 0; i < numberOfStars; i++) {
      const x = random.int(0, this.width);
      const y = random.int(0, this.height);
      svg += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + randomStarColor() + '" />';
    }
    svg += "</svg>";
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
  return "rgb(" + r + "," + g + "," + b + ")";
}
class SVGPlanetRenderer {
  width;
  height;
  constructor(width, height) {
    this.height = height;
    this.width = width;
  }
  render(planet) {
    const textureRenderer = getPlanetRenderer(planet.classification.name);
    const texture = textureRenderer.renderSVG();
    let sizeClass = "medium";
    if (planet.diameter < 8e3) {
      sizeClass = "small";
    } else if (planet.diameter > 19e3) {
      sizeClass = "large";
    }
    const midX = Math.floor(this.width / 2);
    const midY = Math.floor(this.height / 2);
    const planetId = random.int(0, 1e3);
    const min = Math.min(this.width, this.height);
    let radius = 0;
    const planetDiameterModifier = (planet.diameter - planet.classification.diameter_min) / (planet.classification.diameter_max - planet.classification.diameter_min);
    let rangeMin = 0.8;
    let rangeMax = 0.9;
    if (sizeClass === "small") {
      rangeMin = 0.2;
      rangeMax = 0.4;
    } else if (sizeClass === "medium") {
      rangeMin = 0.5;
      rangeMax = 0.7;
    }
    let size = (rangeMax - rangeMin) * planetDiameterModifier + rangeMin;
    radius = Math.floor(min) * size / 2;
    const atmosphereRadius = Math.floor(radius * 1.1);
    let starfieldRenderer = new SVGStarfieldRenderer(this.width, this.height);
    const background = starfieldRenderer.render();
    let svg = '<svg width="' + this.width + '" height="' + this.height + '" viewBox="0 0 ' + this.width + " " + this.height + '">';
    svg += "<defs>";
    svg += '<radialGradient id="atmosphere-' + planetId + '"><stop offset="95%" stop-color="' + textureRenderer.atmosphereColor + '" stop-opacity="0.8" /><stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" /></radialGradient>';
    svg += '<radialGradient id="planetShadow" cx="0.5" cy="0.5" r="0.75" fx="0.275" fy="0.275"><stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0" /><stop offset="80%" stop-color="rgb(0,0,70)" stop-opacity="0.8" /><stop offset="90%" stop-color="rgb(0,0,0)" stop-opacity="0.8" /><stop offset="100%" stop-color="rgb(0,00,40)" stop-opacity="0.6" /></radialGradient>';
    svg += '<pattern id="planetTexture-' + planetId + '" x="0" y="0" width="1" height="1">' + texture + "</pattern>";
    svg += "</defs>";
    svg += background;
    if (planet.has_atmosphere) {
      svg += '<circle cx="' + midX + '" cy="' + midY + '" r="' + atmosphereRadius + '" fill="url(#atmosphere-' + planetId + ')" />';
    }
    svg += '<circle cx="' + midX + '" cy="' + midY + '" r="' + radius + '" fill="url(#planetTexture-' + planetId + ')" />';
    svg += '<circle cx="' + midX + '" cy="' + midY + '" r="' + radius + '" fill="url(#planetShadow)" />';
    return svg;
  }
}
function getPlanetRenderer(planetType) {
  const planetTypes = [
    {
      name: "barren",
      hasAtmosphere: false,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<radialGradient id="craterTrough' + hash + '" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(170,170,170)" /><stop offset="5%" stop-color="rgb(150,150,150)" /><stop offset="95%" stop-color="rgb(150,150,150)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(110,110,110)" /></radialGradient>';
        svg += '<filter id="barrenTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(150,150,150)" />';
        const numberOfSplotches = random.int(6, 14);
        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(110, 170);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + amount + ", " + amount + ", " + amount + ')" filter="url(#barrenTexture' + hash + ')" />';
        }
        const numberOfCraters = random.int(55, 80);
        for (let i = 0; i < numberOfCraters; i++) {
          const x = random.int(20, 200);
          const y = random.int(20, 200);
          const r = random.int(3, 8);
          const crater = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#craterTrough' + hash + ')" />';
          svg += crater;
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "arid",
      hasAtmosphere: true,
      atmosphereColor: "rgb(170,224,211)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<radialGradient id="aridCrater' + hash + '" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(237,220,151)" /><stop offset="5%" stop-color="rgb(227,210,141)" /><stop offset="95%" stop-color="rgb(217,200,131)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(197,190,121)" /></radialGradient>';
        svg += '<filter id="aridTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(227,210,141)" />';
        const numberOfSplotches = random.int(6, 14);
        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + (227 + amount) + ", " + (210 + amount) + ", " + (141 + amount) + ')" filter="url(#aridTexture' + hash + ')" />';
        }
        const numberOfCraters = random.int(25, 30);
        for (let i = 0; i < numberOfCraters; i++) {
          const x = random.int(20, 200);
          const y = random.int(20, 200);
          const r = random.int(3, 8);
          const crater = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#aridCrater' + hash + ')" />';
          svg += crater;
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "garden",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<radialGradient id="gardenContinentGradient' + hash + '"><stop offset="0%" stop-color="rgb(130,181,91)" /><stop offset="100%" stop-color="rgb(120,153,55)" /></radialGradient>';
        svg += '<filter id="gardenTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += '<filter id="cloudTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.45" numOctaves="2" result="turbulence" /><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation="0.2" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(36,27,161)" />';
        const numberOfContinents = random.int(7, 18);
        for (let i = 0; i < numberOfContinents; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(5, 30);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#gardenContinentGradient' + hash + ')" filter="url(#gardenTexture' + hash + ')" />';
        }
        const numberOfClouds = random.int(20, 30);
        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 13);
          const ry = random.int(5, 9);
          svg += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="white" filter="url(#cloudTexture' + hash + ')" />';
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "jungle",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<linearGradient id="jungleLakeGradient' + hash + '"><stop offset="0%" stop-color="rgb(17,109,128)" /><stop offset="100%" stop-color="rgb(7,99,118)" /></linearGradient>';
        svg += '<filter id="jungleTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += '<filter id="cloudTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.2" numOctaves="2" result="turbulence" /><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation="0.1" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(8,94,40)" />';
        const numberOfSplotches = random.int(6, 14);
        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + (10 + amount) + ", " + (96 + amount) + ", " + (42 + amount) + ')" filter="url(#jungleTexture' + hash + ')" />';
        }
        const numberOfOceans = random.int(4, 7);
        for (let i = 0; i < numberOfOceans; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(5, 10);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#jungleLakeGradient' + hash + ')" filter="url(#jungleTexture' + hash + ')" />';
        }
        const numberOfClouds = random.int(40, 60);
        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 9);
          const ry = random.int(5, 9);
          svg += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="white" filter="url(#cloudTexture' + hash + ')" />';
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "swamp",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<linearGradient id="swampLakeGradient' + hash + '"><stop offset="0%" stop-color="rgb(17,109,128)" /><stop offset="100%" stop-color="rgb(7,99,118)" /></linearGradient>';
        svg += '<filter id="swampTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += '<filter id="cloudTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.2" numOctaves="2" result="turbulence" /><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation="0.1" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(8,94,40)" />';
        const numberOfSplotches = random.int(6, 14);
        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + (10 + amount) + ", " + (96 + amount) + ", " + (42 + amount) + ')" filter="url(#swampTexture' + hash + ')" />';
        }
        const numberOfOceans = random.int(4, 7);
        for (let i = 0; i < numberOfOceans; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(5, 10);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#swampLakeGradient' + hash + ')" filter="url(#swampTexture' + hash + ')" />';
        }
        const numberOfClouds = random.int(40, 60);
        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 9);
          const ry = random.int(5, 9);
          svg += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="white" filter="url(#cloudTexture' + hash + ')" />';
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "volcanic",
      hasAtmosphere: true,
      atmosphereColor: "rgb(224,153,47)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<radialGradient id="volcanicCrater' + hash + '" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(67,50,45)" /><stop offset="5%" stop-color="rgb(57,40,35)" /><stop offset="95%" stop-color="rgb(47,30,25)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(37,20,15)" /></radialGradient>';
        svg += '<filter id="volcanicTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(57,40,35)" />';
        const numberOfSplotches = random.int(6, 14);
        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + (57 + amount) + ", " + (40 + amount) + ", " + (35 + amount) + ')" filter="url(#volcanicTexture' + hash + ')" />';
        }
        const numberOfLavaLakes = random.int(26, 30);
        for (let i = 0; i < numberOfLavaLakes; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(1, 4);
          const amount = random.int(-10, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + (235 + amount) + ", " + (132 + amount) + ", " + (5 + amount) + ')" filter="url(#volcanicTexture' + hash + ')" />';
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "gas giant",
      hasAtmosphere: false,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<filter id="bandFilter' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += "</defs>";
        const numberOfBands = random.int(10, 16);
        let remainingHeight = 256;
        const baseR = random.int(60, 255);
        const baseG = random.int(60, 255);
        const baseB = random.int(60, 255);
        const baseColor = "rgb(" + baseR + "," + baseG + "," + baseB + ")";
        let bandsSVG = "";
        for (let i = 0; i < numberOfBands; i++) {
          const bandOffset = random.int(0, 5);
          const bandHeight = random.int(3, 15);
          const y = 256 - remainingHeight + bandHeight + bandOffset;
          const r = baseR + random.int(-30, 30);
          const g = baseG + random.int(-30, 30);
          const b = baseB + random.int(-30, 30);
          const bandSVG = '<rect x="0" y="' + y + '" width="256" height="' + bandHeight + '" fill="rgb(' + r + ", " + g + ", " + b + ')" filter="url(#bandFilter' + hash + ')" />';
          bandsSVG += bandSVG;
          remainingHeight -= bandHeight - bandOffset;
        }
        svg += '<rect x="0" y="0" width="256" height="256" fill="' + baseColor + '" />';
        svg += bandsSVG;
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "toxic",
      hasAtmosphere: true,
      atmosphereColor: "rgb(171,224,45)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<linearGradient id="toxicLakeGradient' + hash + '"><stop offset="0%" stop-color="rgb(152,222,52)" /><stop offset="100%" stop-color="rgb(172,232,67)" /></linearGradient>';
        svg += '<filter id="toxicTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(168,155,39)" />';
        const numberOfSplotches = random.int(6, 14);
        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + (168 + amount) + ", " + (155 + amount) + ", " + (39 + amount) + ')" filter="url(#toxicTexture' + hash + ')" />';
        }
        const numberOfToxicOceans = random.int(4, 7);
        for (let i = 0; i < numberOfToxicOceans; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#toxicLakeGradient' + hash + ')" filter="url(#toxicTexture' + hash + ')" />';
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "ice",
      hasAtmosphere: true,
      atmosphereColor: "rgb(125,229,255)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<radialGradient id="iceCrater' + hash + '" cx="0.6" cy="0.6" fx="0.4" fy="0.4"><stop offset="0%" stop-color="rgb(234,255,255)" /><stop offset="5%" stop-color="rgb(224,250,255)" /><stop offset="95%" stop-color="rgb(214,240,245)" stop-opacity="0" /><stop offset="100%" stop-color="rgb(204,230,235)" /></radialGradient>';
        svg += '<filter id="iceTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence"/><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="rgb(224,250,255)" />';
        const numberOfSplotches = random.int(6, 14);
        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(0, 20);
          svg += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgb(' + (210 + amount) + ", " + (230 + amount) + ", " + (235 + amount) + ')" filter="url(#iceTexture' + hash + ')" />';
        }
        svg += "</svg>";
        return svg;
      }
    },
    {
      name: "ocean",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = '<svg x="0" y="0" width="256" height="256" viewBox="0 0 256 256">';
        svg += "<defs>";
        svg += '<radialGradient id="oceanGradient' + hash + '" cx="0.5" cy="0.5"><stop offset="0%" stop-color="rgb(45,14,201)" /><stop offset="100%" stop-color="rgb(95,117,227)" />';
        svg += '<filter id="cloudTexture' + hash + '"><feTurbulence type="turbulence" baseFrequency="0.2" numOctaves="2" result="turbulence" /><feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation="0.1" /></filter>';
        svg += "</defs>";
        svg += '<rect x="0" y="0" width="256" height="256" fill="url(#oceanGradient' + hash + ')" />';
        svg += "</svg>";
        const numberOfClouds = random.int(20, 30);
        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 9);
          const ry = random.int(5, 9);
          svg += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="white" filter="url(#cloudTexture' + hash + ')" />';
        }
        return svg;
      }
    }
  ];
  for (let i = 0; i < planetTypes.length; i++) {
    if (planetTypes[i].name == planetType) {
      return planetTypes[i];
    }
  }
  return planetTypes[0];
}
class SVGStarRenderer {
  width;
  height;
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  render(star) {
    let starColor = "";
    if (star.color == "red") {
      starColor = "rgb(255,43,10)";
    } else if (star.color == "orange") {
      starColor = "rgb(255,146,20)";
    } else if (star.color == "yellow") {
      starColor = "rgb(255,223,18)";
    } else if (star.color == "yellow-white") {
      starColor = "rgb(251, 255, 168)";
    } else if (star.color == "white") {
      starColor = "rgb(255,255,255)";
    } else if (star.color == "blue-white") {
      starColor = "rgb(198, 243, 247)";
    } else if (star.color == "blue") {
      starColor = "rgb(59,118,255)";
    }
    const midX = Math.floor(this.width / 2);
    const midY = Math.floor(this.height / 2);
    const min = Math.min(this.width, this.height);
    let radius = Math.floor(min) * random.float(0.2, 0.4) / 2;
    if (star.classification == "main sequence") {
      radius = Math.floor(min) * random.float(0.6, 0.7) / 2;
    } else if (star.classification == "giant") {
      radius = Math.floor(min) * random.float(0.8, 0.9) / 2;
    } else if (star.classification == "supergiant") {
      radius = Math.floor(min) * random.float(0.9, 1.1) / 2;
    }
    const glowRadius = Math.floor(radius * 1.4);
    let starfieldRenderer = new SVGStarfieldRenderer(this.width, this.height);
    const background = starfieldRenderer.render();
    let svg = '<svg width="' + this.width + '" height="' + this.height + '" viewBox="0 0 ' + this.width + " " + this.height + '">';
    svg += '<defs><radialGradient id="starglow"><stop offset="60%" stop-color="' + starColor + '" stop-opacity="0.8" /><stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" /></radialGradient></defs>';
    svg += '<filter id="starSurface">';
    svg += '<feFlood x="0%" y="0%" width="100%" height="100%" flood-color="' + starColor + '" result="base" />';
    svg += '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />';
    svg += '<feBlend in2="base" in="noise" mode="multiply" />';
    svg += "</filter>";
    svg += `<mask id="starMask"><circle cx="${midX}" cy="${midY}" r="${radius}" fill="white" /></mask>`;
    svg += background;
    svg += '<circle cx="' + midX + '" cy="' + midY + '" r="' + glowRadius + '" fill="url(#starglow)" />';
    svg += '<circle cx="' + midX + '" cy="' + midY + '" r="' + radius + '" fill="' + starColor + '" filter="url(#starSurface)" mask="url(#starMask)" />';
    svg += "</svg>";
    return svg;
  }
}

export { SVGStarRenderer as S, SVGPlanetRenderer as a, StarSystemGenerator as b, StarSystemGeneratorConfig as c };
//# sourceMappingURL=star-svg-5189ad82.js.map

import * as RND from "@ironarachne/rng";
import Planet from "../../planets/planet.js";
import SVGStarfieldRenderer from "../starfields/starfield-svg.js";

import random from "random";

export default class SVGPlanetRenderer {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.height = height;
    this.width = width;
  }

  render(planet: Planet): string {
    const textureRenderer = getPlanetRenderer(planet.classification.name);
    const texture = textureRenderer.renderSVG();

    let sizeClass = "medium";

    if (planet.diameter < 8000) {
      sizeClass = "small";
    } else if (planet.diameter > 19000) {
      sizeClass = "large";
    }

    const midX = Math.floor(this.width / 2);
    const midY = Math.floor(this.height / 2);

    const planetId = random.int(0, 1000);

    const min = Math.min(this.width, this.height);

    let radius = 0.0;
    const planetDiameterModifier = (planet.diameter - planet.classification.diameter_min)
      / (planet.classification.diameter_max - planet.classification.diameter_min);
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
    radius = (Math.floor(min) * size) / 2;

    const atmosphereRadius = Math.floor(radius * 1.1);

    let starfieldRenderer = new SVGStarfieldRenderer(this.width, this.height);
    const background = starfieldRenderer.render();

    let svg = "<svg width=\""
      + this.width
      + "\" height=\""
      + this.height
      + "\" viewBox=\"0 0 "
      + this.width
      + " "
      + this.height
      + "\">";

    svg += "<defs>";

    svg += "<radialGradient id=\"atmosphere-"
      + planetId
      + "\"><stop offset=\"95%\" stop-color=\""
      + textureRenderer.atmosphereColor
      + "\" stop-opacity=\"0.8\" /><stop offset=\"100%\" stop-color=\"rgb(255,255,255)\" stop-opacity=\"0\" /></radialGradient>";

    svg +=
      "<radialGradient id=\"planetShadow\" cx=\"0.5\" cy=\"0.5\" r=\"0.75\" fx=\"0.275\" fy=\"0.275\"><stop offset=\"0%\" stop-color=\"rgb(0,0,0)\" stop-opacity=\"0\" /><stop offset=\"80%\" stop-color=\"rgb(0,0,70)\" stop-opacity=\"0.8\" /><stop offset=\"90%\" stop-color=\"rgb(0,0,0)\" stop-opacity=\"0.8\" /><stop offset=\"100%\" stop-color=\"rgb(0,00,40)\" stop-opacity=\"0.6\" /></radialGradient>";

    svg += "<pattern id=\"planetTexture-"
      + planetId
      + "\" x=\"0\" y=\"0\" width=\"1\" height=\"1\">"
      + texture
      + "</pattern>";

    svg += "</defs>";

    svg += background;

    if (planet.has_atmosphere) {
      svg += "<circle cx=\""
        + midX
        + "\" cy=\""
        + midY
        + "\" r=\""
        + atmosphereRadius
        + "\" fill=\"url(#atmosphere-"
        + planetId
        + ")\" />";
    }

    svg += "<circle cx=\""
      + midX
      + "\" cy=\""
      + midY
      + "\" r=\""
      + radius
      + "\" fill=\"url(#planetTexture-"
      + planetId
      + ")\" />";

    svg += "<circle cx=\"" + midX + "\" cy=\"" + midY + "\" r=\"" + radius + "\" fill=\"url(#planetShadow)\" />";

    return svg;
  }
}

function getPlanetRenderer(planetType: string) {
  const planetTypes = [
    {
      name: "barren",
      hasAtmosphere: false,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";
        svg += "<radialGradient id=\"craterTrough"
          + hash
          + "\" cx=\"0.6\" cy=\"0.6\" fx=\"0.4\" fy=\"0.4\"><stop offset=\"0%\" stop-color=\"rgb(170,170,170)\" /><stop offset=\"5%\" stop-color=\"rgb(150,150,150)\" /><stop offset=\"95%\" stop-color=\"rgb(150,150,150)\" stop-opacity=\"0\" /><stop offset=\"100%\" stop-color=\"rgb(110,110,110)\" /></radialGradient>";

        svg += "<filter id=\"barrenTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(150,150,150)\" />";

        const numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(110, 170);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + amount
            + ", "
            + amount
            + ", "
            + amount
            + ")\" filter=\"url(#barrenTexture"
            + hash
            + ")\" />";
        }

        const numberOfCraters = random.int(55, 80);

        for (let i = 0; i < numberOfCraters; i++) {
          const x = random.int(20, 200);
          const y = random.int(20, 200);
          const r = random.int(3, 8);
          const crater = "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"url(#craterTrough"
            + hash
            + ")\" />";
          svg += crater;
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "arid",
      hasAtmosphere: true,
      atmosphereColor: "rgb(170,224,211)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";
        svg += "<radialGradient id=\"aridCrater"
          + hash
          + "\" cx=\"0.6\" cy=\"0.6\" fx=\"0.4\" fy=\"0.4\"><stop offset=\"0%\" stop-color=\"rgb(237,220,151)\" /><stop offset=\"5%\" stop-color=\"rgb(227,210,141)\" /><stop offset=\"95%\" stop-color=\"rgb(217,200,131)\" stop-opacity=\"0\" /><stop offset=\"100%\" stop-color=\"rgb(197,190,121)\" /></radialGradient>";

        svg += "<filter id=\"aridTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(227,210,141)\" />";

        const numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + (227 + amount)
            + ", "
            + (210 + amount)
            + ", "
            + (141 + amount)
            + ")\" filter=\"url(#aridTexture"
            + hash
            + ")\" />";
        }

        const numberOfCraters = random.int(25, 30);

        for (let i = 0; i < numberOfCraters; i++) {
          const x = random.int(20, 200);
          const y = random.int(20, 200);
          const r = random.int(3, 8);
          const crater = "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"url(#aridCrater"
            + hash
            + ")\" />";
          svg += crater;
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "garden",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";

        svg += "<radialGradient id=\"gardenContinentGradient"
          + hash
          + "\"><stop offset=\"0%\" stop-color=\"rgb(130,181,91)\" /><stop offset=\"100%\" stop-color=\"rgb(120,153,55)\" /></radialGradient>";

        svg += "<filter id=\"gardenTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "<filter id=\"cloudTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.45\" numOctaves=\"2\" result=\"turbulence\" /><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"30\" xChannelSelector=\"R\" yChannelSelector=\"G\" /><feGaussianBlur stdDeviation=\"0.2\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(36,27,161)\" />";

        const numberOfContinents = random.int(7, 18);

        for (let i = 0; i < numberOfContinents; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(5, 30);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"url(#gardenContinentGradient"
            + hash
            + ")\" filter=\"url(#gardenTexture"
            + hash
            + ")\" />";
        }

        const numberOfClouds = random.int(20, 30);

        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 13);
          const ry = random.int(5, 9);

          svg += "<ellipse cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" rx=\""
            + rx
            + "\" ry=\""
            + ry
            + "\" fill=\"white\" filter=\"url(#cloudTexture"
            + hash
            + ")\" />";
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "jungle",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";

        svg += "<linearGradient id=\"jungleLakeGradient"
          + hash
          + "\"><stop offset=\"0%\" stop-color=\"rgb(17,109,128)\" /><stop offset=\"100%\" stop-color=\"rgb(7,99,118)\" /></linearGradient>";

        svg += "<filter id=\"jungleTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "<filter id=\"cloudTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.2\" numOctaves=\"2\" result=\"turbulence\" /><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"30\" xChannelSelector=\"R\" yChannelSelector=\"G\" /><feGaussianBlur stdDeviation=\"0.1\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(8,94,40)\" />";

        const numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + (10 + amount)
            + ", "
            + (96 + amount)
            + ", "
            + (42 + amount)
            + ")\" filter=\"url(#jungleTexture"
            + hash
            + ")\" />";
        }

        const numberOfOceans = random.int(4, 7);

        for (let i = 0; i < numberOfOceans; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(5, 10);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"url(#jungleLakeGradient"
            + hash
            + ")\" filter=\"url(#jungleTexture"
            + hash
            + ")\" />";
        }

        const numberOfClouds = random.int(40, 60);

        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 9);
          const ry = random.int(5, 9);

          svg += "<ellipse cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" rx=\""
            + rx
            + "\" ry=\""
            + ry
            + "\" fill=\"white\" filter=\"url(#cloudTexture"
            + hash
            + ")\" />";
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "swamp",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";

        svg += "<linearGradient id=\"swampLakeGradient"
          + hash
          + "\"><stop offset=\"0%\" stop-color=\"rgb(17,109,128)\" /><stop offset=\"100%\" stop-color=\"rgb(7,99,118)\" /></linearGradient>";

        svg += "<filter id=\"swampTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "<filter id=\"cloudTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.2\" numOctaves=\"2\" result=\"turbulence\" /><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"30\" xChannelSelector=\"R\" yChannelSelector=\"G\" /><feGaussianBlur stdDeviation=\"0.1\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(8,94,40)\" />";

        const numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + (10 + amount)
            + ", "
            + (96 + amount)
            + ", "
            + (42 + amount)
            + ")\" filter=\"url(#swampTexture"
            + hash
            + ")\" />";
        }

        const numberOfOceans = random.int(4, 7);

        for (let i = 0; i < numberOfOceans; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(5, 10);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"url(#swampLakeGradient"
            + hash
            + ")\" filter=\"url(#swampTexture"
            + hash
            + ")\" />";
        }

        const numberOfClouds = random.int(40, 60);

        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 9);
          const ry = random.int(5, 9);

          svg += "<ellipse cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" rx=\""
            + rx
            + "\" ry=\""
            + ry
            + "\" fill=\"white\" filter=\"url(#cloudTexture"
            + hash
            + ")\" />";
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "volcanic",
      hasAtmosphere: true,
      atmosphereColor: "rgb(224,153,47)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";
        svg += "<radialGradient id=\"volcanicCrater"
          + hash
          + "\" cx=\"0.6\" cy=\"0.6\" fx=\"0.4\" fy=\"0.4\"><stop offset=\"0%\" stop-color=\"rgb(67,50,45)\" /><stop offset=\"5%\" stop-color=\"rgb(57,40,35)\" /><stop offset=\"95%\" stop-color=\"rgb(47,30,25)\" stop-opacity=\"0\" /><stop offset=\"100%\" stop-color=\"rgb(37,20,15)\" /></radialGradient>";

        svg += "<filter id=\"volcanicTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(57,40,35)\" />";

        const numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + (57 + amount)
            + ", "
            + (40 + amount)
            + ", "
            + (35 + amount)
            + ")\" filter=\"url(#volcanicTexture"
            + hash
            + ")\" />";
        }

        const numberOfLavaLakes = random.int(26, 30);

        for (let i = 0; i < numberOfLavaLakes; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(1, 4);
          const amount = random.int(-10, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + (235 + amount)
            + ", "
            + (132 + amount)
            + ", "
            + (5 + amount)
            + ")\" filter=\"url(#volcanicTexture"
            + hash
            + ")\" />";
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "gas giant",
      hasAtmosphere: false,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";

        svg += "<filter id=\"bandFilter"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

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

          const bandSVG = "<rect x=\"0\" y=\""
            + y
            + "\" width=\"256\" height=\""
            + bandHeight
            + "\" fill=\"rgb("
            + r
            + ", "
            + g
            + ", "
            + b
            + ")\" filter=\"url(#bandFilter"
            + hash
            + ")\" />";

          bandsSVG += bandSVG;

          remainingHeight -= bandHeight - bandOffset;
        }

        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"" + baseColor + "\" />";

        svg += bandsSVG;

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "toxic",
      hasAtmosphere: true,
      atmosphereColor: "rgb(171,224,45)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";

        svg += "<linearGradient id=\"toxicLakeGradient"
          + hash
          + "\"><stop offset=\"0%\" stop-color=\"rgb(152,222,52)\" /><stop offset=\"100%\" stop-color=\"rgb(172,232,67)\" /></linearGradient>";

        svg += "<filter id=\"toxicTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(168,155,39)\" />";

        const numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(-10, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + (168 + amount)
            + ", "
            + (155 + amount)
            + ", "
            + (39 + amount)
            + ")\" filter=\"url(#toxicTexture"
            + hash
            + ")\" />";
        }

        const numberOfToxicOceans = random.int(4, 7);

        for (let i = 0; i < numberOfToxicOceans; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"url(#toxicLakeGradient"
            + hash
            + ")\" filter=\"url(#toxicTexture"
            + hash
            + ")\" />";
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "ice",
      hasAtmosphere: true,
      atmosphereColor: "rgb(125,229,255)",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";
        svg += "<radialGradient id=\"iceCrater"
          + hash
          + "\" cx=\"0.6\" cy=\"0.6\" fx=\"0.4\" fy=\"0.4\"><stop offset=\"0%\" stop-color=\"rgb(234,255,255)\" /><stop offset=\"5%\" stop-color=\"rgb(224,250,255)\" /><stop offset=\"95%\" stop-color=\"rgb(214,240,245)\" stop-opacity=\"0\" /><stop offset=\"100%\" stop-color=\"rgb(204,230,235)\" /></radialGradient>";

        svg += "<filter id=\"iceTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"turbulence\"/><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"15\" xChannelSelector=\"R\" yChannelSelector=\"G\" /></filter>";

        svg += "</defs>";
        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"rgb(224,250,255)\" />";

        const numberOfSplotches = random.int(6, 14);

        for (let i = 0; i < numberOfSplotches; i++) {
          const x = random.int(1, 90);
          const y = random.int(1, 90);
          const r = random.int(10, 20);
          const amount = random.int(0, 20);

          svg += "<circle cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" r=\""
            + r
            + "\" fill=\"rgb("
            + (210 + amount)
            + ", "
            + (230 + amount)
            + ", "
            + (235 + amount)
            + ")\" filter=\"url(#iceTexture"
            + hash
            + ")\" />";
        }

        svg += "</svg>";

        return svg;
      },
    },
    {
      name: "ocean",
      hasAtmosphere: true,
      atmosphereColor: "blue",
      renderSVG: function() {
        const hash = RND.randomString(4);
        let svg = "<svg x=\"0\" y=\"0\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\">";

        svg += "<defs>";

        svg += "<radialGradient id=\"oceanGradient"
          + hash
          + "\" cx=\"0.5\" cy=\"0.5\"><stop offset=\"0%\" stop-color=\"rgb(45,14,201)\" /><stop offset=\"100%\" stop-color=\"rgb(95,117,227)\" />";

        svg += "<filter id=\"cloudTexture"
          + hash
          + "\"><feTurbulence type=\"turbulence\" baseFrequency=\"0.2\" numOctaves=\"2\" result=\"turbulence\" /><feDisplacementMap in2=\"turbulence\" in=\"SourceGraphic\" scale=\"30\" xChannelSelector=\"R\" yChannelSelector=\"G\" /><feGaussianBlur stdDeviation=\"0.1\" /></filter>";

        svg += "</defs>";

        svg += "<rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" fill=\"url(#oceanGradient" + hash + ")\" />";

        svg += "</svg>";

        const numberOfClouds = random.int(20, 30);

        for (let i = 0; i < numberOfClouds; i++) {
          const x = random.int(15, 100);
          const y = random.int(15, 100);
          const rx = random.int(5, 9);
          const ry = random.int(5, 9);

          svg += "<ellipse cx=\""
            + x
            + "\" cy=\""
            + y
            + "\" rx=\""
            + rx
            + "\" ry=\""
            + ry
            + "\" fill=\"white\" filter=\"url(#cloudTexture"
            + hash
            + ")\" />";
        }

        return svg;
      },
    },
  ];

  for (let i = 0; i < planetTypes.length; i++) {
    if (planetTypes[i].name == planetType) {
      return planetTypes[i];
    }
  }

  return planetTypes[0];
}

"use strict";

import random from "random";
import Star from "../../stars/star.js";
import SVGStarfieldRenderer from "../starfields/starfield-svg.js";

export default class SVGStarRenderer {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  render(star: Star): string {
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
    let radius = (Math.floor(min) * random.float(0.2, 0.4)) / 2;

    if (star.classification == "main sequence") {
      radius = (Math.floor(min) * random.float(0.6, 0.7)) / 2;
    } else if (star.classification == "giant") {
      radius = (Math.floor(min) * random.float(0.8, 0.9)) / 2;
    } else if (star.classification == "supergiant") {
      radius = (Math.floor(min) * random.float(0.9, 1.1)) / 2;
    }

    const glowRadius = Math.floor(radius * 1.4);

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

    svg += "<defs><radialGradient id=\"starglow\"><stop offset=\"60%\" stop-color=\""
      + starColor
      + "\" stop-opacity=\"0.8\" /><stop offset=\"100%\" stop-color=\"rgb(255,255,255)\" stop-opacity=\"0\" /></radialGradient></defs>";

    svg += "<filter id=\"starSurface\">";
    svg += "<feFlood x=\"0%\" y=\"0%\" width=\"100%\" height=\"100%\" flood-color=\""
      + starColor
      + "\" result=\"base\" />";
    svg += "<feTurbulence type=\"fractalNoise\" baseFrequency=\"0.05\" numOctaves=\"2\" result=\"noise\" />";
    svg += "<feBlend in2=\"base\" in=\"noise\" mode=\"multiply\" />";
    svg += "</filter>";

    svg += `<mask id="starMask"><circle cx="${midX}" cy="${midY}" r="${radius}" fill="white" /></mask>`;

    svg += background;

    svg += "<circle cx=\"" + midX + "\" cy=\"" + midY + "\" r=\"" + glowRadius + "\" fill=\"url(#starglow)\" />";

    svg += "<circle cx=\""
      + midX
      + "\" cy=\""
      + midY
      + "\" r=\""
      + radius
      + "\" fill=\""
      + starColor
      + "\" filter=\"url(#starSurface)\" mask=\"url(#starMask)\" />";

    svg += "</svg>";

    return svg;
  }
}

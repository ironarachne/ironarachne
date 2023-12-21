import type RGBColor from "$lib/graphics/rgb_color";

export default class Star {
  name: string;
  color: string;
  primaryColor: RGBColor;
  secondaryColor: RGBColor;
  glowColor: RGBColor;
  description: string;
  classification: string;
  radius: number; // in km
  mass: number; // in 10^30 kg
  temperature: number; // in K
  luminosity: number; // in 10^26 W

  constructor() {
    this.name = "";
    this.color = "";
    this.primaryColor = { r: 0, g: 0, b: 0 };
    this.secondaryColor = { r: 0, g: 0, b: 0 };
    this.glowColor = { r: 0, g: 0, b: 0 };
    this.description = "";
    this.classification = "";
    this.radius = 0;
    this.mass = 0;
    this.temperature = 0;
    this.luminosity = 0;
  }
}

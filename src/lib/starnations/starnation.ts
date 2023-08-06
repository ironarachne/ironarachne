"use strict";

import StarSystem from "../starsystem/starsystem.js";
import StarNationGovernment from "./government.js";

export default class StarNation {
  name: string;
  adjective: string;
  description: string;
  government: StarNationGovernment;
  capitalSystem: number; // the index of the systems array for the system
  capitalPlanet: number; // the index of the planet in the planets array for the system
  systems: StarSystem[];
  primaryGoal: string;
  technology: string;
  military: string;
  culture: string;
  economy: string;

  constructor() {
    this.systems = [];
  }
}

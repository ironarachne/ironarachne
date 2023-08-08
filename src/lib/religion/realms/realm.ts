"use strict";

import type AppearanceTrait from "$lib/appearance/trait";

export default class Realm {
  name: string;
  description: string;
  personalityTraits: string[];
  appearanceTraits: AppearanceTrait[];

  constructor() {
    this.name = "";
    this.description = "";
    this.personalityTraits = [];
    this.appearanceTraits = [];
  }
}

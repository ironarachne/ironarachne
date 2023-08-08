"use strict";

import type Pantheon from "./pantheons/pantheon.js";
import type Realm from "./realms/realm.js";

export default class Religion {
  name: string;
  description: string;
  realms: Realm[];
  pantheon: Pantheon | null;

  constructor(name: string) {
    this.name = name;
    this.description = "";
    this.realms = [];
    this.pantheon = null;
  }
}

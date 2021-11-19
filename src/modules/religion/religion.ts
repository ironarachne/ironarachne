"use strict";

import Realm from "./realm";
import Pantheon from "./pantheon";

export default class Religion {
  name: string;
  description: string;
  realms: Realm[];
  pantheon: Pantheon|null;

  constructor(name: string) {
    this.name = name;
    this.description = "";
    this.realms = [];
    this.pantheon = null;
  }
}

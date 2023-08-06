"use strict";

import Relationship from "../../relationships/relationship.js";
import Deity from "../deities/deity.js";

export default class PantheonMember {
  deity: Deity;
  relationships: Relationship[];

  constructor() {
    this.relationships = [];
  }
}

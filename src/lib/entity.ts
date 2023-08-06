"use strict";

import type Component from "./component.js";

export default interface Entity {
  name: string;
  components: Component[];
}

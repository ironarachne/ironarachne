"use strict";

import Component from "./component";

export default interface Entity {
  name: string;
  components: Component[];
}

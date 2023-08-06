"use strict";

import Component from "../components/component.js";
import type Item from "../item.js";

export default interface Pattern {
  name: string;
  tags: string[];
  baseValue: number;
  complete(componentOptions: Component[], quality: number): Item;
}

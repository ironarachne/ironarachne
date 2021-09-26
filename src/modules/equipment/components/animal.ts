"use strict";

import * as Components from "./components";

export function all(): Components.Component[] {
  return [
    new Components.Component("cow leather", "a circle of cow leather", "cow leather", "leather", "hard leather", 1),
    new Components.Component("bull leather", "a circle of bull leather", "bull leather", "leather", "hard leather", 2),
    new Components.Component("steer leather", "a circle of steer leather", "steer leather", "leather", "hard leather", 3),
    new Components.Component("pig hide", "a circle of pig hide", "pig hide", "leather", "hard leather", 1),
    new Components.Component("deer hide", "a circle of deer hide", "deer hide", "leather", "soft leather", 1),
    new Components.Component("goat hide", "a circle of goat hide", "goat hide", "leather", "soft leather", 1),
    new Components.Component("sheep hide", "a circle of sheep hide", "sheep hide", "leather", "soft leather", 1),
    new Components.Component("shark skin", "a circle of shark skin", "shark skin", "leather", "soft leather", 10),
    new Components.Component("dragon hide", "a circle of dragon hide", "dragon hide", "leather", "hard leather", 100),
    new Components.Component("wyvern hide", "a circle of wyvern hide", "wyvern hide", "leather", "hard leather", 100),
    new Components.Component("bone", "a length of bone", "bone", "bone", "animal bone", 1),
  ];
}

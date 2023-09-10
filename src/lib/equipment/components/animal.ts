import Component from "./component.js";

export function all(): Component[] {
  return [
    new Component(
      "cow leather",
      "a circle of cow leather",
      "cow leather",
      "leather",
      "hard leather",
      1,
      0,
      ["leather"],
    ),
    new Component(
      "bull leather",
      "a circle of bull leather",
      "bull leather",
      "leather",
      "hard leather",
      2,
      1,
      ["leather"],
    ),
    new Component(
      "steer leather",
      "a circle of steer leather",
      "steer leather",
      "leather",
      "hard leather",
      20,
      1,
      ["leather"],
    ),
    new Component("pig hide", "a circle of pig hide", "pig hide", "leather", "hard leather", 1, 0, [
      "leather",
    ]),
    new Component(
      "deer hide",
      "a circle of deer hide",
      "deer hide",
      "leather",
      "soft leather",
      1,
      0,
      ["leather"],
    ),
    new Component(
      "goat hide",
      "a circle of goat hide",
      "goat hide",
      "leather",
      "soft leather",
      1,
      0,
      ["leather"],
    ),
    new Component(
      "sheep hide",
      "a circle of sheep hide",
      "sheep hide",
      "leather",
      "soft leather",
      1,
      0,
      ["leather"],
    ),
    new Component(
      "shark skin",
      "a circle of shark skin",
      "shark skin",
      "leather",
      "soft leather",
      30,
      2,
      ["leather"],
    ),
    new Component(
      "dragon hide",
      "a circle of dragon hide",
      "dragon hide",
      "leather",
      "hard leather",
      500,
      4,
      ["leather"],
    ),
    new Component(
      "wyvern hide",
      "a circle of wyvern hide",
      "wyvern hide",
      "leather",
      "hard leather",
      100,
      4,
      ["leather"],
    ),
    new Component("bone", "a length of bone", "bone", "bone", "animal bone", 1, 0, ["bone"]),
  ];
}

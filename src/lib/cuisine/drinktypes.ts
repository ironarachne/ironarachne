import DrinkType from "./drinktype.js";

export function all() {
  return [
    new DrinkType("ale", 0, 3, 0, 2, ["yellow", "tan", "dark brown", "brown"]),
    new DrinkType("beer", 0, 3, 0, 2, ["yellow", "tan", "dark brown", "brown"]),
    new DrinkType("lager", 0, 3, 0, 2, ["yellow", "tan", "light brown", "brown"]),
    new DrinkType("cider", 0, 3, 0, 3, [
      "yellow",
      "tan",
      "dark brown",
      "brown",
      "red",
      "dull orange",
      "pale",
    ]),
    new DrinkType("wine", 0, 3, 0, 10, ["red", "white", "dark red", "pale", "burgundy"]),
    new DrinkType("whiskey", 1, 5, 0, 15, [
      "yellow",
      "dark brown",
      "brown",
      "clear",
      "caramel-colored",
    ]),
    new DrinkType("brandy", 1, 5, 0, 10, ["cloudy", "red", "golden", "caramel-colored"]),
    new DrinkType("bourbon", 1, 5, 0, 15, [
      "yellow",
      "dark brown",
      "brown",
      "clear",
      "caramel-colored",
    ]),
    new DrinkType("gin", 1, 5, 0, 10, ["clear", "cloudy", "white"]),
  ];
}

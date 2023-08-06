"use strict";

import FoodComponent from "./component.js";

export function all(): FoodComponent[] {
  let result: FoodComponent[] = [];
  return result.concat(spices(), herbs(), vegetables(), meats(), seafood(), fruits());
}

export function spices(): FoodComponent[] {
  return [
    new FoodComponent("black pepper", ["spicy"], [""], ["black"], "spice"),
    new FoodComponent("chili powder", ["spicy"], [""], ["red"], "spice"),
    new FoodComponent("cinnamon", ["sweet"], [""], ["brown"], "spice"),
    new FoodComponent("cloves", ["sweet"], [""], ["brown"], "spice"),
    new FoodComponent("coriander", ["bitter"], [""], ["green"], "spice"),
    new FoodComponent("cumin", ["bitter"], [""], ["brown"], "spice"),
    new FoodComponent("fennel", ["sweet"], [""], ["green"], "spice"),
    new FoodComponent("ginger", ["sweet"], [""], ["brown"], "spice"),
    new FoodComponent("mustard", ["bitter"], [""], ["yellow"], "spice"),
    new FoodComponent("nutmeg", ["sweet"], [""], ["brown"], "spice"),
    new FoodComponent("paprika", ["sweet"], [""], ["red"], "spice"),
    new FoodComponent("salt", ["salty"], [""], ["white"], "spice"),
    new FoodComponent("turmeric", ["bitter"], [""], ["yellow"], "spice"),
    new FoodComponent("white pepper", ["spicy"], [""], ["white"], "spice"),
  ];
}

export function fruits(): FoodComponent[] {
  return [
    new FoodComponent("apple", ["sweet"], ["crunchy"], ["red", "green", "yellow"], "fruit"),
    new FoodComponent("banana", ["sweet"], ["soft"], ["yellow"], "fruit"),
    new FoodComponent("blackberry", ["sweet"], ["soft"], ["black"], "fruit"),
    new FoodComponent("blueberry", ["sweet"], ["soft"], ["blue"], "fruit"),
    new FoodComponent("dragonfruit", ["mild"], ["crunchy"], ["pink", "yellow"], "fruit"),
    new FoodComponent("grape", ["sweet"], ["soft"], ["purple", "green", "red"], "fruit"),
    new FoodComponent("grapefruit", ["tart"], ["crunchy"], ["pink"], "fruit"),
    new FoodComponent("guava", ["tart"], ["crunchy"], ["green"], "fruit"),
    new FoodComponent("kiwi", ["tart"], ["soft"], ["brown"], "fruit"),
    new FoodComponent("lemon", ["sour"], ["crunchy"], ["yellow"], "fruit"),
    new FoodComponent("lime", ["tart"], ["crunchy"], ["green"], "fruit"),
    new FoodComponent("lychee", ["sweet"], ["soft"], ["red"], "fruit"),
    new FoodComponent("mango", ["sweet"], ["soft"], ["orange"], "fruit"),
    new FoodComponent("orange", ["tart"], ["crunchy"], ["orange"], "fruit"),
    new FoodComponent("papaya", ["sweet"], ["soft"], ["orange"], "fruit"),
    new FoodComponent("pineapple", ["sweet"], ["crunchy"], ["brown", "yellow"], "fruit"),
    new FoodComponent("raspberry", ["sweet"], ["soft"], ["red"], "fruit"),
    new FoodComponent("strawberry", ["sweet"], ["soft"], ["red"], "fruit"),
    new FoodComponent("watermelon", ["sweet"], ["crunchy"], ["green", "red"], "fruit"),
  ];
}

export function herbs(): FoodComponent[] {
  return [
    new FoodComponent("basil", ["sweet"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("bay leaves", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("chives", ["sweet"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("cilantro", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("coriander", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("dill", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("fennel", ["sweet"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("holy basil", ["sweet"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("lavender", ["sweet"], ["aromatic"], ["purple"], "herb"),
    new FoodComponent("lemon balm", ["sweet"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("lemongrass", ["sour"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("marjoram", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("mint", ["sweet"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("oregano", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("parsley", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("rosemary", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("sage", ["bitter"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("tarragon", ["sweet"], ["aromatic"], ["green"], "herb"),
    new FoodComponent("thyme", ["sweet"], ["aromatic"], ["green"], "herb"),
  ];
}

export function vegetables(): FoodComponent[] {
  return [
    new FoodComponent("artichoke", ["nutty"], ["soft"], ["green"], "vegetable"),
    new FoodComponent("asparagus", ["nutty"], ["crunchy"], ["green"], "vegetable"),
    new FoodComponent("beetroot", ["earthy"], ["crunchy"], ["red"], "vegetable"),
    new FoodComponent("bell pepper", ["sweet"], ["crunchy"], ["green"], "vegetable"),
    new FoodComponent("broccoli", ["sour"], ["crunchy"], ["green"], "vegetable"),
    new FoodComponent("cabbage", ["sour"], ["crunchy"], ["green"], "vegetable"),
    new FoodComponent("carrot", ["sweet"], ["crunchy"], ["orange"], "vegetable"),
    new FoodComponent("cauliflower", ["mild"], ["crunchy"], ["white"], "vegetable"),
    new FoodComponent("celery", ["mild"], ["crunchy"], ["green"], "vegetable"),
    new FoodComponent("cucumber", ["sour"], ["crunchy"], ["green"], "vegetable"),
    new FoodComponent("eggplant", ["mild"], ["soft"], ["purple"], "vegetable"),
    new FoodComponent("kale", ["bitter"], ["leafy"], ["green"], "vegetable"),
    new FoodComponent("onion", ["sour"], ["crunchy"], ["white"], "vegetable"),
    new FoodComponent("potato", ["sweet"], ["crunchy"], ["brown"], "vegetable"),
    new FoodComponent("radish", ["spicy"], ["crunchy"], ["red"], "vegetable"),
    new FoodComponent("spinach", ["bitter"], ["leafy"], ["green"], "vegetable"),
    new FoodComponent("sweet potato", ["sweet"], ["soft"], ["orange"], "vegetable"),
    new FoodComponent("tomato", ["sour"], ["crunchy"], ["red"], "vegetable"),
    new FoodComponent("zucchini", ["mild"], ["crunchy"], ["green"], "vegetable"),
  ];
}

export function meats(): FoodComponent[] {
  return [
    new FoodComponent("beef", ["savory"], ["tender"], ["red"], "meat"),
    new FoodComponent("chicken", ["savory"], ["tender"], ["white"], "meat"),
    new FoodComponent("duck", ["savory"], ["tender"], ["brown"], "meat"),
    new FoodComponent("elk", ["savory"], ["tender"], ["red"], "meat"),
    new FoodComponent("goose", ["savory"], ["tender"], ["brown"], "meat"),
    new FoodComponent("lamb", ["savory"], ["tender"], ["red"], "meat"),
    new FoodComponent("moose", ["savory"], ["tender"], ["brown"], "meat"),
    new FoodComponent("pheasant", ["savory"], ["tender"], ["brown"], "meat"),
    new FoodComponent("pork", ["savory"], ["tender"], ["pink"], "meat"),
    new FoodComponent("quail", ["savory"], ["tender"], ["brown"], "meat"),
    new FoodComponent("rabbit", ["savory"], ["tender"], ["brown"], "meat"),
    new FoodComponent("turkey", ["savory"], ["tender"], ["white"], "meat"),
    new FoodComponent("venison", ["savory"], ["tender"], ["red"], "meat"),
  ];
}

export function seafood(): FoodComponent[] {
  return [
    new FoodComponent("anchovies", ["salty"], ["soft"], ["brown"], "seafood"),
    new FoodComponent("catfish", ["mild"], ["firm"], ["white"], "seafood"),
    new FoodComponent("clams", ["briny"], ["chewy"], ["white"], "seafood"),
    new FoodComponent("cod", ["mild"], ["firm"], ["white"], "seafood"),
    new FoodComponent("crab", ["sweet"], ["soft"], ["red"], "seafood"),
    new FoodComponent("halibut", ["mild"], ["firm"], ["white"], "seafood"),
    new FoodComponent("lobster", ["sweet"], ["soft"], ["red"], "seafood"),
    new FoodComponent("mussels", ["briny"], ["chewy"], ["black"], "seafood"),
    new FoodComponent("octopus", ["mild"], ["chewy"], ["white"], "seafood"),
    new FoodComponent("oysters", ["briny"], ["chewy"], ["gray"], "seafood"),
    new FoodComponent("perch", ["mild"], ["firm"], ["pink"], "seafood"),
    new FoodComponent("salmon", ["mild"], ["soft", "flaky"], ["pink"], "seafood"),
    new FoodComponent("sardines", ["salty"], ["soft"], ["silver"], "seafood"),
    new FoodComponent("scallops", ["mild"], ["soft", "chewy"], ["white"], "seafood"),
    new FoodComponent("shrimp", ["mild"], ["soft", "crunchy"], ["pink"], "seafood"),
    new FoodComponent("squid", ["mild"], ["chewy"], ["white"], "seafood"),
    new FoodComponent("tuna", ["mild"], ["firm"], ["red"], "seafood"),
  ];
}

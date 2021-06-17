"use strict";

const random = require("random");

export function describeDice(dice) {
  let diceExpression = "";

  if (dice.d4 > 0) {
    diceExpression += dice.d4 + "d4";
  }

  if (dice.d6 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d6 + "d6";
  }

  if (dice.d8 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d8 + "d8";
  }

  if (dice.d10 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d10 + "d10";
  }

  if (dice.d12 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d12 + "d12";
  }

  if (dice.d20 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d20 + "d20";
  }

  if (dice.d100 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d100 + "d100";
  }

  if (dice.modifier > 0) {
    diceExpression += "+" + dice.modifier;
  }

  return diceExpression;
}

export function rangeToDiceExpression(range) {
  let remains = range;

  let dice = {
    d4: 0,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 0,
    d100: 0,
    modifier: 0,
  };

  while (remains >= 100 && remains > 0) {
    remains -= 100;
    dice.d100++;
  }
  while (remains >= 20 && remains > 0) {
    remains -= 20;
    dice.d20++;
  }
  while (remains >= 12 && remains > 0) {
    remains -= 12;
    dice.d12++;
  }
  while (remains >= 10 && remains > 0) {
    remains -= 10;
    dice.d10++;
  }
  while (remains >= 8 && remains > 0) {
    remains -= 8;
    dice.d8++;
  }
  while (remains >= 6 && remains > 0) {
    remains -= 6;
    dice.d6++;
  }
  while (remains >= 4 && remains > 0) {
    remains -= 4;
    dice.d4++;
  }

  dice.modifier = remains;

  return dice;
}

export function roll(expression) {
  let parts = expression.split("+");
  let result = 0;

  for (let i = 0; i < parts.length; i++) {
    let phrase = parts[i];

    if (phrase.includes("d")) {
      let splitPhrase = phrase.split("d");
      let number = Number(splitPhrase[0]);
      let sides = Number(splitPhrase[1]);

      for (let j = 0; j < number; j++) {
        result += random.int(1, sides);
      }
    } else {
      result += Number(phrase);
    }
  }

  return result;
}

export function simplify(dice) {
  // This function takes a set of dice and simplifies them to a single die type, dropping everything else
  let result = {
    d4: 0,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 0,
    d100: 0,
    modifier: 0,
  };

  if (dice.d100 > 0) {
    result.d100 = dice.d100;
    return result;
  }

  if (dice.d20 > 0) {
    result.d20 = dice.d20;
    return result;
  }

  if (dice.d12 > 0) {
    result.d12 = dice.d12;
    return result;
  }

  if (dice.d10 > 0) {
    result.d10 = dice.d10;
    return result;
  }

  if (dice.d8 > 0) {
    result.d8 = dice.d8;
    return result;
  }

  if (dice.d6 > 0) {
    result.d6 = dice.d6;
    return result;
  }

  if (dice.d4 > 0) {
    result.d4 = dice.d4;
    return result;
  }

  if (dice.modifier > 0) {
    result.modifier = dice.modifier;
    return result;
  }

  return result;
}

import random from 'random';
import './sentry-release-injection-file-o9u5woV9.js';

class DicePool {
  d4;
  d6;
  d8;
  d10;
  d12;
  d20;
  d100;
  modifier;
  modifierType;
  constructor() {
    this.d4 = 0;
    this.d6 = 0;
    this.d8 = 0;
    this.d10 = 0;
    this.d12 = 0;
    this.d20 = 0;
    this.d100 = 0;
    this.modifier = 0;
    this.modifierType = "+";
  }
  getAverageResult() {
    let result = this.getMinResult() + this.getMaxResult();
    result = Math.floor(result / 2);
    return result;
  }
  getMaxResult() {
    let result = 0;
    result += this.d4 * 4;
    result += this.d6 * 6;
    result += this.d8 * 8;
    result += this.d10 * 10;
    result += this.d12 * 12;
    result += this.d20 * 20;
    result += this.d100 * 100;
    if (this.modifierType == "*") {
      result *= this.modifier;
    } else if (this.modifierType == "+") {
      result += this.modifier;
    } else {
      result -= this.modifier;
    }
    return result;
  }
  getMinResult() {
    let result = 0;
    result += this.d4;
    result += this.d6;
    result += this.d8;
    result += this.d10;
    result += this.d12;
    result += this.d20;
    result += this.d100;
    if (this.modifierType == "*") {
      result *= this.modifier;
    } else if (this.modifierType == "+") {
      result += this.modifier;
    } else {
      result -= this.modifier;
    }
    return result;
  }
}
function describeDice(dice) {
  let diceExpression = "";
  if (dice.d100 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d100 + "d100";
  }
  if (dice.d20 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d20 + "d20";
  }
  if (dice.d12 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d12 + "d12";
  }
  if (dice.d10 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d10 + "d10";
  }
  if (dice.d8 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d8 + "d8";
  }
  if (dice.d6 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d6 + "d6";
  }
  if (dice.d4 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.d4 + "d4";
  }
  if (dice.modifier > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.modifier;
  }
  return diceExpression;
}
function rangeToDiceExpression(range) {
  let remains = range;
  const dice = new DicePool();
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
function roll(expression) {
  let phrases = [];
  let expressionType = "straight";
  let parts = [];
  let useModifier = true;
  let modValue = 0;
  if (expression.includes("+")) {
    phrases = expression.split("+");
    expressionType = "added";
  } else if (expression.includes("-")) {
    phrases = expression.split("-");
    expressionType = "subtracted";
  } else if (expression.includes("x")) {
    phrases = expression.split("x");
    expressionType = "multiplied";
  } else {
    useModifier = false;
  }
  if (useModifier) {
    for (let i = 1; i < phrases.length; i++) {
      let modParts = phrases[i].split("d");
      if (modParts.length > 1) {
        let n = Number(modParts[0]);
        let s = Number(modParts[1]);
        modValue += rollSimple(n, s);
      } else {
        modValue += Number(phrases[i]);
      }
    }
    parts = phrases[0].split("d");
  } else {
    parts = expression.split("d");
  }
  let roll2 = rollSimple(Number(parts[0]), Number(parts[1]));
  if (expressionType == "added") {
    roll2 += modValue;
  } else if (expressionType == "subtracted") {
    roll2 -= modValue;
  } else if (expressionType == "multiplied") {
    roll2 *= modValue;
  }
  return roll2;
}
function rollSimple(n, s) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += random.int(1, s);
  }
  return result;
}
function simplify(dice) {
  const result = new DicePool();
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

export { roll as a, describeDice as d, rangeToDiceExpression as r, simplify as s };
//# sourceMappingURL=dice-mjdHVU8U.js.map

import random from "random";

export class DicePool {
  d4: number;
  d6: number;
  d8: number;
  d10: number;
  d12: number;
  d20: number;
  d100: number;
  modifier: number;
  modifierType: string;

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

  getAverageResult(): number {
    let result = this.getMinResult() + this.getMaxResult();

    result = Math.floor(result / 2);

    return result;
  }

  getMaxResult(): number {
    let result = 0;
    result += this.d4 * 4;
    result += this.d6 * 6;
    result += this.d8 * 8;
    result += this.d10 * 10;
    result += this.d12 * 12;
    result += this.d20 * 20;
    result += this.d100 * 100;

    if (this.modifierType === "*") {
      result *= this.modifier;
    } else if (this.modifierType === "+") {
      result += this.modifier;
    } else {
      result -= this.modifier;
    }

    return result;
  }

  getMinResult(): number {
    let result = 0;
    result += this.d4;
    result += this.d6;
    result += this.d8;
    result += this.d10;
    result += this.d12;
    result += this.d20;
    result += this.d100;

    if (this.modifierType === "*") {
      result *= this.modifier;
    } else if (this.modifierType === "+") {
      result += this.modifier;
    } else {
      result -= this.modifier;
    }

    return result;
  }
}

export function toDicePool(expression: string): DicePool {
  let numDice = 0;
  let numSides = 0;
  let modifier = 0;
  let modifierType = "+";
  let parts = [];
  let modParts = [];

  const dicePool = new DicePool();

  if (expression.includes("-")) {
    modifierType = "-";
    modParts = expression.split("-");
    modifier = Number(modParts[1]);
  } else if (expression.includes("x")) {
    modifierType = "*";
    modParts = expression.split("x");
    modifier = Number(modParts[1]);
  } else if (expression.includes("+")) {
    modParts = expression.split("+");
    modifier = Number(modParts[1]);
  } else {
    modParts = expression.split("+"); // no modifier
  }

  dicePool.modifier = modifier;
  dicePool.modifierType = modifierType;

  parts = modParts[0].split("d");

  numDice = Number(parts[0]);
  numSides = Number(parts[1]);

  if (numSides === 4) {
    dicePool.d4 = numDice;
  } else if (numSides === 6) {
    dicePool.d6 = numDice;
  } else if (numSides === 8) {
    dicePool.d8 = numDice;
  } else if (numSides === 10) {
    dicePool.d10 = numDice;
  } else if (numSides === 12) {
    dicePool.d12 = numDice;
  } else if (numSides === 20) {
    dicePool.d20 = numDice;
  } else if (numSides === 100) {
    dicePool.d100 = numDice;
  }

  return dicePool;
}

export function describeDice(dice: DicePool) {
  let diceExpression = "";

  if (dice.d100 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += `${dice.d100}d100`;
  }

  if (dice.d20 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += `${dice.d20}d20`;
  }

  if (dice.d12 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += `${dice.d12}d12`;
  }

  if (dice.d10 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += `${dice.d10}d10`;
  }

  if (dice.d8 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += `${dice.d8}d8`;
  }

  if (dice.d6 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += `${dice.d6}d6`;
  }

  if (dice.d4 > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += `${dice.d4}d4`;
  }

  if (dice.modifier > 0) {
    if (diceExpression !== "") {
      diceExpression += "+";
    }
    diceExpression += dice.modifier;
  }

  return diceExpression;
}

export function rangeToDiceExpression(range: number) {
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

export function roll(expression: string): number {
  let phrases: string[] = [];
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
      const modParts = phrases[i].split("d");

      if (modParts.length > 1) {
        const n = Number(modParts[0]);
        const s = Number(modParts[1]);
        modValue += rollSimple(n, s);
      } else {
        modValue += Number(phrases[i]);
      }
    }
    parts = phrases[0].split("d");
  } else {
    parts = expression.split("d");
  }

  let roll = rollSimple(Number(parts[0]), Number(parts[1]));

  if (expressionType === "added") {
    roll += modValue;
  } else if (expressionType === "subtracted") {
    roll -= modValue;
  } else if (expressionType === "multiplied") {
    roll *= modValue;
  }

  return roll;
}

function rollSimple(n: number, s: number): number {
  let result = 0;

  for (let i = 0; i < n; i++) {
    result += random.int(1, s);
  }

  return result;
}

export function simplify(dice: DicePool): DicePool {
  // This function takes a set of dice and simplifies them to a single die type, dropping everything else
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

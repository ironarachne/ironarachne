import * as RNG from '@ironarachne/rng';
import type { DicePool } from './types';

/**
 * Creates a new DicePool with default values.
 *
 * @returns {DicePool} A new DicePool
 */
export function createDicePool(): DicePool {
  return {
    d4: 0,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 0,
    d100: 0,
    modifier: 0,
    modifierType: '+',
  };
}

/**
 * Calculates the average result of a dice pool.
 *
 * @param {DicePool} pool The dice pool to calculate the average result for
 * @returns {number} The average result
 */
export function getAverageResult(pool: DicePool): number {
  let result = getMinResult(pool) + getMaxResult(pool);

  result = Math.floor(result / 2);

  return result;
}

/**
 * Calculates the maximum result of a dice pool.
 *
 * @param {DicePool} pool The dice pool to calculate the maximum result for
 * @returns {number} The maximum result
 */
export function getMaxResult(pool: DicePool): number {
  let result = 0;
  result += pool.d4 * 4;
  result += pool.d6 * 6;
  result += pool.d8 * 8;
  result += pool.d10 * 10;
  result += pool.d12 * 12;
  result += pool.d20 * 20;
  result += pool.d100 * 100;

  if (pool.modifierType === '*') {
    result *= pool.modifier;
  } else if (pool.modifierType === '+') {
    result += pool.modifier;
  } else {
    result -= pool.modifier;
  }

  return result;
}

/**
 * Calculates the minimum result of a dice pool.
 *
 * @param {DicePool} pool The dice pool to calculate the minimum result for
 * @returns {number} The minimum result
 */
export function getMinResult(pool: DicePool): number {
  let result = 0;
  result += pool.d4;
  result += pool.d6;
  result += pool.d8;
  result += pool.d10;
  result += pool.d12;
  result += pool.d20;
  result += pool.d100;

  if (pool.modifierType === '*') {
    result *= pool.modifier;
  } else if (pool.modifierType === '+') {
    result += pool.modifier;
  } else {
    result -= pool.modifier;
  }

  return result;
}

/**
 * Converts a dice expression string to a DicePool.
 *
 * @param {string} expression The dice expression to convert
 * @returns {DicePool} The resulting dice pool
 */
export function toDicePool(expression: string): DicePool {
  const dicePool = createDicePool();
  let stringToParse = expression;
  let modVal = 0;
  let modType = '+';

  if (expression.includes('x')) {
    const parts = expression.split('x');
    modType = '*';
    modVal = Number(parts[1]);
    stringToParse = parts[0];
  } else if (expression.includes('-')) {
    const lastMinus = expression.lastIndexOf('-');
    const right = expression.substring(lastMinus + 1);
    if (!right.includes('d')) {
      modType = '-';
      modVal = Number(right);
      stringToParse = expression.substring(0, lastMinus);
    }
  }

  const parts = stringToParse.split('+');
  for (const part of parts) {
    if (part.includes('d')) {
      parseDiceString(part, dicePool);
    } else {
      if (modType === '+') {
        dicePool.modifier += Number(part);
      }
    }
  }

  if (modType !== '+') {
    dicePool.modifier = modVal;
    dicePool.modifierType = modType;
  }

  return dicePool;
}

/**
 * Parses a simple dice string (e.g., "2d6") and adds it to a DicePool.
 *
 * @param {string} part The dice string to parse
 * @param {DicePool} pool The dice pool to add the dice to
 */
function parseDiceString(part: string, pool: DicePool) {
  const dParts = part.split('d');
  const count = Number(dParts[0]);
  const sides = Number(dParts[1]);

  if (sides === 4) pool.d4 += count;
  else if (sides === 6) pool.d6 += count;
  else if (sides === 8) pool.d8 += count;
  else if (sides === 10) pool.d10 += count;
  else if (sides === 12) pool.d12 += count;
  else if (sides === 20) pool.d20 += count;
  else if (sides === 100) pool.d100 += count;
}

/**
 * Describes a dice pool as a string expression.
 *
 * @param {DicePool} dice The dice pool to describe
 * @returns {string} The description
 */
export function describeDice(dice: DicePool) {
  let diceExpression = '';

  if (dice.d100 > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += `${dice.d100}d100`;
  }

  if (dice.d20 > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += `${dice.d20}d20`;
  }

  if (dice.d12 > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += `${dice.d12}d12`;
  }

  if (dice.d10 > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += `${dice.d10}d10`;
  }

  if (dice.d8 > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += `${dice.d8}d8`;
  }

  if (dice.d6 > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += `${dice.d6}d6`;
  }

  if (dice.d4 > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += `${dice.d4}d4`;
  }

  if (dice.modifier > 0) {
    if (diceExpression !== '') {
      diceExpression += '+';
    }
    diceExpression += dice.modifier;
  }

  return diceExpression;
}

/**
 * Converts a range number to a dice expression.
 *
 * @param {number} range The range to convert
 * @returns {DicePool} The resulting dice pool
 */
export function rangeToDiceExpression(range: number) {
  let remains = range;

  const dice = createDicePool();

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

/**
 * Rolls a dice expression.
 *
 * @param {string} expression The dice expression to roll
 * @param {RNG.RNG} rng The random number generator to use
 * @returns {number} The result of the roll
 */
export function roll(
  expression: string,
  rng: RNG.RNG = new RNG.RNG(Date.now().toString()),
): number {
  let phrases: string[] = [];
  let expressionType = 'straight';
  let parts = [];
  let useModifier = true;
  let modValue = 0;

  if (expression.includes('+')) {
    phrases = expression.split('+');
    expressionType = 'added';
  } else if (expression.includes('-')) {
    phrases = expression.split('-');
    expressionType = 'subtracted';
  } else if (expression.includes('x')) {
    phrases = expression.split('x');
    expressionType = 'multiplied';
  } else {
    useModifier = false;
  }

  if (useModifier) {
    for (let i = 1; i < phrases.length; i++) {
      const modParts = phrases[i].split('d');

      if (modParts.length > 1) {
        const n = Number(modParts[0]);
        const s = Number(modParts[1]);
        modValue += rollSimple(n, s, rng);
      } else {
        modValue += Number(phrases[i]);
      }
    }
    parts = phrases[0].split('d');
  } else {
    parts = expression.split('d');
  }

  let roll = rollSimple(Number(parts[0]), Number(parts[1]), rng);

  if (expressionType === 'added') {
    roll += modValue;
  } else if (expressionType === 'subtracted') {
    roll -= modValue;
  } else if (expressionType === 'multiplied') {
    roll *= modValue;
  }

  return roll;
}

function rollSimple(n: number, s: number, rng: RNG.RNG): number {
  let result = 0;

  for (let i = 0; i < n; i++) {
    result += rng.int(1, s);
  }

  return result;
}

/**
 * Simplifies a dice pool to the single highest die type.
 *
 * @param {DicePool} dice The dice pool to simplify
 * @returns {DicePool} The simplified dice pool
 */
export function simplify(dice: DicePool): DicePool {
  // This function takes a set of dice and simplifies them to a single die type, dropping everything else
  const result = createDicePool();

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

/**
 * Calculates the "power" of a dice pool.
 * The power is defined as the most likely combined result of the dice.
 * If there are multiple equally-likely results, the highest of them is returned.
 *
 * @param {DicePool} pool The dice pool to calculate the power for
 * @returns {number} The power
 */
export function getPower(pool: DicePool): number {
  const sidesList: number[] = [];
  if (pool.d4 > 0) for (let i = 0; i < pool.d4; i++) sidesList.push(4);
  if (pool.d6 > 0) for (let i = 0; i < pool.d6; i++) sidesList.push(6);
  if (pool.d8 > 0) for (let i = 0; i < pool.d8; i++) sidesList.push(8);
  if (pool.d10 > 0) for (let i = 0; i < pool.d10; i++) sidesList.push(10);
  if (pool.d12 > 0) for (let i = 0; i < pool.d12; i++) sidesList.push(12);
  if (pool.d20 > 0) for (let i = 0; i < pool.d20; i++) sidesList.push(20);
  if (pool.d100 > 0) for (let i = 0; i < pool.d100; i++) sidesList.push(100);

  // If no dice, just return the modifier
  if (sidesList.length === 0) {
    if (pool.modifierType === '*') return 0;
    if (pool.modifierType === '+') return pool.modifier;
    if (pool.modifierType === '-') return -pool.modifier;
    return 0;
  }

  // Convolution to find probability distribution of sums
  // weights[i] = number of ways to roll a sum of i
  let weights: number[] = [1]; // Start with sum 0 having 1 way (no dice yet)

  for (const sides of sidesList) {
    const prevWeights = weights;
    const newMaxSum = prevWeights.length - 1 + sides;
    const nextWeights = new Array(newMaxSum + 1).fill(0);

    // Optimization: Sliding window sum
    // nextWeights[k] = sum(prevWeights[k - sides] ... prevWeights[k - 1])
    let currentSum = 0;

    for (let k = 1; k <= newMaxSum; k++) {
      // Add the term entering the window: prevWeights[k-1]
      const addIndex = k - 1;
      if (addIndex < prevWeights.length) {
        currentSum += prevWeights[addIndex];
      }

      // Remove the term leaving the window: prevWeights[k - 1 - sides]
      const removeIndex = k - 1 - sides;
      if (removeIndex >= 0 && removeIndex < prevWeights.length) {
        currentSum -= prevWeights[removeIndex];
      }

      nextWeights[k] = currentSum;
    }

    // Normalize if needed to prevent overflow for huge pools
    let maxW = 0;
    for (const w of nextWeights) if (w > maxW) maxW = w;
    if (maxW > 1e200) {
      for (let i = 0; i < nextWeights.length; i++) nextWeights[i] /= 1e100;
    }

    weights = nextWeights;
  }

  // Find the highest sum with the maximum weight
  let maxWeight = -1;
  let bestSum = 0;

  for (let i = 0; i < weights.length; i++) {
    if (weights[i] > maxWeight) {
      maxWeight = weights[i];
    }
  }

  for (let i = weights.length - 1; i >= 0; i--) {
    if (weights[i] >= maxWeight) {
      bestSum = i;
      break;
    }
  }

  let result = bestSum;

  if (pool.modifierType === '*') {
    result *= pool.modifier;
  } else if (pool.modifierType === '+') {
    result += pool.modifier;
  } else {
    result -= pool.modifier;
  }

  return result;
}

/**
 * Creates a DicePool that approximates a given power level.
 * Prefers multiple dice of the same type over modifiers or mixed dice.
 * Only uses addition modifiers.
 *
 * @param {number} power The target power level
 * @param {number} preferredSide The preferred die size (e.g. 6 for d6)
 * @returns {DicePool} The resulting dice pool
 */
export function getDicePoolFromPower(power: number, preferredSide: number): DicePool {
  const getPowerEstimate = (n: number, s: number) => {
    if (n === 0) return 0;
    if (n === 1) return s;
    return Math.ceil((n * (s + 1)) / 2);
  };

  let bestN = 0;
  let bestPEst = 0;

  let currentN = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pEst = getPowerEstimate(currentN, preferredSide);

    if (pEst > power) {
      // Overshot. Stop.
      break;
    }

    bestN = currentN;
    bestPEst = pEst;

    currentN++;
    if (currentN > 1000) break; // Safety limit
  }

  const modifier = power - bestPEst;

  const pool = createDicePool();

  if (preferredSide === 4) pool.d4 = bestN;
  else if (preferredSide === 6) pool.d6 = bestN;
  else if (preferredSide === 8) pool.d8 = bestN;
  else if (preferredSide === 10) pool.d10 = bestN;
  else if (preferredSide === 12) pool.d12 = bestN;
  else if (preferredSide === 20) pool.d20 = bestN;
  else if (preferredSide === 100) pool.d100 = bestN;

  if (modifier > 0) {
    pool.modifier = modifier;
    pool.modifierType = '+';
  }

  return pool;
}

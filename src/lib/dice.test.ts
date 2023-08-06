'use strict';

import * as Dice from '../src/modules/dice';

test('range to expression of 1d4 should have one d4 and nothing else', () => {
  const dicePool = Dice.rangeToDiceExpression(4);

  expect(dicePool).toEqual({
    d4: 1,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 0,
    d100: 0,
    modifier: 0,
    modifierType: '+',
  });
});

test('describing dice pool with 1d4 and 1d20 and 3 modifier should result in 1d20+1d4+3', () => {
  let dicePool = new Dice.DicePool();
  dicePool.d4 = 1;
  dicePool.d20 = 1;
  dicePool.modifier = 3;

  const description = Dice.describeDice(dicePool);

  expect(description).toBe('1d20+1d4+3');
});

test('simplifying dice pool with 1d4 and 1d20 and 3 modifier should result in 1d20', () => {
  let dicePool = new Dice.DicePool();
  dicePool.d4 = 1;
  dicePool.d20 = 1;
  dicePool.modifier = 3;

  const simplifiedDicePool = Dice.simplify(dicePool);

  expect(simplifiedDicePool).toEqual({
    d4: 0,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 1,
    d100: 0,
    modifier: 0,
    modifierType: '+',
  });
});

test('describing a simplified range of 4 should be 1d4', () => {
  const dicePool = Dice.rangeToDiceExpression(4);
  const simplifiedDicePool = Dice.simplify(dicePool);
  const description = Dice.describeDice(simplifiedDicePool);

  expect(description).toBe('1d4');
});

test('describing a simplified range of 13 should be 1d12', () => {
  const dicePool = Dice.rangeToDiceExpression(13);
  const simplifiedDicePool = Dice.simplify(dicePool);
  const description = Dice.describeDice(simplifiedDicePool);

  expect(description).toBe('1d12');
});

test('rolling 1d6x100 should result in a number over 99', () => {
  const roll = Dice.roll('1d6x100');

  expect(roll).toBeGreaterThan(99);
});

test('rolling 1d6+100 should result in a number over 99', () => {
  const roll = Dice.roll('1d6+100');

  expect(roll).toBeGreaterThan(99);
});

test('rolling 1d6-10 should result in a number below 0', () => {
  const roll = Dice.roll('1d6-10');

  expect(roll).toBeLessThan(0);
});

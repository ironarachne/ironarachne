'use strict';

export function cmToInches(cm: number) {
  return Math.floor(cm * 0.3937);
}

export function kgToPounds(kg: number) {
  return Math.floor(kg * 2.2046);
}

export function inchesToFeet(inches: number) {
  let expression = '';

  const feet = Math.floor(inches / 12);

  const remainder = inches % 12;

  expression += feet + "'" + remainder + '"';

  return expression;
}

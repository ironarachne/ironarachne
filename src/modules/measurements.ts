'use strict';

export function cmToInches(cm: number): number {
  return cm * 0.3937;
}

export function kgToPounds(kg: number): number {
  return kg * 2.2046;
}

export function metersToFeet(meters: number): number {
  return meters * 3.2808;
}

export function inchesToCM(inches: number): number {
  return inches * 2.54;
}

export function poundsToKG(pounds: number): number {
  return pounds * 0.4536;
}

export function inchesToFeetExpression(inches: number): string {
  let expression = '';

  const feet = Math.floor(inches / 12);

  const remainder = Math.floor(inches % 12);

  expression += feet + "'" + remainder + '"';

  return expression;
}

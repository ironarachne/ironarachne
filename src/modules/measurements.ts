"use strict";

export function cmToInches(cm: number) {
  return Math.floor(cm * 0.3937);
}

export function kgToPounds(kg: number) {
  return Math.floor(kg * 2.2046);
}

export function inchesToFeet(inches: number) {
  let expression = "";

  let feet = Math.floor(inches / 12);

  let remainder = inches % 12;

  expression += feet + "'" + remainder + "\"";

  return expression;
}

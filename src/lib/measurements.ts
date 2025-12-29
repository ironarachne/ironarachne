export function cToK(c: number): number {
  return c + 273.15;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function cmToInches(cm: number): number {
  return cm * 0.3937;
}

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function fToK(f: number): number {
  return ((f - 32) * 5) / 9 + 273.15;
}

export function kToC(k: number): number {
  return k - 273.15;
}

export function kToF(k: number): number {
  return ((k - 273.15) * 9) / 5 + 32;
}

export function kgToPounds(kg: number): number {
  return kg * 2.2046;
}

export function feetToMeters(feet: number): number {
  return feet * 0.3048;
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
  let expression = "";

  const feet = Math.floor(inches / 12);

  const remainder = Math.floor(inches % 12);

  expression += `${feet}'${remainder}"`;

  return expression;
}

export function cmToInches(cm) {
  let inches = Math.floor(cm * 0.3937);

  return inches;
}

export function kgToPounds(kg) {
  let pounds = Math.floor(kg * 2.2046);

  return pounds;
}

export function inchesToFeet(inches) {
  let expression = "";

  let feet = Math.floor(inches / 12);

  let remainder = inches % 12;

  expression += feet + "'" + remainder + '"';

  return expression;
}

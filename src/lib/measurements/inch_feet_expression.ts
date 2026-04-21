export function inchesToFeetExpression(inches: number): string {
  let expression = '';

  const feet = Math.floor(inches / 12);

  const remainder = Math.floor(inches % 12);

  expression += `${feet}'${remainder}"`;

  return expression;
}

const random = require("random");

export function roll(expression) {
  let parts = expression.split("+");
  let modifier = 0;

  if (parts.length == 1) {
    parts = parts.split("d")
  } else {
    modifier = parts[1];
    parts = parts[0].split("d");
  }

  let number = Number(parts[0]);
  let sides = Number(parts[1]);

  let result = 0;

  for (let i = 0; i < number; i++) {
    result += random.int(1, sides);
  }

  result += Number(modifier);

  return result;
}

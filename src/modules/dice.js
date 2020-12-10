const random = require("random");

export function roll(expression) {
  let split = expression.split("d");

  let number = Number(split[0]);
  let sides = Number(split[1]);

  let result = 0;

  for (let i = 0; i < number; i++) {
    result += random.int(1, sides);
  }

  return result;
}

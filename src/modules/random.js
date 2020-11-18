const random = require("random");

export function item(items) {
  let item = items[random.int(0, items.length - 1)];
  return item;
}

export function randomString(length) {
  return Math.round(
    Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)
  )
    .toString(36)
    .slice(1);
}

export function weighted(items) {
  let ceiling = 0;

  items.forEach(function (item) {
    ceiling += item.weight;
  });

  let randomValue = random.int(0, ceiling);

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    randomValue -= item.weight;
    if (randomValue <= 0) {
      return item.item;
    }
  }

  return "shouldn't get here";
}

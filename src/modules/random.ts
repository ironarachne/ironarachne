"use strict";

import random from "random";

export function item(items: any[]) {
  return items[random.int(0, items.length - 1)];
}

export function randomString(length: number): string {
  let result: string = '';

  for (let i=0;i<length;i++) {
    result += Math.random().toString(36).slice(2)[0];
  }

  return result;
}

export function shuffle(items: any[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  return items;
}

export function weighted(items: any[]) {
  let ceiling = 0;

  items.forEach(function (item: any) {
    ceiling += item.weight;
  });

  let randomValue = random.int(0, ceiling);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    randomValue -= item.weight;
    if (randomValue <= 0) {
      return item;
    }
  }

  return "shouldn't get here";
}

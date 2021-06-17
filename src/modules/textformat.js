"use strict";

export function list(items) {
  let result = "";

  for (let i = 0; i < items.length; i++) {
    result += "- " + items[i] + "\n";
  }

  result += "\n";

  return result;
}

export function header(text) {
  return "\n" + text + "\n\n";
}

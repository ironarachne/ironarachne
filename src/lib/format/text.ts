export function list(items: string[]) {
  let result = "";

  for (let i = 0; i < items.length; i++) {
    result += "- " + items[i] + "\n";
  }

  result += "\n";

  return result;
}

export function header(text: string) {
  return "\n" + text + "\n\n";
}

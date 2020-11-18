export function article(word) {
  let exceptions = ["honor", "honest", "herb"];

  if (exceptions.includes(word)) {
    return "an";
  }

  let vowels = ["a", "e", "i", "o", "u"];

  if (vowels.includes(word.substr(0, 1))) {
    return "an";
  } else {
    return "a";
  }
}

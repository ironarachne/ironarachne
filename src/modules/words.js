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

export function arrayToPhrase(words) {
  if (words.length == 1) {
    return words[0];
  } else if (words.length == 2) {
    return words[0] + " and " + words[1];
  }

  let phrase = "";

  for (let i = 0; i < words.length; i++) {
    if (i == words.length - 1) {
      if (words.length > 2) {
        phrase += ",";
      }
      phrase += " and " + words[i];
    } else if (i == 0) {
      phrase = words[i];
    } else {
      phrase += ", " + words[i];
    }
  }

  return phrase;
}

export function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

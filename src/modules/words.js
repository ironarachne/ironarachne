"use strict";

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
  if (words.length === 1) {
    return words[0];
  } else if (words.length === 2) {
    return words[0] + " and " + words[1];
  }

  let phrase = "";

  for (let i = 0; i < words.length; i++) {
    if (i === words.length - 1) {
      if (words.length > 2) {
        phrase += ",";
      }
      phrase += " and " + words[i];
    } else if (i === 0) {
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

export function uncapitalize(word) {
  return word[0].toLowerCase() + word.slice(1);
}

export function genderNoun(gender, ageGroupName) {
  let noun = "";

  if (gender === "female") {
    noun = "woman";

    if (ageGroupName === "infant") {
      noun = "baby girl";
    } else if (ageGroupName === "child" || ageGroupName === "teenager") {
      noun = "girl";
    }
  } else {
    noun = "man";

    if (ageGroupName === "infant") {
      noun = "baby boy";
    } else if (ageGroupName === "child" || ageGroupName === "teenager") {
      noun = "boy";
    }
  }

  return noun;
}

export function pronoun(gender, wordCase) {
  let pronoun = "";

  if (gender === "female") {
    if (wordCase === "subjective") {
      pronoun = "she";
    } else if (wordCase === "possessive") {
      pronoun = "her";
    } else if (wordCase === "objective") {
      pronoun = "her";
    }
  } else {
    if (wordCase === "subjective") {
      pronoun = "he";
    } else if (wordCase === "possessive") {
      pronoun = "his";
    } else if (wordCase === "objective") {
      pronoun = "him";
    }
  }

  return pronoun;
}

export function removeEntry(word, words) {
  let newWords = [];

  for (let i = 0; i < words.length; i++) {
    if (words[i] != word) {
      newWords.push(words[i]);
    }
  }

  return newWords;
}

export function romanize(num) {
  if (isNaN(num)) return NaN;
  var digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ],
    roman = "",
    i = 3;
  while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}

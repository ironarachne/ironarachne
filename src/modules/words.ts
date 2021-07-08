"use strict";

export function article(word: string) {
  const exceptions = ["honor", "honest", "herb"];

  if (exceptions.includes(word)) {
    return "an";
  }

  const vowels = ["a", "e", "i", "o", "u"];

  if (vowels.includes(word.substr(0, 1))) {
    return "an";
  } else {
    return "a";
  }
}

export function arrayToPhrase(words: string[]) {
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

export function capitalize(word: string) {
  return word[0].toUpperCase() + word.slice(1);
}

export function uncapitalize(word: string) {
  return word[0].toLowerCase() + word.slice(1);
}

export function genderNoun(gender: string, ageGroupName: string) {
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

export function getMonthAbbr(month: number) {
  const months = [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.'
  ];

  return months[month];
}

export function getMonthName(month: number) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  return months[month];
}

export function getOrdinal(number: number) {
  const lastDigitOfNumber = number % 10;

  switch (lastDigitOfNumber) {
      case 1:
          return 'st';
      case 2:
          return 'nd';
      case 3:
          return 'rd';
      default:
          return 'th';
  }
}

export function pronoun(gender: string, wordCase: string) {
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

export function removeEntry(word: string, words: string[]) {
  const newWords = [];

  for (let i = 0; i < words.length; i++) {
    if (words[i] != word) {
      newWords.push(words[i]);
    }
  }

  return newWords;
}

export function romanize(num: number) {
  if (isNaN(num)) return NaN;
  const digits = String(+num).split("");
  const key = [
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
    ];
  let roman = "";
  let i = 3;
  while (i--) {
    if (digits.length > 0) {
      const digit = digits.pop();
      if (typeof(digit) == 'string') {
        roman = (key[+digit + i * 10] || "") + roman;
      }
    }
  }
  return Array(+digits.join("") + 1).join("M") + roman;
}
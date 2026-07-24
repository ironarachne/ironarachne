function firstAlphabeticChar(token: string): string {
  for (const char of token) {
    if (/[a-z]/i.test(char)) {
      return char;
    }
  }
  return '';
}

function firstTwoAlphabeticChars(token: string): string {
  let result = '';
  for (const char of token) {
    if (/[a-z]/i.test(char)) {
      result += char;
      if (result.length === 2) {
        break;
      }
    }
  }
  return result;
}

/**
 * Two significant characters from an archetype display name, uppercased.
 */
export function archetypeNameToBadgeInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    const first = firstAlphabeticChar(words[0]!);
    const second = firstAlphabeticChar(words[1]!);
    return `${first}${second}`.toUpperCase();
  }

  const single = firstTwoAlphabeticChars(words[0] ?? name);
  return single
    .toUpperCase()
    .padEnd(2, single.toUpperCase() || '?')
    .slice(0, 2);
}

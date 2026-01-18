import type { Character, Title } from "./character_types";

export function getStandardNobleTitles(): Title[] {
    return [
        {
            femaleTitle: "Empress",
            maleTitle: "Emperor",
            femaleHonorific: "{pronoun} Imperial Majesty",
            maleHonorific: "{pronoun} Imperial Majesty",
            precedence: 0,
            isHereditary: true,
            isNoble: true,
            isRoyal: true,
            hasLands: true,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Queen",
            maleTitle: "King",
            femaleHonorific: "{pronoun} Majesty",
            maleHonorific: "{pronoun} Majesty",
            precedence: 1,
            isHereditary: true,
            isNoble: true,
            isRoyal: true,
            hasLands: true,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Crown Princess",
            maleTitle: "Crown Prince",
            femaleHonorific: "{pronoun} Highness",
            maleHonorific: "{pronoun} Highness",
            precedence: 2,
            isHereditary: true,
            isNoble: true,
            isRoyal: true,
            hasLands: false,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Princess",
            maleTitle: "Prince",
            femaleHonorific: "{pronoun} Highness",
            maleHonorific: "{pronoun} Highness",
            precedence: 3,
            isHereditary: true,
            isNoble: true,
            isRoyal: true,
            hasLands: false,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Grand Duchess",
            maleTitle: "Grand Duke",
            femaleHonorific: "{pronoun} Grace",
            maleHonorific: "{pronoun} Grace",
            precedence: 4,
            isHereditary: true,
            isNoble: true,
            isRoyal: true,
            hasLands: true,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Duchess",
            maleTitle: "Duke",
            femaleHonorific: "{pronoun} Grace",
            maleHonorific: "{pronoun} Grace",
            precedence: 5,
            isHereditary: true,
            isNoble: true,
            isRoyal: false,
            hasLands: true,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Marquess",
            maleTitle: "Marquis",
            femaleHonorific: "{pronoun} Excellency",
            maleHonorific: "{pronoun} Excellency",
            precedence: 6,
            isHereditary: true,
            isNoble: true,
            isRoyal: false,
            hasLands: true,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Countess",
            maleTitle: "Count",
            femaleHonorific: "{pronoun} Excellency",
            maleHonorific: "{pronoun} Excellency",
            precedence: 7,
            isHereditary: true,
            isNoble: true,
            isRoyal: false,
            hasLands: true,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Baroness",
            maleTitle: "Baron",
            femaleHonorific: "Lady",
            maleHonorific: "Lord",
            precedence: 8,
            isHereditary: true,
            isNoble: true,
            isRoyal: false,
            hasLands: true,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Lady",
            maleTitle: "Lord",
            femaleHonorific: "Lady",
            maleHonorific: "Lord",
            precedence: 9,
            isHereditary: false,
            isNoble: true,
            isRoyal: false,
            hasLands: false,
            landName: "",
            tags: []
        },
        {
            femaleTitle: "Dame",
            maleTitle: "Knight",
            femaleHonorific: "Dame",
            maleHonorific: "Sir",
            precedence: 10,
            isHereditary: false,
            isNoble: false,
            isRoyal: false,
            hasLands: false,
            landName: "",
            tags: []
        }
    ];
}

export function getNobleTitleByName(name: string): Title {
    const titles = getStandardNobleTitles();
    const title = titles.find(t => t.maleTitle.toLowerCase() === name.toLowerCase() || t.femaleTitle.toLowerCase() === name.toLowerCase());

    if (!title) {
        throw new Error(`Title with name "${name}" not found.`);
    }

    return title;
}

export function getTitleForGender(gender: string, title: Title): string {
  if (gender === "female") {
    return title.femaleTitle;
  }
  return title.maleTitle;
}

export function getHonorific(gender: string, title: Title): string {
  if (gender === 'female') {
    return title.femaleHonorific;
  }
  return title.maleHonorific;
}

export function hasHigherPrecedenceThan(title1: Title, title2: Title): boolean {
  return title1.precedence > title2.precedence;
}

export function hasLowerPrecedenceThan(title1: Title, title2: Title): boolean {
  return title1.precedence < title2.precedence;
}

export function getHighestPrecedenceTitle(titles: Title[]): Title | null {
    if (titles.length === 0) {
        return null;
    }

    let highestPrecedenceTitle = titles[0];

    for (let i = 1; i < titles.length; i++) {
        if (titles[i].precedence < highestPrecedenceTitle.precedence) {
            highestPrecedenceTitle = titles[i];
        }
    }

    return highestPrecedenceTitle;
}

export function getTitle(character: Character): string {
  const primaryTitle = getHighestPrecedenceTitle(character.titles || []);

  if (primaryTitle) {
    return getTitleForGender(character.gender.name, primaryTitle);
  }

  return '';
}
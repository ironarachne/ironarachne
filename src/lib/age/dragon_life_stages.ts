import type AgeCategory from './age_category';

/**
 * Five age bands for true dragons (wyrmling through great wyrm).
 * Year spans are fantasy scale, D&D-flavored.
 */
export function dragonLifespanTrueWyrm(): AgeCategory[] {
  return [
    {
      name: 'wyrmling',
      noun: 'wyrmling',
      minAge: 0,
      maxAge: 8,
      genderedNoun: ['wyrmling', 'wyrmling', 'wyrmling'],
      commonality: 2,
    },
    {
      name: 'young',
      noun: 'young dragon',
      minAge: 9,
      maxAge: 99,
      genderedNoun: ['young she-dragon', 'young he-dragon', 'young dragon'],
      commonality: 8,
    },
    {
      name: 'adult',
      noun: 'adult dragon',
      minAge: 100,
      maxAge: 799,
      genderedNoun: ['she-dragon', 'he-dragon', 'dragon'],
      commonality: 20,
    },
    {
      name: 'ancient',
      noun: 'ancient dragon',
      minAge: 800,
      maxAge: 1999,
      genderedNoun: ['ancient she-dragon', 'ancient he-dragon', 'ancient dragon'],
      commonality: 5,
    },
    {
      name: 'great_wyrm',
      noun: 'great wyrm',
      minAge: 2000,
      maxAge: 5000,
      genderedNoun: ['great she-wyrm', 'great he-wyrm', 'great wyrm'],
      commonality: 1,
    },
  ];
}

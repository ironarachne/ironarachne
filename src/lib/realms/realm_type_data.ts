import { createTitleFromCore } from '$lib/characters/titles.js';
import type RealmType from './realm_type.js';

/**
 * The realm types, from barony up to empire.
 *
 * `kingdom` and `empire` are named because the smaller types point at one of them as their
 * `parentType`, and region generation follows that pointer to build the realm above a vassal. They
 * are module constants rather than locals so every caller sees the same objects — with the table
 * rebuilt per call, a realm's `parentType` was a different object from the entry of the same name
 * in the table it came from.
 *
 * Shared and read-only.
 */
const kingdom = {
  name: 'kingdom',
  minTiles: 10,
  maxTiles: 50,
  grantedTitle: createTitleFromCore(
    {
      femaleTitle: 'Queen',
      maleTitle: 'King',
      femaleHonorific: 'Queen',
      maleHonorific: 'King',
      hasLands: true,
      landName: 'Kingdom of',
      precedence: 7,
    },
    { isHereditary: true, isNoble: true, isRoyal: true },
  ),
  commonality: 5,
  isStandalone: true,
  parentType: null,
};
const empire = {
  name: 'empire',
  minTiles: 50,
  maxTiles: 100,
  grantedTitle: createTitleFromCore(
    {
      femaleTitle: 'Empress',
      maleTitle: 'Emperor',
      femaleHonorific: 'Empress',
      maleHonorific: 'Emperor',
      hasLands: true,
      landName: 'Empire of',
      precedence: 8,
    },
    { isHereditary: true, isNoble: true, isRoyal: true },
  ),
  commonality: 5,
  isStandalone: true,
  parentType: null,
};

export const REALM_TYPES: RealmType[] = [
  {
    name: 'earldom',
    minTiles: 2,
    maxTiles: 4,
    grantedTitle: createTitleFromCore(
      {
        femaleTitle: 'Earl',
        maleTitle: 'Earl',
        femaleHonorific: 'Lady',
        maleHonorific: 'Lord',
        hasLands: true,
        landName: 'Earldom of',
        precedence: 2,
      },
      { isHereditary: true, isNoble: true },
    ),
    commonality: 5,
    isStandalone: false,
    parentType: kingdom,
  },
  {
    name: 'county',
    minTiles: 4,
    maxTiles: 6,
    grantedTitle: createTitleFromCore(
      {
        femaleTitle: 'Countess',
        maleTitle: 'Count',
        femaleHonorific: 'Countess',
        maleHonorific: 'Count',
        hasLands: true,
        landName: 'County of',
        precedence: 3,
      },
      { isHereditary: true, isNoble: true },
    ),
    commonality: 20,
    isStandalone: false,
    parentType: kingdom,
  },
  {
    name: 'barony',
    minTiles: 6,
    maxTiles: 8,
    grantedTitle: createTitleFromCore(
      {
        femaleTitle: 'Baroness',
        maleTitle: 'Baron',
        femaleHonorific: 'Baroness',
        maleHonorific: 'Baron',
        hasLands: true,
        landName: 'Barony of',
        precedence: 4,
      },
      { isHereditary: true, isNoble: true },
    ),
    commonality: 10,
    isStandalone: false,
    parentType: kingdom,
  },
  {
    name: 'duchy',
    minTiles: 8,
    maxTiles: 10,
    grantedTitle: createTitleFromCore(
      {
        femaleTitle: 'Duchess',
        maleTitle: 'Duke',
        femaleHonorific: 'Duchess',
        maleHonorific: 'Duke',
        hasLands: true,
        landName: 'Duchy of',
        precedence: 5,
      },
      { isHereditary: true, isNoble: true },
    ),
    commonality: 5,
    isStandalone: false,
    parentType: kingdom,
  },
  {
    name: 'grand duchy',
    minTiles: 10,
    maxTiles: 12,
    grantedTitle: createTitleFromCore(
      {
        femaleTitle: 'Grand Duchess',
        maleTitle: 'Grand Duke',
        femaleHonorific: 'Grand Duchess',
        maleHonorific: 'Grand Duke',
        hasLands: true,
        landName: 'Grand Duchy of',
        precedence: 6,
      },
      { isHereditary: true, isNoble: true },
    ),
    commonality: 2,
    isStandalone: false,
    parentType: kingdom,
  },
  {
    name: 'principality',
    minTiles: 12,
    maxTiles: 14,
    grantedTitle: createTitleFromCore(
      {
        femaleTitle: 'Princess',
        maleTitle: 'Prince',
        femaleHonorific: 'Princess',
        maleHonorific: 'Prince',
        hasLands: true,
        landName: 'Principality of',
        precedence: 7,
      },
      { isHereditary: true, isNoble: true, isRoyal: true },
    ),
    commonality: 2,
    isStandalone: false,
    parentType: kingdom,
  },
  {
    name: 'province',
    minTiles: 12,
    maxTiles: 14,
    grantedTitle: createTitleFromCore(
      {
        femaleTitle: 'Governor',
        maleTitle: 'Governor',
        femaleHonorific: 'Governor',
        maleHonorific: 'Governor',
        hasLands: true,
        landName: 'Province of',
        precedence: 7,
      },
      { isHereditary: false, isNoble: true },
    ),
    commonality: 1,
    isStandalone: false,
    parentType: empire,
  },
  kingdom,
  empire,
];

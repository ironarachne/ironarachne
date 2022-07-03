'use strict';

import Component from './component';

export function all(): Component[] {
  return [
    new Component('cotton', 'a bolt of cotton fabric', 'cotton', 'fabric', 'coarse fabric', 1, 0, [
      'fabric',
    ]),
    new Component('linen', 'a bolt of linen fabric', 'linen', 'fabric', 'coarse fabric', 10, 0, [
      'fabric',
    ]),
    new Component('wool', 'a bolt of woolen fabric', 'wool', 'fabric', 'coarse fabric', 15, 0, [
      'fabric',
    ]),
    new Component('silk', 'a bolt of silk fabric', 'silk', 'fabric', 'fine fabric', 40, 2, [
      'fabric',
    ]),
    new Component(
      'fine silk',
      'a bolt of fine silk fabric',
      'fine silk',
      'fabric',
      'fine fabric',
      80,
      3,
      ['fabric'],
    ),
  ];
}

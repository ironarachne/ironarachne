'use strict';

import Component from './component';

export function all(): Component[] {
  return [
    new Component('cotton', 'a bolt of cotton fabric', 'cotton', 'fabric', 'coarse fabric', 1),
    new Component('linen', 'a bolt of linen fabric', 'linen', 'fabric', 'coarse fabric', 10),
    new Component('wool', 'a bolt of woolen fabric', 'wool', 'fabric', 'coarse fabric', 15),
    new Component('silk', 'a bolt of silk fabric', 'silk', 'fabric', 'fine fabric', 40),
    new Component(
      'fine silk',
      'a bolt of fine silk fabric',
      'fine silk',
      'fabric',
      'fine fabric',
      80,
    ),
  ];
}

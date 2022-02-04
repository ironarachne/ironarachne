'use strict';

import * as Components from './components';

export function all(): Components.Component[] {
  return [
    new Components.Component(
      'cotton',
      'a bolt of cotton fabric',
      'cotton',
      'fabric',
      'coarse fabric',
      2,
    ),
    new Components.Component(
      'linen',
      'a bolt of linen fabric',
      'linen',
      'fabric',
      'coarse fabric',
      1,
    ),
    new Components.Component(
      'wool',
      'a bolt of woolen fabric',
      'wool',
      'fabric',
      'coarse fabric',
      1,
    ),
    new Components.Component('silk', 'a bolt of silk fabric', 'silk', 'fabric', 'fine fabric', 10),
  ];
}

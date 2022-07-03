'use strict';

import Component from './component';

export function all(): Component[] {
  return [
    new Component('pine wood', 'a log of pine', 'pine', 'wood', 'soft wood', 1, 0, ['wood']),
    new Component('cedar wood', 'a log of cedar', 'cedar', 'wood', 'soft wood', 2, 0, ['wood']),
    new Component('aspen wood', 'a log of aspen', 'aspen', 'wood', 'soft wood', 2, 0, ['wood']),
    new Component('fir wood', 'a log of fir', 'fir', 'wood', 'soft wood', 10, 1, ['wood']),
    new Component(
      'white cedar wood',
      'a log of white cedar',
      'white cedar',
      'wood',
      'soft wood',
      25,
      0,
      ['wood'],
    ),
    new Component(
      'silver fir wood',
      'a log of silver fir',
      'silver fir',
      'wood',
      'soft wood',
      10,
      1,
      ['wood'],
    ),
    new Component('poplar wood', 'a log of poplar', 'poplar', 'wood', 'soft wood', 1, 0, ['wood']),
    new Component('oak wood', 'a log of oak', 'oak', 'wood', 'hard wood', 1, 0, ['wood']),
    new Component('maple wood', 'a log of maple', 'maple', 'wood', 'hard wood', 30, 2, ['wood']),
    new Component('walnut wood', 'a log of walnut', 'walnut', 'wood', 'hard wood', 1, 0, ['wood']),
    new Component('cherry wood', 'a log of cherry', 'cherry', 'wood', 'hard wood', 20, 2, ['wood']),
    new Component('birch wood', 'a log of birch', 'birch', 'wood', 'hard wood', 5, 1, ['wood']),
    new Component('ironwood', 'a log of ironwood', 'ironwood', 'wood', 'hard wood', 60, 3, [
      'wood',
    ]),
    new Component('blackwood', 'a log of blackwood', 'blackwood', 'wood', 'hard wood', 50, 3, [
      'wood',
    ]),
    new Component('ebony', 'a log of ebony', 'ebony', 'wood', 'hard wood', 80, 2, ['wood']),
  ];
}

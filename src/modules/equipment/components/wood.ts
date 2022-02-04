'use strict';

import * as Components from './components';

export function all(): Components.Component[] {
  return [
    new Components.Component('pine wood', 'a log of pine', 'pine', 'wood', 'soft wood', 1),
    new Components.Component('cedar wood', 'a log of cedar', 'cedar', 'wood', 'soft wood', 2),
    new Components.Component('aspen wood', 'a log of aspen', 'aspen', 'wood', 'soft wood', 2),
    new Components.Component('fir wood', 'a log of fir', 'fir', 'wood', 'soft wood', 1),
    new Components.Component(
      'white cedar wood',
      'a log of white cedar',
      'white cedar',
      'wood',
      'soft wood',
      2,
    ),
    new Components.Component(
      'silver fir wood',
      'a log of silver fir',
      'silver fir',
      'wood',
      'soft wood',
      1,
    ),
    new Components.Component('poplar wood', 'a log of poplar', 'poplar', 'wood', 'soft wood', 1),
    new Components.Component('oak wood', 'a log of oak', 'oak', 'wood', 'hard wood', 1),
    new Components.Component('maple wood', 'a log of maple', 'maple', 'wood', 'hard wood', 1),
    new Components.Component('walnut wood', 'a log of walnut', 'walnut', 'wood', 'hard wood', 1),
    new Components.Component('cherry wood', 'a log of cherry', 'cherry', 'wood', 'hard wood', 1),
    new Components.Component('birch wood', 'a log of birch', 'birch', 'wood', 'hard wood', 5),
    new Components.Component('ironwood', 'a log of ironwood', 'ironwood', 'wood', 'hard wood', 60),
    new Components.Component(
      'blackwood',
      'a log of blackwood',
      'blackwood',
      'wood',
      'hard wood',
      3,
    ),
    new Components.Component('ebony', 'a log of ebony', 'ebony', 'wood', 'hard wood', 80),
  ];
}

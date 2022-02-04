'use strict';

import * as Components from './components';

export function all(): Components.Component[] {
  return [
    new Components.Component('copper bar', 'a bar of copper', 'copper', 'metal', 'soft metal', 5),
    new Components.Component('silver bar', 'a bar of silver', 'silver', 'metal', 'soft metal', 50),
    new Components.Component('gold bar', 'a bar of gold', 'gold', 'metal', 'soft metal', 5000),
    new Components.Component('bronze bar', 'a bar of bronze', 'bronze', 'metal', 'hard metal', 5),
    new Components.Component('iron bar', 'a bar of iron', 'iron', 'metal', 'hard metal', 10),
    new Components.Component('steel bar', 'a bar of steel', 'steel', 'metal', 'hard metal', 20),
    new Components.Component(
      'adamantine bar',
      'a bar of adamantine',
      'adamantine',
      'metal',
      'hard metal',
      10000,
    ),
    new Components.Component(
      'mithril bar',
      'a bar of mithril',
      'mithril',
      'metal',
      'hard metal',
      8000,
    ),
  ];
}

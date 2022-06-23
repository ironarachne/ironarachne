'use strict';

import Component from './component';

export function all(): Component[] {
  return [
    new Component('tin bar', 'a bar of tin', 'tin', 'metal', 'soft metal', 1),
    new Component('copper bar', 'a bar of copper', 'copper', 'metal', 'soft metal', 5),
    new Component('silver bar', 'a bar of silver', 'silver', 'metal', 'soft metal', 50),
    new Component('gold bar', 'a bar of gold', 'gold', 'metal', 'soft metal', 5000),
    new Component(
      'white gold bar',
      'a bar of white gold',
      'white gold',
      'metal',
      'soft metal',
      5000,
    ),
    new Component('brass bar', 'a bar of brass', 'brass', 'metal', 'soft metal', 10),
    new Component('bronze bar', 'a bar of bronze', 'bronze', 'metal', 'soft metal', 2),
    new Component('iron bar', 'a bar of iron', 'iron', 'metal', 'hard metal', 10),
    new Component('steel bar', 'a bar of steel', 'steel', 'metal', 'hard metal', 20),
    new Component(
      'adamantine bar',
      'a bar of adamantine',
      'adamantine',
      'metal',
      'hard metal',
      10000,
    ),
    new Component('mithril bar', 'a bar of mithril', 'mithril', 'metal', 'hard metal', 8000),
    new Component('titanium bar', 'a bar of titanium', 'titanium', 'metal', 'hard metal', 7500),
  ];
}

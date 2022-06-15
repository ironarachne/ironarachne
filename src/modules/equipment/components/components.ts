'use strict';

import * as Animal from './animal';
import * as Fabrics from './fabrics';
import * as Metals from './metals';
import * as Wood from './wood';
import * as RND from '../../random';
import Component from './component';

export function all(): Component[] {
  let result = [];

  result.push(...Animal.all());
  result.push(...Fabrics.all());
  result.push(...Metals.all());
  result.push(...Wood.all());

  return result;
}

export function getComponentForCategory(
  category: string,
  components: Component[],
  minValue: number,
  maxValue: number,
): Component {
  let possible = [];

  for (let i = 0; i < components.length; i++) {
    if (
      components[i].subType == category &&
      components[i].value <= maxValue &&
      components[i].value >= minValue
    ) {
      possible.push(components[i]);
    } else if (
      components[i].category == category &&
      components[i].value <= maxValue &&
      components[i].value >= minValue
    ) {
      possible.push(components[i]);
    }
  }

  return RND.item(possible);
}

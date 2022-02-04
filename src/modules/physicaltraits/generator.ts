'use strict';

import * as RND from '../random';
import PhysicalTrait from './physicaltrait';

export default class PhysicalTraitGenerator {
  name: string;
  category: string;
  options: string[];
  tags: string[];

  constructor(name: string, category: string, options: string[], tags: string[]) {
    this.name = name;
    this.category = category;
    this.options = options;
    this.tags = tags;
  }

  generate(): PhysicalTrait {
    let description = RND.item(this.options) + ' ' + this.name;

    return new PhysicalTrait(this.name, description, this.category, this.tags);
  }
}

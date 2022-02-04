'use strict';

import { Heraldry } from '../heraldry/heraldry';
import Subdivision from './subdivision';

export default abstract class Nation {
  name: string;
  description: string;
  heraldry: Heraldry;
  subdivisions: Subdivision[];

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}

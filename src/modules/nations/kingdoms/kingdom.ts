'use strict';

import Character from '../../characters/character';
import { Heraldry } from '../../heraldry/heraldry';
import Nation from '../nation';
import Subdivision from '../subdivision';

export default class Kingdom implements Nation {
  name: string;
  description: string;
  monarch: Character;
  heraldry: Heraldry;
  subdivisions: Subdivision[];

  constructor(name: string, monarch: Character) {
    this.name = name;
    this.monarch = monarch;
  }
}

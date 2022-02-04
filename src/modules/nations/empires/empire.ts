'use strict';

import Character from '../../characters/character';
import { Heraldry } from '../../heraldry/heraldry';
import Nation from '../nation';
import Subdivision from '../subdivision';

export default class Empire implements Nation {
  name: string;
  description: string;
  emperor: Character;
  heraldry: Heraldry;
  subdivisions: Subdivision[];

  constructor(name: string, emperor: Character) {
    this.name = name;
    this.emperor = emperor;
  }
}

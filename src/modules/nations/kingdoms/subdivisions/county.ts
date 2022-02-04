'use strict';

import Character from '../../../characters/character';
import Title from '../../../characters/title';
import Subdivision from '../../subdivision';

export default class County implements Subdivision {
  name: string;
  longName: string;
  title: Title;
  authority: Character;

  constructor(name: string) {
    this.name = name;
    this.longName = `the County of ${name}`;
    this.title = new Title('Countess', 'Count', 'Countess', 'Count', true, name, 4);
  }
}

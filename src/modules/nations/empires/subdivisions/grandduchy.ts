'use strict';

import Character from '../../../characters/character';
import Title from '../../../characters/title';
import Subdivision from '../../subdivision';

export default class GrandDuchy implements Subdivision {
  name: string;
  longName: string;
  title: Title;
  authority: Character;

  constructor(name: string) {
    this.name = name;
    this.longName = `the Grand Duchy of ${name}`;
    this.title = new Title(
      'Grand Duchess',
      'Grand Duke',
      'Grand Duchess',
      'Grand Duke',
      true,
      name,
      5,
    );
  }
}
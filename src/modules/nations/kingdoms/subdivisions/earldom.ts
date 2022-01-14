"use strict";

import Character from "../../../characters/character";
import Title from "../../../characters/title";
import Subdivision from "../../subdivision";

export default class Earldom implements Subdivision {
  name: string;
  longName: string;
  title: Title;
  authority: Character;

  constructor(name: string) {
    this.name = name;
    this.longName = `the Earldom of ${name}`;
    this.title = new Title("Earl", "Earl", "Lady", "Lord", true, name, 2);
  }
}

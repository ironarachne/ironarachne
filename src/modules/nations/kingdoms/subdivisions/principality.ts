"use strict";

import Character from "../../../characters/character";
import Title from "../../../characters/title";
import Subdivision from "../../subdivision";

export default class Principality implements Subdivision {
  name: string;
  longName: string;
  title: Title;
  authority: Character;

  constructor(name: string) {
    this.name = name;
    this.longName = `the Principality of ${name}`;
    this.title = new Title("Princess", "Prince", "Princess", "Prince", true, name, 6);
  }
}

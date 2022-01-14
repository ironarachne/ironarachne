"use strict";

import Character from "../../../characters/character";
import Title from "../../../characters/title";
import Subdivision from "../../subdivision";

export default class Duchy implements Subdivision {
  name: string;
  longName: string;
  title: Title;
  authority: Character;

  constructor(name: string) {
    this.name = name;
    this.longName = `the Duchy of ${name}`;
    this.title = new Title("Duchess", "Duke", "Duchess", "Duke", true, name, 5);
  }
}

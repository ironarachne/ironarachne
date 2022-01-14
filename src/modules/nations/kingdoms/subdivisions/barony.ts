"use strict";

import Character from "../../../characters/character";
import Title from "../../../characters/title";
import Subdivision from "../../subdivision";

export default class Barony implements Subdivision {
  name: string;
  longName: string;
  title: Title;
  authority: Character;

  constructor(name: string) {
    this.name = name;
    this.longName = `the Barony of ${name}`;
    this.title = new Title("Baroness", "Baron", "Baroness", "Baron", true, name, 3);
  }
}

"use strict";

import * as Dice from "../../../dice.js";
import ArtObjectGenerator from "../artobjectgenerator.js";
import CoinGenerator from "../coingenerator.js";
import GemGenerator from "../gemgenerator.js";
import MagicItemGenerator from "../magicitemgenerator.js";
import TreasureTable from "../table.js";
import TreasureTableEntry from "../tableentry.js";

export function horde(): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator("", "", "", "12d6x1000", "8d6x1000")),
    ]),
    new TreasureTable([
      new TreasureTableEntry(20, new ArtObjectGenerator(240000, 260000, Dice.roll("1d10"))),
      new TreasureTableEntry(30, new GemGenerator(95000, 100000, Dice.roll("3d6"))),
      new TreasureTableEntry(8, new GemGenerator(495000, 500000, Dice.roll("1d8"))),
      new TreasureTableEntry(10, new ArtObjectGenerator(740000, 760000, Dice.roll("1d4"))),
    ]),
    new TreasureTable([
      new TreasureTableEntry(5, new MagicItemGenerator(100000, 300000, Dice.roll("1d6"))),
    ]),
  ];
}

export function individual(): TreasureTable[] {
  return [
    new TreasureTable([
      new TreasureTableEntry(15, new CoinGenerator("", "", "2d6x1000", "8d6x100", "")),
      new TreasureTableEntry(40, new CoinGenerator("", "", "", "1d6x1000", "1d6x100")),
      new TreasureTableEntry(45, new CoinGenerator("", "", "", "1d6x1000", "2d6x100")),
    ]),
  ];
}

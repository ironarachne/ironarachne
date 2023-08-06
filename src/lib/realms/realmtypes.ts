"use strict";

import Title from "../characters/title.js";
import RealmType from "./realmtype.js";

export function all(): RealmType[] {
  let kingdom = new RealmType(
    "kingdom",
    10,
    50,
    new Title("Queen", "King", "Queen", "King", true, "Kingdom of", 7),
    5,
    true,
    null,
  );
  let empire = new RealmType(
    "empire",
    50,
    100,
    new Title("Empress", "Emperor", "Empress", "Emperor", true, "Empire of", 8),
    5,
    true,
    null,
  );

  return [
    new RealmType(
      "earldom",
      2,
      4,
      new Title("Earl", "Earl", "Lady", "Lord", true, "Earldom of", 2),
      5,
      false,
      kingdom,
    ),
    new RealmType(
      "county",
      4,
      6,
      new Title("Countess", "Count", "Countess", "Count", true, "County of", 3),
      20,
      false,
      kingdom,
    ),
    new RealmType(
      "barony",
      6,
      8,
      new Title("Baroness", "Baron", "Baroness", "Baron", true, "Barony of", 4),
      10,
      false,
      kingdom,
    ),
    new RealmType(
      "duchy",
      8,
      10,
      new Title("Duchess", "Duke", "Duchess", "Duke", true, "Duchy of", 5),
      5,
      false,
      kingdom,
    ),
    new RealmType(
      "grand duchy",
      10,
      12,
      new Title(
        "Grand Duchess",
        "Grand Duke",
        "Grand Duchess",
        "Grand Duke",
        true,
        "Grand Duchy of",
        6,
      ),
      2,
      false,
      kingdom,
    ),
    new RealmType(
      "principality",
      12,
      14,
      new Title("Princess", "Prince", "Princess", "Prince", true, "Principality of", 7),
      2,
      false,
      kingdom,
    ),
    new RealmType(
      "province",
      12,
      14,
      new Title("Governor", "Governor", "Governor", "Governor", true, "Province of", 7),
      1,
      false,
      empire,
    ),
    kingdom,
    empire,
  ];
}

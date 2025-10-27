import type { Charge } from "../../charge-types.js";
import seaHorseSVG from "./sea-horse.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const seaHorse: Charge = {
  name: "sea horse",
  pluralName: "sea horses",
  SVG: seaHorseSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "sea horse", "mythical"],
};

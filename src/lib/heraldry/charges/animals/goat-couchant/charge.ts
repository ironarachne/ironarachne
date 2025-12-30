import type { Charge } from "../../charge-types.js";
import goatCouchantSVG from "./goat-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const goatCouchant: Charge = {
  name: "goat couchant",
  pluralName: "goats couchant",
  SVG: goatCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "goat", "animals"],
};

import type { Charge } from "../../charge-types.js";
import boarCouchantSVG from "./boar-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const boarCouchant: Charge = {
  name: "boar couchant",
  pluralName: "boars couchant",
  SVG: boarCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["boar", "couchant", "animals"],
};

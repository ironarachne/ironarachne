import type { Charge } from "../../charge-types.js";
import bearCouchantSVG from "./bear-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const bearCouchant: Charge = {
  name: "bear couchant",
  pluralName: "bears couchant",
  SVG: bearCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "bear", "animals"],
};

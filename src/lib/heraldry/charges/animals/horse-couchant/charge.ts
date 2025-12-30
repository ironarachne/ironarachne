import type { Charge } from "../../charge-types.js";
import horseCouchantSVG from "./horse-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const horseCouchant: Charge = {
  name: "horse couchant",
  pluralName: "horses couchant",
  SVG: horseCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "horse", "animals"],
};

import type { Charge } from "../../charge-types.js";
import pegasusCouchantSVG from "./pegasus-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const pegasusCouchant: Charge = {
  name: "pegasus couchant",
  pluralName: "pegasuses couchant",
  SVG: pegasusCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "couchant", "pegasus"],
};

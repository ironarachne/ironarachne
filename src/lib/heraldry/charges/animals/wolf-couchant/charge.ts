import type { Charge } from "../../charge-types.js";
import wolfCouchantSVG from "./wolf-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wolfCouchant: Charge = {
  name: "wolf couchant",
  pluralName: "wolves couchant",
  SVG: wolfCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "wolf", "animals"],
};

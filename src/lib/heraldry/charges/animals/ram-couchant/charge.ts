import type { Charge } from "../../charge-types.js";
import ramCouchantSVG from "./ram-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const ramCouchant: Charge = {
  name: "ram couchant",
  pluralName: "rams couchant",
  SVG: ramCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "ram", "animals"],
};

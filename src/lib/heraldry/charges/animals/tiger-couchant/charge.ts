import type { Charge } from "../../charge-types.js";
import tigerCouchantSVG from "./tiger-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const tigerCouchant: Charge = {
  name: "tiger couchant",
  pluralName: "tigers couchant",
  SVG: tigerCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "tiger", "animals"],
};

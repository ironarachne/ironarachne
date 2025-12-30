import type { Charge } from "../../charge-types.js";
import housecatCouchantSVG from "./housecat-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const housecatCouchant: Charge = {
  name: "housecat couchant",
  pluralName: "housecats couchant",
  SVG: housecatCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["housecat", "couchant", "animals"],
};

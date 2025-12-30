import type { Charge } from "../../charge-types.js";
import squirrelCouchantSVG from "./squirrel-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const squirrelCouchant: Charge = {
  name: "squirrel couchant",
  pluralName: "squirrels couchant",
  SVG: squirrelCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "squirrel", "animals"],
};

import type { Charge } from "../../charge-types.js";
import squirrelSVG from "./squirrel.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const squirrel: Charge = {
  name: "squirrel",
  pluralName: "squirrels",
  SVG: squirrelSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "squirrel", "preparation"],
};

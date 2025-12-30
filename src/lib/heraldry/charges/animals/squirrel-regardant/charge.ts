import type { Charge } from "../../charge-types.js";
import squirrelRegardantSVG from "./squirrel-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const squirrelRegardant: Charge = {
  name: "squirrel regardant",
  pluralName: "squirrels regardant",
  SVG: squirrelRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "squirrel", "animals"],
};

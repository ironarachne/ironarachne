import type { Charge } from "../../charge-types.js";
import squirrelRampantSVG from "./squirrel-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const squirrelRampant: Charge = {
  name: "squirrel rampant",
  pluralName: "squirrels rampant",
  SVG: squirrelRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rampant", "squirrel", "animals"],
};

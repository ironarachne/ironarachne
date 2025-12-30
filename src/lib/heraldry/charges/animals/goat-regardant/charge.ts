import type { Charge } from "../../charge-types.js";
import goatRegardantSVG from "./goat-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const goatRegardant: Charge = {
  name: "goat regardant",
  pluralName: "goats regardant",
  SVG: goatRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "goat", "animals"],
};

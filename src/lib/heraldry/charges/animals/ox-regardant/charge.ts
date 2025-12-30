import type { Charge } from "../../charge-types.js";
import oxRegardantSVG from "./ox-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const oxRegardant: Charge = {
  name: "ox regardant",
  pluralName: "oxes regardant",
  SVG: oxRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "ox", "animals"],
};

import type { Charge } from "../../charge-types.js";
import pegasusPassantSVG from "./pegasus-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const pegasusPassant: Charge = {
  name: "pegasus passant",
  pluralName: "pegasi passant",
  SVG: pegasusPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monster", "pegasus", "mythical"],
};

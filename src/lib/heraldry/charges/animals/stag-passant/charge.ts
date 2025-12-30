import type { Charge } from "../../charge-types.js";
import stagPassantSVG from "./stag-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const stagPassant: Charge = {
  name: "stag passant",
  pluralName: "stags passant",
  SVG: stagPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["passant", "stag", "animals"],
};

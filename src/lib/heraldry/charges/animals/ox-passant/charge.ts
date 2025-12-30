import type { Charge } from "../../charge-types.js";
import oxPassantSVG from "./ox-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const oxPassant: Charge = {
  name: "ox passant",
  pluralName: "oxes passant",
  SVG: oxPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["passant", "ox", "animals"],
};

import type { Charge } from "../../charge-types.js";
import leopardPassantSVG from "./leopard-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const leopardPassant: Charge = {
  name: "leopard passant",
  pluralName: "leopards passant",
  SVG: leopardPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["passant", "leopard", "animals"],
};

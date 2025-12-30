import type { Charge } from "../../charge-types.js";
import leopardRampantSVG from "./leopard-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const leopardRampant: Charge = {
  name: "leopard rampant",
  pluralName: "leopards rampant",
  SVG: leopardRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rampant", "leopard", "animals"],
};

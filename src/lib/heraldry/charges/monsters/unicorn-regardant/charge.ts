import type { Charge } from "../../charge-types.js";
import unicornRegardantSVG from "./unicorn-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const unicornRegardant: Charge = {
  name: "unicorn regardant",
  pluralName: "unicorns regardant",
  SVG: unicornRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "regardant", "unicorn"],
};

import type { Charge } from "../../charge-types.js";
import unicornStatantSVG from "./unicorn-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const unicornStatant: Charge = {
  name: "unicorn statant",
  pluralName: "unicorns statant",
  SVG: unicornStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monster", "unicorn", "mythical"],
};

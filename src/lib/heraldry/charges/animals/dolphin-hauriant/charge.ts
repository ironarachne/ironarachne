import type { Charge } from "../../charge-types.js";
import dolphinHauriantSVG from "./dolphin-hauriant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const dolphinHauriant: Charge = {
  name: "dolphin hauriant",
  pluralName: "dolphins hauriant",
  SVG: dolphinHauriantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "dolphin", "water"],
};

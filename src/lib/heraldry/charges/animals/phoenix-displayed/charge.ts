import type { Charge } from "../../charge-types.js";
import phoenixDisplayedSVG from "./phoenix-displayed.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const phoenixDisplayed: Charge = {
  name: "phoenix displayed",
  pluralName: "phoenixes displayed",
  SVG: phoenixDisplayedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["phoenix", "displayed", "animals"],
};

import type { Charge } from "../../charge-types.js";
import batDisplayedSVG from "./bat-displayed.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const batDisplayed: Charge = {
  name: "bat displayed",
  pluralName: "bats displayed",
  SVG: batDisplayedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["bat", "displayed", "animals"],
};

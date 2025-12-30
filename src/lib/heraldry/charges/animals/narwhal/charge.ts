import type { Charge } from "../../charge-types.js";
import narwhalSVG from "./narwhal.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const narwhal: Charge = {
  name: "narwhal",
  pluralName: "narwhals",
  SVG: narwhalSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["narwhal", "animals"],
};

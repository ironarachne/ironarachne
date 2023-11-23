import * as RND from "@ironarachne/rng";
import type Charge from "./charge.js";
import * as Charges from "./charges.js";
import type Field from "./field.js";
import * as Fields from "./fields.js";
import type Tincture from "./tincture.js";
import * as Tinctures from "./tinctures.js";
import type Variation from "./variation.js";
import * as Variations from "./variations.js";

export default class HeraldryGeneratorConfig {
  chargeCount: number;
  chargeOptions: Charge[];
  chargeTinctures: Tincture[];
  fieldOptions: Field[];
  fieldTinctures1: Tincture[];
  fieldTinctures2: Tincture[];
  variationOptions: Variation[];
  width: number;
  height: number;

  constructor() {
    this.chargeCount = RND.item([0, 1, 2, 3]);
    this.chargeOptions = Charges.all();
    this.chargeTinctures = Tinctures.ofTypes(["metal", "color", "stain"]);
    this.fieldOptions = Fields.all();
    this.fieldTinctures1 = Tinctures.all();
    this.fieldTinctures2 = Tinctures.all();
    this.variationOptions = Variations.all();
    this.width = 600;
    this.height = 660;
  }
}

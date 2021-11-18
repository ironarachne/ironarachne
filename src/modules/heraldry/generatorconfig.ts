"use strict";

import Charge from "./charge";
import Field from "./field";
import Tincture from "./tincture";
import Variation from "./variation";

export default class GeneratorConfig {
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
    this.chargeCount = 0;
    this.chargeOptions = [];
    this.chargeTinctures = [];
    this.fieldOptions = [];
    this.fieldTinctures1 = [];
    this.fieldTinctures2 = [];
    this.variationOptions = [];
    this.width = 0;
    this.height = 0;
  }
}

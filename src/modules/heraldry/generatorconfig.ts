'use strict';

import Charge from './charge';
import Field from './field';
import Tincture from './tincture';
import Variation from './variation';
import * as Charges from './charges';
import * as Fields from './fields';
import * as RND from '../random';
import * as Tinctures from './tinctures';
import * as Variations from './variations';

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
    this.chargeTinctures = Tinctures.ofTypes(['metal', 'color', 'stain']);
    this.fieldOptions = Fields.all();
    this.fieldTinctures1 = Tinctures.all();
    this.fieldTinctures2 = Tinctures.all();
    this.variationOptions = Variations.all();
    this.width = 600;
    this.height = 660;
  }
}

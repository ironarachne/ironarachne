'use strict';

import * as Charges from './charges';
import * as Fields from './fields';
import * as Heraldry from './heraldry';
import * as RND from '../random';
import * as Tinctures from './tinctures';
import * as Variations from './variations';
import GeneratorConfig from './generatorconfig';

export default class HeraldryGenerator {
  config: GeneratorConfig;

  constructor() {
    this.config = this.generateConfig();
  }

  generate(heraldryWidth: number, heraldryHeight: number): Heraldry.Heraldry {
    this.config.width = heraldryWidth;
    this.config.height = heraldryHeight;

    return Heraldry.generate(this.config);
  }

  generateConfig(): GeneratorConfig {
    const charges = Charges.all();
    let chargeTincture = Tinctures.randomChargeTincture();
    let furCount = 0;
    let fieldTinctures1 = Tinctures.all();
    let fieldTinctures2 = Tinctures.all();
    let fields = Fields.all();
    let variations = Variations.all();

    let types1 = [];
    let types2 = [];

    if (chargeTincture.type == 'color' || chargeTincture.type == 'stain') {
      types1 = ['metal'];
      types2 = ['metal'];
    } else {
      types1 = ['color'];
      types2 = ['color'];

      if (RND.chance(100) > 70) {
        types1.push('stain');
      }
      if (RND.chance(100) > 80) {
        types2.push('stain');
      }
    }
    if (furCount === 0) {
      types1.push('furs');
    }
    fieldTinctures1 = Tinctures.ofTypes(types1);
    fieldTinctures2 = Tinctures.ofTypes(types2);

    let numberOfCharges = Heraldry.randomNumberOfCharges();

    let config = new GeneratorConfig();

    config.chargeCount = numberOfCharges;
    config.chargeOptions = charges;
    config.chargeTinctures = [chargeTincture];
    config.fieldOptions = fields;
    config.variationOptions = variations;
    config.fieldTinctures1 = fieldTinctures1;
    config.fieldTinctures2 = fieldTinctures2;

    return config;
  }
}
